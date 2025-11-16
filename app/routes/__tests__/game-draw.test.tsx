import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@react-router/node";
import type { GameStateEnvelope, DrawHistoryEntry, PrizeList } from "~/common/types";
import GameRoute, { action, loader, type LoaderData } from "~/routes/game";

vi.mock("react-custom-roulette", () => ({
  Wheel: () => null,
}));

vi.mock("~/common/contexts/PrizeContext", () => ({
  PrizeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const prizeManagerMock = vi.hoisted(() => ({
  prizes: [] as PrizeList,
  isLoading: false,
  isMutating: false,
  error: null as string | null,
  togglePrize: vi.fn(),
  refresh: vi.fn(),
  applyPrizes: vi.fn(),
}));

vi.mock("~/common/hooks/usePrizeManager", () => ({
  usePrizeManager: () => prizeManagerMock,
}));

const routerNodeMocks = vi.hoisted(() => ({
  json: vi.fn(
    (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      }),
  ),
}));

vi.mock("@react-router/node", async () => {
  const actual = await vi.importActual<typeof import("@react-router/node")>("@react-router/node");
  return {
    ...actual,
    json: routerNodeMocks.json,
  };
});

const createEnvelope = (): GameStateEnvelope => ({
  gameState: {
    currentNumber: 12,
    drawHistory: [
      { number: 8, sequence: 1, drawnAt: "2025-01-01T00:00:00.000Z" },
      { number: 12, sequence: 2, drawnAt: "2025-01-01T00:05:00.000Z" },
    ],
    isDrawing: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:05:00.000Z",
  },
  prizes: [],
  bgm: {
    enabled: true,
    volume: 0.6,
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
});

function createLoaderData(overrides?: Partial<LoaderData>): LoaderData {
  const envelope = createEnvelope();
  return {
    ...envelope,
    historyView: {
      recent: envelope.gameState.drawHistory.slice().reverse(),
      all: envelope.gameState.drawHistory,
    },
    availableNumbers: [1, 2, 3],
    ...overrides,
  };
}

const fetcherMock = {
  submit: vi.fn(),
  state: "idle" as const,
  data: null as any,
};

const loaderDataMock: LoaderData = createLoaderData();

const resetPrizeManager = () => {
  prizeManagerMock.prizes = [];
  prizeManagerMock.isLoading = false;
  prizeManagerMock.isMutating = false;
  prizeManagerMock.error = null;
  prizeManagerMock.togglePrize.mockReset();
  prizeManagerMock.refresh.mockReset();
  prizeManagerMock.applyPrizes.mockReset();
};

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useLoaderData: () => loaderDataMock,
    useFetcher: () => fetcherMock,
  };
});

const sessionMocks = vi.hoisted(() => ({
  startSession: vi.fn(),
  resumeSession: vi.fn(),
  persistSessionState: vi.fn(),
}));

vi.mock("~/common/services/sessionService", () => sessionMocks);

const historyMocks = vi.hoisted(() => ({
  getHistoryView: vi.fn(),
}));

vi.mock("~/common/services/historyService", () => historyMocks);

const engineMocks = vi.hoisted(() => {
  class LocalNoAvailableNumbersError extends Error {}
  return {
    drawNextNumber: vi.fn(),
    getAvailableNumbers: vi.fn(),
    NoAvailableNumbersError: LocalNoAvailableNumbersError,
  };
});

vi.mock("~/common/utils/bingoEngine", () => engineMocks);

describe("GameRoute component", () => {
  beforeEach(() => {
    fetcherMock.submit.mockReset();
    fetcherMock.state = "idle";
    fetcherMock.data = null;
    loaderDataMock.historyView = createLoaderData().historyView;
    loaderDataMock.availableNumbers = [1, 2, 3];
    loaderDataMock.gameState = createEnvelope().gameState;
    resetPrizeManager();
  });

  it("renders current number and history entries", () => {
    render(<GameRoute />);

    expect(screen.getByText("現在の当選番号")).toBeInTheDocument();
    expect(screen.getByText("直近の当選番号")).toBeInTheDocument();
    expect(screen.getAllByText("12").length).toBeGreaterThan(0);
  });

  it("submits draw intent when pressing 抽選開始", () => {
    render(<GameRoute />);

    fireEvent.click(screen.getByRole("button", { name: "抽選開始" }));

    expect(fetcherMock.submit).toHaveBeenCalledWith(
      { intent: "draw" },
      expect.objectContaining({ method: "post" }),
    );
  });

  it("opens modal when clicking history button", () => {
    render(<GameRoute />);

    fireEvent.click(screen.getByRole("button", { name: "これまでの当選番号を見る" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("game loader", () => {
  const envelope = createEnvelope();
  const historyPayload = {
    recent: envelope.gameState.drawHistory.slice(-2) as DrawHistoryEntry[],
    all: envelope.gameState.drawHistory,
  };

  beforeEach(() => {
    sessionMocks.resumeSession.mockReset();
    sessionMocks.startSession.mockReset();
    historyMocks.getHistoryView.mockReset();
    engineMocks.getAvailableNumbers.mockReset();
    resetPrizeManager();
  });

  it("falls back to startSession when resumeSession returns null", async () => {
    sessionMocks.resumeSession.mockResolvedValue(null);
    sessionMocks.startSession.mockResolvedValue(envelope);
    historyMocks.getHistoryView.mockResolvedValue(historyPayload);
    engineMocks.getAvailableNumbers.mockReturnValue([1, 2, 3]);

    const response = await loader({} as LoaderFunctionArgs);
    const data = await response.json();

    expect(sessionMocks.startSession).toHaveBeenCalled();
    expect(data.availableNumbers).toEqual([1, 2, 3]);
    expect(data.historyView).toEqual(historyPayload);
  });
});

describe("game action", () => {
  const envelope = createEnvelope();
  const historyPayload = {
    recent: envelope.gameState.drawHistory.slice(-2) as DrawHistoryEntry[],
    all: envelope.gameState.drawHistory,
  };

  beforeEach(() => {
    sessionMocks.resumeSession.mockReset();
    sessionMocks.startSession.mockReset();
    sessionMocks.persistSessionState.mockReset();
    historyMocks.getHistoryView.mockReset();
    engineMocks.getAvailableNumbers.mockReset();
    engineMocks.drawNextNumber.mockReset();
    resetPrizeManager();
  });

  const buildRequest = (intent: string) =>
    new Request("http://localhost/game", {
      method: "POST",
      body: new URLSearchParams({ intent }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

  it("persists updated state after drawing", async () => {
    const nextGameState = {
      ...envelope.gameState,
      currentNumber: 20,
      drawHistory: [
        ...envelope.gameState.drawHistory,
        { number: 20, sequence: 3, drawnAt: "2025-01-01T00:10:00.000Z" },
      ],
    };
    sessionMocks.resumeSession.mockResolvedValue(envelope);
    historyMocks.getHistoryView.mockResolvedValue(historyPayload);
    engineMocks.drawNextNumber.mockReturnValue(nextGameState);
    engineMocks.getAvailableNumbers.mockReturnValue([1]);

    const response = await action({ request: buildRequest("draw") } as ActionFunctionArgs);
    const data = await response.json();

    expect(sessionMocks.persistSessionState).toHaveBeenCalledWith({
      ...envelope,
      gameState: nextGameState,
    });
    expect(data.gameState.currentNumber).toBe(20);
    expect(data.availableNumbers).toEqual([1]);
  });

  it("returns 409 when all numbers are drawn", async () => {
    sessionMocks.resumeSession.mockResolvedValue(envelope);
    engineMocks.drawNextNumber.mockImplementation(() => {
      throw new engineMocks.NoAvailableNumbersError();
    });

    const response = await action({ request: buildRequest("draw") } as ActionFunctionArgs);
    expect(response.status).toBe(409);
    const payload = await response.json();
    expect(payload.error).toBe("no-available-numbers");
  });

  it("returns 400 for unsupported intents", async () => {
    const response = await action({ request: buildRequest("noop") } as ActionFunctionArgs);
    expect(response.status).toBe(400);
  });
});

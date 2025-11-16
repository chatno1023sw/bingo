import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { LoaderFunctionArgs } from "@react-router/node";
import StartRoute, { action } from "~/routes/start";
import type { GameStateEnvelope } from "~/common/types";

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
  redirect: vi.fn(
    (location: string, init?: number | ResponseInit) =>
      new Response(null, {
        status: typeof init === "number" ? init : init?.status ?? 302,
        headers: {
          Location: location,
          ...((typeof init === "object" && init?.headers) || {}),
        },
      }),
  ),
}));

vi.mock("@react-router/node", async () => {
  const actual = await vi.importActual<typeof import("@react-router/node")>(
    "@react-router/node",
  );
  return {
    ...actual,
    json: routerNodeMocks.json,
    redirect: routerNodeMocks.redirect,
  };
});

const submitSpy = vi.fn();
type NavigationState = "idle" | "submitting" | "loading";
const navigationState = { state: "idle" as NavigationState };

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useSubmit: () => submitSpy,
    useNavigation: () => navigationState,
  };
});

const sessionServiceMocks = vi.hoisted(() => ({
  startSession: vi.fn(),
  resumeSession: vi.fn(),
}));

vi.mock("~/common/services/sessionService", () => sessionServiceMocks);

const mockStartSession = sessionServiceMocks.startSession;
const mockResumeSession = sessionServiceMocks.resumeSession;

const baseEnvelope: GameStateEnvelope = {
  gameState: {
    currentNumber: null,
    drawHistory: [],
    isDrawing: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  prizes: [],
  bgm: {
    enabled: true,
    volume: 0.6,
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
};

const createRequest = (intent: string) => {
  const body = new URLSearchParams({ intent });
  return new Request("http://localhost/start", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

describe("StartRoute component", () => {
  beforeEach(() => {
    submitSpy.mockReset();
    navigationState.state = "idle";
    routerNodeMocks.json.mockClear();
    routerNodeMocks.redirect.mockClear();
  });

  it("submits with start intent when pressing はじめから", () => {
    render(<StartRoute />);

    fireEvent.click(screen.getByRole("button", { name: "はじめから" }));

    expect(submitSpy).toHaveBeenCalledWith(
      { intent: "start" },
      expect.objectContaining({ method: "post" }),
    );
  });

  it("opens resume dialog and dispatches resume intent after confirmation", () => {
    render(<StartRoute />);

    fireEvent.click(screen.getByRole("button", { name: "続きから" }));
    expect(
      screen.getByText("前回の状態を復元しますか？"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "復元する" }));

    expect(submitSpy).toHaveBeenCalledWith(
      { intent: "resume" },
      expect.objectContaining({ method: "post" }),
    );
  });

  it("navigates to setting when pressing 設定", () => {
    render(<StartRoute />);

    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(submitSpy).toHaveBeenCalledWith(
      { intent: "setting" },
      expect.objectContaining({ method: "post" }),
    );
  });
});

describe("start action", () => {
  beforeEach(() => {
    mockStartSession.mockReset();
    mockResumeSession.mockReset();
    mockStartSession.mockResolvedValue(baseEnvelope);
    mockResumeSession.mockResolvedValue(baseEnvelope);
    routerNodeMocks.json.mockClear();
    routerNodeMocks.redirect.mockClear();
  });

  it("initializes a new session when intent is start", async () => {
    const response = await action({ request: createRequest("start") } as LoaderFunctionArgs);

    expect(mockStartSession).toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/game");
  });

  it("restores session when resume returns data", async () => {
    const response = await action({ request: createRequest("resume") } as LoaderFunctionArgs);

    expect(mockResumeSession).toHaveBeenCalled();
    expect(mockStartSession).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/game");
  });

  it("falls back to startSession when resume returns null", async () => {
    mockResumeSession.mockResolvedValueOnce(null);

    const response = await action({ request: createRequest("resume") } as LoaderFunctionArgs);

    expect(mockResumeSession).toHaveBeenCalled();
    expect(mockStartSession).toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/game");
  });

  it("redirects to /setting when intent is setting", async () => {
    const response = await action({ request: createRequest("setting") } as LoaderFunctionArgs);

    expect(response.headers.get("Location")).toBe("/setting");
  });

  it("returns 400 for unsupported intent", async () => {
    const response = await action({ request: createRequest("unknown") } as LoaderFunctionArgs);
    expect(response.status).toBe(400);
  });
});

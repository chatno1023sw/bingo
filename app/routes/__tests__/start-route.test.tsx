import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ActionFunctionArgs } from "react-router";
import StartRoute, { action } from "~/routes/start";
import type { GameStateEnvelope } from "~/common/types";

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
  });

  it("renders BGM toggle button", async () => {
    render(<StartRoute />);

    expect(await screen.findByRole("button", { name: "BGM をオフにする" })).toBeInTheDocument();
  });

  it("disables BGM toggle while submitting", async () => {
    navigationState.state = "submitting";

    render(<StartRoute />);

    expect(await screen.findByRole("button", { name: "BGM をオフにする" })).toBeDisabled();
  });

  it("submits with start intent when pressing はじめから", async () => {
    render(<StartRoute />);

    fireEvent.click(await screen.findByRole("button", { name: "はじめから" }));

    expect(submitSpy).toHaveBeenCalledWith(
      { intent: "start" },
      expect.objectContaining({ method: "post" }),
    );
  });

  it("opens resume dialog and dispatches resume intent after confirmation", async () => {
    render(<StartRoute />);

    fireEvent.click(await screen.findByRole("button", { name: "続きから" }));
    expect(await screen.findByText("前回の状態を復元しますか？")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: "復元する" }));

    expect(submitSpy).toHaveBeenCalledWith(
      { intent: "resume" },
      expect.objectContaining({ method: "post" }),
    );
  });

  it("navigates to setting when pressing 設定", async () => {
    render(<StartRoute />);

    fireEvent.click(await screen.findByRole("button", { name: "設定" }));

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
  });

  it("initializes a new session when intent is start", async () => {
    const response = await action({ request: createRequest("start") } as ActionFunctionArgs);

    expect(mockStartSession).toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/game");
  });

  it("restores session when resume returns data", async () => {
    const response = await action({ request: createRequest("resume") } as ActionFunctionArgs);

    expect(mockResumeSession).toHaveBeenCalled();
    expect(mockStartSession).not.toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/game");
  });

  it("falls back to startSession when resume returns null", async () => {
    mockResumeSession.mockResolvedValueOnce(null);

    const response = await action({ request: createRequest("resume") } as ActionFunctionArgs);

    expect(mockResumeSession).toHaveBeenCalled();
    expect(mockStartSession).toHaveBeenCalled();
    expect(response.headers.get("Location")).toBe("/game");
  });

  it("redirects to /setting when intent is setting", async () => {
    const response = await action({ request: createRequest("setting") } as ActionFunctionArgs);

    expect(response.headers.get("Location")).toBe("/setting");
  });

  it("returns 400 for unsupported intent", async () => {
    const response = await action({ request: createRequest("unknown") } as ActionFunctionArgs);
    expect(response.status).toBe(400);
  });
});

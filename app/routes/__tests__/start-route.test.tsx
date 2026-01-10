import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StartView } from "~/components/start/StartView";
import {
  hasStoredDrawHistory,
  hasStoredGameState,
  hasStoredPrizeSelection,
  resumeSession,
  startSession,
} from "~/common/services/sessionService";

vi.mock("~/common/services/sessionService", () => ({
  startSession: vi.fn(),
  resumeSession: vi.fn(),
  hasStoredDrawHistory: vi.fn(),
  hasStoredGameState: vi.fn(),
  hasStoredPrizeSelection: vi.fn(),
}));

vi.mock("~/common/hooks/useBgmPreference", () => ({
  useBgmPreference: () => ({
    preference: { enabled: true, volume: 0.6, updatedAt: "2025-01-01T00:00:00.000Z" },
    isReady: true,
    toggle: vi.fn(),
    setVolume: vi.fn(),
    error: null,
  }),
}));

vi.mock("howler", () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(() => 1),
    stop: vi.fn(),
    volume: vi.fn(),
    unload: vi.fn(),
  })),
}));

/**
 * テスト用のセッションデータを生成します。
 */
const createEnvelope = () => ({
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
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(hasStoredDrawHistory).mockReturnValue(false);
  vi.mocked(hasStoredGameState).mockReturnValue(false);
  vi.mocked(hasStoredPrizeSelection).mockReturnValue(false);
});

describe("start route client flow", () => {
  test("はじめからでセッションを開始して遷移する", async () => {
    const user = userEvent.setup();
    vi.mocked(startSession).mockResolvedValue(createEnvelope());
    const onShowGame = vi.fn();

    render(<StartView onShowGame={onShowGame} onNavigateSetting={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "はじめから" }));

    expect(startSession).toHaveBeenCalledTimes(1);
    expect(onShowGame).toHaveBeenCalled();
  });

  test("続きからで復元を実行して遷移する", async () => {
    const user = userEvent.setup();
    vi.mocked(resumeSession).mockResolvedValue(createEnvelope());
    const onShowGame = vi.fn();

    render(<StartView onShowGame={onShowGame} onNavigateSetting={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "続きから" }));
    await user.click(screen.getByRole("button", { name: "復元する" }));

    expect(resumeSession).toHaveBeenCalledTimes(1);
    expect(onShowGame).toHaveBeenCalled();
  });
});
vi.mock("~/common/utils/audioUnlock", () => ({
  consumeStartBgmUnlock: vi.fn(() => false),
  markGameBgmUnlock: vi.fn(),
}));

vi.mock("~/common/utils/audioNoticeState", () => ({
  hasAudioNoticeAcknowledged: vi.fn(() => true),
  markAudioNoticeAcknowledged: vi.fn(),
}));

vi.mock("~/common/services/soundDetailPreferenceService", () => ({
  muteSoundDetailPreference: vi.fn(),
  resetSoundDetailPreference: vi.fn(),
}));

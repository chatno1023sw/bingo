import { act, fireEvent, render, screen } from "@testing-library/react";
import { audioPaths } from "~/common/constants/audio";
import { resumeSession, startSession, persistSessionState } from "~/common/services/sessionService";
import { getHistoryView } from "~/common/services/historyService";
import { drawNextNumber, getAvailableNumbers } from "~/common/utils/bingoEngine";
import { SoundProvider } from "~/common/contexts/SoundContext";
import { GameContent } from "~/components/game/GameContent";

const navigateMock = vi.fn();
const howlOptionsBySrc = new Map<
  string,
  {
    onend?: () => void;
    onstop?: () => void;
    onloaderror?: () => void;
    onplayerror?: () => void;
  }
>();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("~/common/hooks/useBgmPreference", () => ({
  useBgmPreference: () => ({
    preference: { enabled: true, volume: 0.6, updatedAt: "2025-01-01T00:00:00.000Z" },
    isReady: true,
    toggle: vi.fn(),
    setVolume: vi.fn(),
    error: null,
  }),
}));

vi.mock("~/common/services/sessionService", () => ({
  resumeSession: vi.fn(),
  startSession: vi.fn(),
  persistSessionState: vi.fn(),
}));

vi.mock("~/common/services/historyService", () => ({
  getHistoryView: vi.fn(),
}));

vi.mock("~/common/utils/bingoEngine", () => ({
  drawNextNumber: vi.fn(),
  getAvailableNumbers: vi.fn(),
  NoAvailableNumbersError: class NoAvailableNumbersError extends Error {},
}));

vi.mock("howler", () => ({
  Howl: vi.fn().mockImplementation((options) => {
    const src = Array.isArray(options.src) ? options.src[0] : options.src;
    if (typeof src === "string") {
      howlOptionsBySrc.set(src, options);
    }
    return {
      play: vi.fn(() => 1),
      volume: vi.fn(),
      stop: vi.fn(),
      seek: vi.fn(),
      unload: vi.fn(),
    };
  }),
}));

/**
 * テスト用のセッションデータを生成します。
 */
const createEnvelope = () => ({
  gameState: {
    currentNumber: 10,
    drawHistory: [
      {
        number: 1,
        sequence: 1,
        drawnAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    isDrawing: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  prizes: [
    {
      id: "p-1",
      order: 0,
      prizeName: "テスト賞",
      itemName: "テスト景品",
      imagePath: null,
      selected: false,
      memo: null,
    },
  ],
  bgm: {
    enabled: true,
    volume: 0.6,
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
});

/**
 * テスト用の履歴表示データを生成します。
 */
const createHistoryView = () => [
  {
    number: 1,
    sequence: 1,
    drawnAt: "2025-01-01T00:00:00.000Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  navigateMock.mockClear();
  howlOptionsBySrc.clear();
});

describe("game route client flow", () => {
  test("初期読み込みで現在状態を描画する", async () => {
    vi.mocked(resumeSession).mockResolvedValue(createEnvelope());
    vi.mocked(startSession).mockResolvedValue(createEnvelope());
    vi.mocked(getHistoryView).mockResolvedValue(createHistoryView());
    vi.mocked(getAvailableNumbers).mockReturnValue([2, 3]);

    render(
      <SoundProvider enabled>
        <GameContent />
      </SoundProvider>,
    );

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    expect(await screen.findByText("残り 2 / 75")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("抽選で番号と残数が更新される", async () => {
    const initial = createEnvelope();
    const nextGameState = {
      ...initial.gameState,
      currentNumber: 20,
      drawHistory: [
        ...initial.gameState.drawHistory,
        {
          number: 20,
          sequence: 2,
          drawnAt: "2025-01-01T00:00:01.000Z",
        },
      ],
      updatedAt: "2025-01-01T00:00:01.000Z",
    };

    vi.mocked(resumeSession).mockResolvedValue(initial);
    vi.mocked(startSession).mockResolvedValue(initial);
    vi.mocked(drawNextNumber).mockReturnValue(nextGameState);
    vi.mocked(persistSessionState).mockResolvedValue();
    vi.mocked(getHistoryView)
      .mockResolvedValueOnce(createHistoryView())
      .mockResolvedValueOnce([
        {
          number: 1,
          sequence: 1,
          drawnAt: "2025-01-01T00:00:00.000Z",
        },
        {
          number: 20,
          sequence: 2,
          drawnAt: "2025-01-01T00:00:01.000Z",
        },
      ]);
    vi.mocked(getAvailableNumbers).mockReturnValueOnce([2, 3]).mockReturnValueOnce([3]);

    render(
      <SoundProvider enabled>
        <GameContent />
      </SoundProvider>,
    );

    await screen.findByText("残り 2 / 75");

    fireEvent.click(screen.getByRole("button", { name: "抽選を開始！" }));
    await act(async () => {
      howlOptionsBySrc.get(`/${audioPaths.se.drumroll}`)?.onend?.();
    });
    await act(async () => {});

    expect(screen.getByText("残り 1 / 75")).toBeInTheDocument();
    expect(drawNextNumber).toHaveBeenCalledTimes(1);
  });
});

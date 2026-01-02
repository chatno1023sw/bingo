import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StartRoute from "~/routes/start";
import { resumeSession, startSession } from "~/common/services/sessionService";

const navigateMock = vi.fn();

vi.mock("react-router", async () => {
	const actual = await vi.importActual<typeof import("react-router")>("react-router");
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

vi.mock("~/common/services/sessionService", () => ({
	startSession: vi.fn(),
	resumeSession: vi.fn(),
}));

vi.mock("~/common/hooks/useBgmPreference", () => ({
	useBgmPreference: () => ({
		preference: { enabled: true, volume: 0.6, updatedAt: "2025-01-01T00:00:00.000Z" },
		isReady: true,
		toggle: vi.fn(),
		error: null,
	}),
}));

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
	navigateMock.mockClear();
});

describe("start route client flow", () => {
	test("はじめからでセッションを開始して遷移する", async () => {
		const user = userEvent.setup();
		vi.mocked(startSession).mockResolvedValue(createEnvelope());

		render(<StartRoute />);

		await user.click(screen.getByRole("button", { name: "はじめから" }));

		expect(startSession).toHaveBeenCalledTimes(1);
		expect(navigateMock).toHaveBeenCalledWith("/game");
	});

	test("続きからで復元を実行して遷移する", async () => {
		const user = userEvent.setup();
		vi.mocked(resumeSession).mockResolvedValue(createEnvelope());

		render(<StartRoute />);

		await user.click(screen.getByRole("button", { name: "続きから" }));
		await user.click(screen.getByRole("button", { name: "復元する" }));

		expect(resumeSession).toHaveBeenCalledTimes(1);
		expect(navigateMock).toHaveBeenCalledWith("/game");
	});
});

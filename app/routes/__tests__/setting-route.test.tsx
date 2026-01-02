import { render, screen } from "@testing-library/react";
import SettingRoute from "~/routes/setting";
import { getPrizes, savePrizes, togglePrize } from "~/common/services/prizeService";

const navigateMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("~/common/services/prizeService", () => ({
  getPrizes: vi.fn(),
  savePrizes: vi.fn(),
  togglePrize: vi.fn(),
}));

const createPrizes = () => [
  {
    id: "p-1",
    order: 0,
    prizeName: "テスト賞",
    itemName: "テスト景品",
    imagePath: null,
    selected: false,
    memo: null,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  navigateMock.mockClear();
});

describe("setting route client flow", () => {
  test("保存済みの景品一覧を描画する", async () => {
    vi.mocked(getPrizes).mockResolvedValue(createPrizes());
    vi.mocked(savePrizes).mockResolvedValue();
    vi.mocked(togglePrize).mockResolvedValue(createPrizes());

    render(<SettingRoute />);

    expect(await screen.findByDisplayValue("テスト賞")).toBeInTheDocument();
  });
});

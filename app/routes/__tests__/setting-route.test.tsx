import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LoaderFunctionArgs } from "react-router";
import SettingRoute, { loader } from "~/routes/setting";
import type { PrizeList } from "~/common/types";

const basePrizes: PrizeList = [
  {
    id: "p-1",
    order: 0,
    prizeName: "一等",
    itemName: "Switch",
    imagePath: null,
    selected: false,
    memo: null,
  },
  {
    id: "p-2",
    order: 1,
    prizeName: "二等",
    itemName: "ギフトカード",
    imagePath: null,
    selected: false,
    memo: null,
  },
];

const reactRouterMocks = vi.hoisted(() => ({
  useLoaderData: vi.fn(),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useLoaderData: reactRouterMocks.useLoaderData,
  };
});

vi.mock("~/common/contexts/PrizeContext", () => ({
  PrizeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const prizeManagerMock = vi.hoisted(() => ({
  prizes: [] as PrizeList,
  isLoading: false,
  isMutating: false,
  error: null as string | null,
  applyPrizes: vi.fn(),
}));

vi.mock("~/common/hooks/usePrizeManager", () => ({
  usePrizeManager: () => prizeManagerMock,
}));

const prizeServiceMocks = vi.hoisted(() => ({
  getPrizes: vi.fn(async () => basePrizes),
}));

vi.mock("~/common/services/prizeService", () => prizeServiceMocks);

const csvParserMocks = vi.hoisted(() => ({
  parsePrizesCsv: vi.fn(() => ({ prizes: basePrizes, skipped: [] })),
  generatePrizesCsv: vi.fn(() => "csv"),
}));

vi.mock("~/common/utils/csvParser", () => csvParserMocks);

describe("SettingRoute component", () => {
  beforeEach(() => {
    prizeManagerMock.prizes = basePrizes;
    prizeManagerMock.isLoading = false;
    prizeManagerMock.isMutating = false;
    prizeManagerMock.error = null;
    prizeManagerMock.applyPrizes.mockReset();
    prizeManagerMock.applyPrizes.mockResolvedValue(undefined);
    reactRouterMocks.useLoaderData.mockReturnValue({ prizes: basePrizes });
    csvParserMocks.parsePrizesCsv.mockReset();
    csvParserMocks.parsePrizesCsv.mockReturnValue({ prizes: basePrizes, skipped: [] });
  });

  it("renders prize list", () => {
    render(<SettingRoute />);

    expect(screen.getByText("景品マスタ管理")).toBeInTheDocument();
    expect(screen.getByTestId("setting-prize-list")).toBeInTheDocument();
    expect(screen.getByText("一等")).toBeInTheDocument();
  });

  it("applies prizes after CSV import", async () => {
    render(<SettingRoute />);
    const user = userEvent.setup();
    const textarea = screen.getByLabelText("CSV 貼り付け");

    await user.clear(textarea);
    await user.type(
      textarea,
      "id,order,prizeName,itemName,imagePath,selected,memo\np-2,1,二等,ギフト券,,false,",
    );

    await user.click(screen.getByRole("button", { name: "貼り付け内容を取り込む" }));

    await waitFor(() => expect(prizeManagerMock.applyPrizes).toHaveBeenCalled());
  });

  it("removes all prizes when clicking delete button", async () => {
    render(<SettingRoute />);

    fireEvent.click(screen.getByRole("button", { name: "すべて削除" }));

    await waitFor(() => expect(prizeManagerMock.applyPrizes).toHaveBeenCalledWith([]));
  });

  it("reorders prizes when pressing 上へ移動", async () => {
    render(<SettingRoute />);

    fireEvent.click(screen.getAllByRole("button", { name: "上へ移動" })[1]);

    await waitFor(() => expect(prizeManagerMock.applyPrizes).toHaveBeenCalled());
    const reordered = prizeManagerMock.applyPrizes.mock.calls[0][0] as PrizeList;
    expect(reordered[0].id).toBe("p-2");
  });
});

describe("setting loader", () => {
  it("fetches prizes via prizeService", async () => {
    prizeServiceMocks.getPrizes.mockResolvedValueOnce(basePrizes);

    const data = await loader({} as LoaderFunctionArgs);

    expect(prizeServiceMocks.getPrizes).toHaveBeenCalled();
    expect(data.prizes).toHaveLength(2);
  });
});

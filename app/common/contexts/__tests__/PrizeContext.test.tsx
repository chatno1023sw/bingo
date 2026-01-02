import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import type { PrizeList } from "~/common/types";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";

const serviceMocks = vi.hoisted(() => ({
  getPrizes: vi.fn<() => Promise<PrizeList>>(),
  togglePrize: vi.fn<(id: string, selected: boolean) => Promise<PrizeList>>(),
  savePrizes: vi.fn<(prizes: PrizeList) => Promise<void>>(),
}));

vi.mock("~/common/services/prizeService", () => serviceMocks);

const basePrizes: PrizeList = [
  {
    id: "p-1",
    order: 0,
    prizeName: "一等",
    itemName: "旅行券",
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
    selected: true,
    memo: null,
  },
];

const Consumer = () => {
  const { prizes, isLoading, togglePrize } = usePrizeManager();
  return (
    <div>
      <p data-testid="loading">{isLoading ? "loading" : "ready"}</p>
      <p data-testid="prize-count">{prizes.length}</p>
      <p data-testid="first-selected">{prizes[0]?.selected ? "selected" : "pending"}</p>
      <button type="button" onClick={() => togglePrize(prizes[0]?.id ?? "p-1")}>
        toggle
      </button>
    </div>
  );
};

describe("PrizeProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("uses initial prizes without triggering fetch", () => {
    render(
      <PrizeProvider initialPrizes={basePrizes}>
        <Consumer />
      </PrizeProvider>,
    );

    expect(screen.getByTestId("loading").textContent).toBe("ready");
    expect(screen.getByTestId("prize-count").textContent).toBe("2");
    expect(serviceMocks.getPrizes).not.toHaveBeenCalled();
  });

  it("fetches prizes on mount when initial data is absent", async () => {
    serviceMocks.getPrizes.mockResolvedValueOnce(basePrizes);

    render(
      <PrizeProvider>
        <Consumer />
      </PrizeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("prize-count").textContent).toBe("2"));
    expect(serviceMocks.getPrizes).toHaveBeenCalled();
    expect(screen.getByTestId("loading").textContent).toBe("ready");
  });

  it("updates selection state after toggle", async () => {
    const updated: PrizeList = [{ ...basePrizes[0], selected: true }, basePrizes[1]];
    serviceMocks.togglePrize.mockResolvedValue(updated);

    render(
      <PrizeProvider initialPrizes={basePrizes}>
        <Consumer />
      </PrizeProvider>,
    );

    fireEvent.click(screen.getByText("toggle"));

    await waitFor(() => expect(screen.getByTestId("first-selected").textContent).toBe("selected"));
    expect(serviceMocks.togglePrize).toHaveBeenCalledWith("p-1", true);
  });
});

import { describe, it, expect } from "vitest";
import type { PrizeList } from "~/common/types";
import { parsePrizesCsv, generatePrizesCsv } from "../csvParser";

const sampleCsv =
  "id,order,prizeName,itemName,imagePath,selected,memo\np-1,0,一等,Switch,,true,豪華賞品\np-2,1,二等,ギフトカード,,false,";

describe("parsePrizesCsv", () => {
  it("parses valid CSV rows into PrizeList", () => {
    const result = parsePrizesCsv(sampleCsv);

    expect(result.prizes).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
    expect(result.prizes[0]).toMatchObject({
      id: "p-1",
      order: 0,
      prizeName: "一等",
      itemName: "Switch",
      selected: true,
      memo: "豪華賞品",
    });
  });

  it("skips rows with missing required fields", () => {
    const invalidCsv =
      "id,order,prizeName,itemName,imagePath,selected,memo\np-1,0,一等,Switch,,true,\np-1,1,,, ,false,";

    const result = parsePrizesCsv(invalidCsv);

    expect(result.prizes).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toContain("missing");
  });

  it("rejects duplicate ids", () => {
    const csv =
      "id,order,prizeName,itemName,imagePath,selected,memo\np-1,0,一等,Switch,,true,\np-1,1,二等,ギフト券,,false,";

    const result = parsePrizesCsv(csv);

    expect(result.prizes).toHaveLength(1);
    expect(result.skipped[0]).toMatchObject({ id: "p-1" });
  });

  it("accepts numeric boolean and trims values", () => {
    const csv =
      "id,order,prizeName,itemName,imagePath,selected,memo\np-3,5, 三等 , カタログギフト , ,1, ";
    const result = parsePrizesCsv(csv);

    expect(result.prizes[0]).toMatchObject({
      id: "p-3",
      order: 0,
      prizeName: "三等",
      itemName: "カタログギフト",
      selected: true,
    });
  });
});

describe("generatePrizesCsv", () => {
  it("generates CSV text with header and quoted fields", () => {
    const prizes: PrizeList = [
      {
        id: "p,1",
        order: 0,
        prizeName: "一等",
        itemName: "Switch",
        imagePath: null,
        selected: true,
        memo: "豪華,特別",
      },
    ];

    const csv = generatePrizesCsv(prizes);

    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe("id,order,prizeName,itemName,imagePath,selected,memo");
    expect(lines[1]).toContain('"p,1"');
    expect(lines[1]).toContain('"豪華,特別"');
  });
});

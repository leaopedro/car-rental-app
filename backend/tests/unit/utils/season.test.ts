import { describe, it, expect } from "vitest";
import { getSeason } from "../../../src/utils/";
import type { Season } from "../../../src/models/types";

function mk(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

describe("getSeason util", () => {
  const cases: Array<[[number, number, number], Season]> = [
    [[2025, 6, 1], "peak"],
    [[2025, 7, 15], "peak"],
    [[2025, 8, 31], "peak"],
    [[2025, 9, 15], "peak"],

    [[2025, 3, 1], "mid"],
    [[2025, 5, 31], "mid"],
    [[2025, 9, 16], "mid"],
    [[2025, 10, 31], "mid"],

    [[2025, 11, 1], "off"],
    [[2025, 12, 31], "off"],
    [[2025, 1, 15], "off"],
    [[2025, 2, 28], "off"],

    [[2024, 2, 29], "off"],
  ];

  for (const [[y, m, d], expected] of cases) {
    it(`returns "${expected}" for ${y}-${m}-${d}`, () => {
      const date = mk(y, m, d);
      expect(getSeason(date)).toBe(expected);
    });
  }
});

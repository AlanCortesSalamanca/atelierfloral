import { describe, expect, it } from "vitest";
import { formatCurrency } from "./currency";

describe("formatCurrency", () => {
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats integer", () => {
    expect(formatCurrency(150)).toBe("$150.00");
  });

  it("formats with decimals", () => {
    expect(formatCurrency(99.5)).toBe("$99.50");
  });

  it("formats thousands", () => {
    expect(formatCurrency(1250)).toBe("$1,250.00");
  });

  it("formats large numbers", () => {
    expect(formatCurrency(25000)).toBe("$25,000.00");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-10)).toBe("-$10.00");
  });
});

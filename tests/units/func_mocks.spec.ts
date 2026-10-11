import { describe, expect, it, vi } from "vitest";

describe("v1.fn() fundamentals", () => {
  it("tracks execution details and controls return sequences", async () => {
    // Setup a mock function with chained returned values
    const mockTaxCalculator = vi
      .fn<(amount: number, country: string) => number>()
      .mockReturnValueOnce(5.0)
      .mockReturnValueOnce(8.0)
      .mockReturnValue(0.0);

    const call1 = mockTaxCalculator(50, "US");
    const call2 = mockTaxCalculator(100, "CA");
    const call3 = mockTaxCalculator(20, "MX");

    expect(call1).toBe(5.0);
    expect(call2).toBe(8.0);
    expect(call3).toBe(0.0);

    // Assert interaction details

    expect(mockTaxCalculator).toHaveBeenCalledTimes(3);
    expect(mockTaxCalculator).toHaveBeenNthCalledWith(1, 50, "US");
    expect(mockTaxCalculator).toHaveBeenNthCalledWith(2, 100, "CA");
    expect(mockTaxCalculator).toHaveBeenNthCalledWith(3, 20, "MX");
  });
});

import { describe, it, expect } from "vitest";
import { calculateLineItem, LineItem } from "./calculatePrice";

describe("Test the CalculatePrice Function", () => {
  describe("Standard calculations", () => {
    it("Computes subtotal and tax correctly for a taxable item", () => {
      // Arrange - Defime the input
      let lineTtem: LineItem = {
        id: "ORD-8139",
        quantity: 5,
        taxable: true,
        unitPriceCents: 1000,
      };

      // Act - Execute the target function passing the input
      const itemSummary = calculateLineItem(lineTtem);

      // Assert - Verify that the output of the function matches with the expected results;
      expect(itemSummary.subtotalCents).toBe(5000);
      expect(itemSummary.taxCents).toBe(413);
      expect(itemSummary.totalCents).toBe(5413);
    });

    it("Bypasses tax when item is not taxable", () => {
      let lineTtem: LineItem = {
        id: "ORD-8139",
        quantity: 5,
        taxable: false,
        unitPriceCents: 1000,
      };

      const itemSummary = calculateLineItem(lineTtem);

      expect(itemSummary.subtotalCents).toBe(5000);
      expect(itemSummary.taxCents).toBe(0);
      expect(itemSummary.totalCents).toBe(5000);
    });
  });

  describe("Validations and Edge Cases", () => {
    it("throws an error when quantity is <= zero", () => {
      let invalidLineTtem: LineItem = {
        id: "ORD-8139",
        quantity: -3,
        taxable: false,
        unitPriceCents: 1000,
      };

      expect(() => calculateLineItem(invalidLineTtem)).toThrow(
        /Quantity must be a positive integer/,
      );
    });

    it("throws an error when unit price is less than zero", () => {
      let invalidLineTtem: LineItem = {
        id: "ORD-8139",
        quantity: 1,
        taxable: false,
        unitPriceCents: -5,
      };

      expect(() => calculateLineItem(invalidLineTtem)).toThrow(
        /Unit price cannot be negative/,
      );
    });
  });
});

describe("Run deep checks", () => {
  it("compares two objects", () => {
    const received = { id: "usr_1", roles: ["admin"], metadata: undefined };
    const expected = { id: "usr_1", roles: ["admin"] };

    // PASSES: toEqual treats undefined keys as equal to omitted keys
    expect(received).toEqual(expected);

    // FAILS: toStrictEqual notices the explicit metadata: undefined property
    // expect(received).toStrictEqual(expected);
  });
});

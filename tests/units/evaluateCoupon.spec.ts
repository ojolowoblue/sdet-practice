import { describe, expect, it } from "vitest";
import { applyDiscount, CouponRule } from "./evaluateCoupon";

describe("Standard Coupon Test", () => {
  let coupon: CouponRule = {
    code: "SUMMER26",
    discountPercentage: 20,
    minOrderValueCents: 5000,
  };

  const testCases = [
    {
      description: "subtotal exactly at threshold",
      subtotalCents: 5000,
      expectedValid: true,
      expectedDiscountCents: 1000, // 20% of $50
    },
    {
      description: "subtotal well above threshold",
      subtotalCents: 12000,
      expectedValid: true,
      expectedDiscountCents: 2400, // 20% of $120
    },
    {
      description: "subtotal 1 cent below threshold",
      subtotalCents: 4999,
      expectedValid: false,
      expectedDiscountCents: 0,
    },
    {
      description: "zero subtotal",
      subtotalCents: 0,
      expectedValid: false,
      expectedDiscountCents: 0,
    },
  ];

  it.each(testCases)(
    "evaluates $description (subtotal: $subtotalCents)",
    ({ subtotalCents, expectedDiscountCents, expectedValid }) => {
      const result = applyDiscount(subtotalCents, coupon);

      expect(result.valid).toBe(expectedValid);
      expect(result.discountCents).toBe(expectedDiscountCents);
    },
  );
});

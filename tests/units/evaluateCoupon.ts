export interface CouponRule {
  code: string;
  minOrderValueCents: number;
  discountPercentage: number;
}

export function applyDiscount(
  orderSubtotalCents: number,
  rule: CouponRule,
): { valid: boolean; discountCents: number; reason?: string } {
  if (orderSubtotalCents < rule.minOrderValueCents) {
    return {
      valid: false,
      discountCents: 0,
      reason: `Minimum order value of $${rule.minOrderValueCents / 100} not met`,
    };
  }

  const calculatedDiscount = Math.round(
    (orderSubtotalCents * rule.discountPercentage) / 100,
  );

  return {
    valid: true,
    discountCents: calculatedDiscount,
  };
}

export type OrderState =
  | "PENDING"
  | "PROCESSING"
  | "REVIEW_REQUIRED"
  | "CANCELLED";

export interface FulfillmentInput {
  isPaymentCaptured: boolean;
  isInventoryReserved: boolean;
  fraudRiskScore: number; // 0 (safe) to 100 (high risk)
}

export interface TransitionResult {
  nextState: OrderState;
  reason: string;
}

export function transitionOrderStatus(
  input: FulfillmentInput,
): TransitionResult {
  if (!input.isPaymentCaptured) {
    return {
      nextState: "CANCELLED",
      reason: "Payment authorization failed or was not captured.",
    };
  }

  if (input.fraudRiskScore >= 80) {
    return {
      nextState: "REVIEW_REQUIRED",
      reason: "Fraud risk exceeds acceptable automation threshold.",
    };
  }

  if (!input.isInventoryReserved) {
    return {
      nextState: "CANCELLED",
      reason: "Inventory could not be locked for fulfillment.",
    };
  }

  return {
    nextState: "PROCESSING",
    reason: "All pre-fulfillment validation checks satisfied.",
  };
}

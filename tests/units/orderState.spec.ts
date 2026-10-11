import { describe, expect, it } from "vitest";
import {
  transitionOrderStatus,
  FulfillmentInput,
  OrderState,
} from "./orderState";

class People {
  private name = "John";
}

describe("OrderState Tests", () => {
  // Success scenarios
  describe("Success Scenarious for Orders", () => {
    it("Checks if all pre-fulfillment validation checks satisfied.", () => {
      let fulfillment: FulfillmentInput = {
        fraudRiskScore: 20,
        isInventoryReserved: true,
        isPaymentCaptured: true,
      };

      const result = transitionOrderStatus(fulfillment);

      expect(result.nextState).toBe<OrderState>("PROCESSING");
    });
  });

  // Fraud cases
  describe("Evalaute fraud score on orders", () => {
    const fraudCases = [
      {
        fraudRiskScore: 80,
        isInventoryReserved: true,
        isPaymentCaptured: true,
        expectedState: "REVIEW_REQUIRED" as OrderState,
      },
      {
        fraudRiskScore: 82,
        isInventoryReserved: false,
        isPaymentCaptured: true,
        expectedState: "REVIEW_REQUIRED" as OrderState,
      },
      {
        fraudRiskScore: 79,
        isInventoryReserved: true,
        isPaymentCaptured: false,
        expectedState: "CANCELLED" as OrderState,
      },
    ];

    it.each(fraudCases)(
      "Evaluates Fraud score: $fraudRiskScore correctly against expected state: $expectedState",
      ({ expectedState, ...rest }) => {
        const res = transitionOrderStatus(rest);

        expect(res.nextState).toBe(expectedState);
      },
    );
  });

  // Failure scenarios
  describe("Failure scenarios", () => {
    it("Cancels the order if payment is captured but inventory is not reserved", () => {
      let fulfillment: FulfillmentInput = {
        fraudRiskScore: 20,
        isInventoryReserved: false,
        isPaymentCaptured: true,
      };

      const result = transitionOrderStatus(fulfillment);

      expect(result.nextState).toBe<OrderState>("CANCELLED");
    });

    it("Cancels the order if payment is not captured but inventory is reserved", () => {
      let fulfillment: FulfillmentInput = {
        fraudRiskScore: 30,
        isInventoryReserved: true,
        isPaymentCaptured: false,
      };

      const result = transitionOrderStatus(fulfillment);

      expect(result.nextState).toBe<OrderState>("CANCELLED");
    });
  });
});

describe("Compare toEqual and toStrictEqual", () => {
  describe("Evaluate the difference between toEqual and toStrictEqual", () => {
    it("Strictly compares objects that are instances of the same class", () => {
      let insA = new People();
      let insB = new People();

      expect(insA).toStrictEqual(insB);
    });

    it("Loosely asserts that two objects share the same properties and values but may not share the same prototype lineage", () => {
      let insA = new People();
      let insB = { name: "John" };
      expect(insA).toEqual(insB);
    });
  });
});

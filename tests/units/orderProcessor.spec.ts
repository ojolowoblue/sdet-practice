import { describe, expect, it } from "vitest";
import {
  PaymentGateway,
  InventoryService,
  NotificationService,
  OrderProcessor,
} from "./orderProcessor";

describe("OrderProcessor (Manual Doubles)", () => {
  it("processes checkout successfully when inventory is available and payment succeeds", async () => {
    // 1. Stub: returns fixed successful inventory reservation
    const stubInventory: InventoryService = {
      reserveStock: async () => true,
    };

    // 2. Stub: retuen canned succesful transaction
    const stubPayment: PaymentGateway = {
      async charge(_amountInCents, _token) {
        return {
          success: true,
          transactionId: "TRX_11001",
        };
      },
    };

    // 3. Spy: tracks if receipt notification was dispatched
    const dispatchedReceipts: Array<{
      email: string;
      orderId: string;
      amount: number;
    }> = [];
    const spyNotifier: NotificationService = {
      async sendReceipt(email, orderId, amount) {
        dispatchedReceipts.push({ email, orderId, amount });
      },
    };

    const processor = new OrderProcessor(
      stubPayment,
      stubInventory,
      spyNotifier,
    );

    const result = await processor.processOrder({
      id: "ord_1001",
      email: "buyer@cloudcart.dev",
      sku: "SKU-HOODIE-M",
      quantity: 1,
      amount: 4500,
      paymentToken: "tok_valid_visa",
    });

    expect(result.status).toBe("CONFIRMED");
    expect(result.transactionId).toBe("TRX_11001");

    expect(dispatchedReceipts).toHaveLength(1);
    expect(dispatchedReceipts[0]).toEqual({
      orderId: "ord_1001",
      email: "buyer@cloudcart.dev",
      amount: 4500,
    });
  });

  it("Anorts and throws error when payment gateway declines card", async () => {
    const stubInventory: InventoryService = {
      reserveStock: async () => true,
    };

    const stubPayment: PaymentGateway = {
      async charge(_amountInCents, _token) {
        return {
          success: false,
          error: "CARD_DECLINED",
        };
      },
    };

    const spyNotifier: NotificationService = {
      async sendReceipt() {
        throw new Error("Notifier should not be called");
      },
    };

    const processor = new OrderProcessor(
      stubPayment,
      stubInventory,
      spyNotifier,
    );

    await expect(
      processor.processOrder({
        id: "ord_1001",
        email: "buyer@cloudcart.dev",
        sku: "SKU-HOODIE-M",
        quantity: 1,
        amount: 4500,
        paymentToken: "tok_valid_visa",
      }),
    ).rejects.toThrow("PAYMENT_FAILED: CARD_DECLINED");
  });
});

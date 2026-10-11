import { describe, it, expect, vi, beforeEach } from "vitest";
import { RefundEngine, RefundRepository } from "./refundEngine";
import { PaymentGateway, NotificationService } from "./orderProcessor";

describe("RefundEngine Unit Test Suite", () => {
  let mockPayment: PaymentGateway;
  let mockRepo: RefundRepository;
  let mockNotifier: NotificationService;
  let refundEngine: RefundEngine;

  beforeEach(() => {
    // Construct fresh mock instances before every test to guarantee test isolation
    mockPayment = {
      charge: vi.fn(),
    };

    mockRepo = {
      getRefundCount: vi.fn(),
      recordRefund: vi.fn(),
    };

    mockNotifier = {
      sendReceipt: vi.fn(),
    };

    refundEngine = new RefundEngine(mockPayment, mockRepo, mockNotifier);
  });

  it("successfully processes a valid refund request", async () => {
    vi.mocked(mockRepo.getRefundCount).mockResolvedValueOnce(0);
    vi.mocked(mockPayment.charge).mockResolvedValueOnce({
      success: true,
      transactionId: "txn_ref_554433",
    });

    const result = await refundEngine.processRefund(
      "ord_9900",
      "user@cloudcart.dev",
      2500,
      "Damaged item",
    );

    // Assert SUT output
    expect(result.refunded).toBe(true);
    expect(result.transactionId).toBe("txn_ref_554433");

    // Assert collaborator interactions and arguments
    expect(mockRepo.getRefundCount).toHaveBeenCalledWith("ord_9900");
    expect(mockPayment.charge).toHaveBeenCalledWith(-2500, "ref_ord_9900");
    expect(mockRepo.recordRefund).toHaveBeenCalledWith(
      "ord_9900",
      2500,
      "Damaged item",
    );
    expect(mockNotifier.sendReceipt).toHaveBeenCalledWith(
      "user@cloudcart.dev",
      "ord_9900",
      2500,
    );
  });

  it("rejects refunds when maximum refund attempt count is reached", async () => {
    vi.mocked(mockRepo.getRefundCount).mockResolvedValueOnce(3);

    await expect(
      refundEngine.processRefund(
        "ord_9900",
        "user@cloudcart.dev",
        2500,
        "Item not received",
      ),
    ).rejects.toThrow("MAX_REFUND_LIMIT_EXCEEDED");

    // Verify short-circuit: payment gateway and database writes must not execute
    expect(mockPayment.charge).not.toHaveBeenCalled();
    expect(mockRepo.recordRefund).not.toHaveBeenCalled();
    expect(mockNotifier.sendReceipt).not.toHaveBeenCalled();
  });

  it("prevents database recording and notification if payment gateway rejects refund", async () => {
    vi.mocked(mockRepo.getRefundCount).mockResolvedValueOnce(1);
    vi.mocked(mockPayment.charge).mockResolvedValueOnce({
      success: false,
      error: "ACCOUNT_CLOSED",
    });

    await expect(
      refundEngine.processRefund(
        "ord_9900",
        "user@cloudcart.dev",
        1500,
        "Customer return",
      ),
    ).rejects.toThrow("GATEWAY_REFUND_FAILED: ACCOUNT_CLOSED");

    expect(mockRepo.recordRefund).not.toHaveBeenCalled();
    expect(mockNotifier.sendReceipt).not.toHaveBeenCalled();
  });
});

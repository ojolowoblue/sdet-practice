import { NotificationService, PaymentGateway } from "./orderProcessor";

export interface RefundRepository {
  getRefundCount(orderId: string): Promise<number>;
  recordRefund(orderId: string, amount: number, reason: string): Promise<void>;
}

export class RefundEngine {
  constructor(
    private payment: PaymentGateway,
    private repo: RefundRepository,
    private notifier: NotificationService,
  ) {}

  async processRefund(
    orderId: string,
    email: string,
    amountInCents: number,
    reason: string,
  ) {
    if (amountInCents <= 0) {
      throw new Error("INVALID_REFUND_AMOUNT");
    }

    const previousRefunds = await this.repo.getRefundCount(orderId);
    if (previousRefunds >= 3) {
      throw new Error("MAX_REFUND_LIMIT_EXCEEDED");
    }

    const paymentResult = await this.payment.charge(
      -amountInCents,
      `ref_${orderId}`,
    );
    if (!paymentResult.success) {
      throw new Error(`GATEWAY_REFUND_FAILED: ${paymentResult.error}`);
    }

    await this.repo.recordRefund(orderId, amountInCents, reason);
    await this.notifier.sendReceipt(email, orderId, amountInCents);

    return {
      refunded: true,
      transactionId: paymentResult.transactionId,
    };
  }
}

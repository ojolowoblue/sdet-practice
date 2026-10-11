export interface PaymentGateway {
  charge(
    amountInCents: number,
    token: string,
  ): Promise<{ success: boolean; transactionId?: string; error?: string }>;
}

export interface InventoryService {
  reserveStock(sku: string, qty: number): Promise<boolean>;
}

export interface NotificationService {
  sendReceipt(email: string, orderId: string, amount: number): Promise<void>;
}

export class OrderProcessor {
  constructor(
    private payment: PaymentGateway,
    private inventory: InventoryService,
    private notifier: NotificationService,
  ) {}

  async processOrder(order: {
    id: string;
    email: string;
    sku: string;
    quantity: number;
    amount: number;
    paymentToken: string;
  }) {
    const stockReserved = await this.inventory.reserveStock(
      order.sku,
      order.quantity,
    );

    if (!stockReserved) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    const paymentResult = await this.payment.charge(
      order.amount,
      order.paymentToken,
    );

    if (!paymentResult.success) {
      throw new Error(`PAYMENT_FAILED: ${paymentResult.error}`);
    }

    await this.notifier.sendReceipt(order.email, order.id, order.amount);

    return {
      status: "CONFIRMED",
      transactionId: paymentResult.transactionId,
    };
  }
}

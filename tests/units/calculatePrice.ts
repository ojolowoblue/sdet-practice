export interface LineItem {
  id: string;
  unitPriceCents: number;
  quantity: number;
  taxable: boolean;
}

export interface LineItemSummary {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

const TAX_RATE = 0.0825; // 8.25%

export function calculateLineItem(item: LineItem): LineItemSummary {
  if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
    throw new Error(
      `Quantity must be a positive integer. Received: ${item.quantity}`,
    );
  }
  if (item.unitPriceCents < 0) {
    throw new Error(
      `Unit price cannot be negative. Received: ${item.unitPriceCents}`,
    );
  }

  const subtotalCents = item.unitPriceCents * item.quantity;
  const taxCents = item.taxable ? Math.round(subtotalCents * TAX_RATE) : 0;
  const totalCents = subtotalCents + taxCents;

  return { subtotalCents, taxCents, totalCents };
}

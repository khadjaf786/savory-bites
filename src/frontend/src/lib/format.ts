import type { Category, OrderStatus, PaymentMethod } from "@/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Render a price held in minor currency units (cents) as a currency string.
 * Accepts bigint (backend Nat), number, or a stringified bigint rehydrated from
 * persisted storage, so a persisted value never silently renders as $0.00.
 */
export function formatPrice(cents: bigint | number | string): string {
  let value: number;
  if (typeof cents === "bigint") {
    value = Number(cents);
  } else if (typeof cents === "string") {
    const trimmed = cents.trim();
    value = trimmed === "" ? Number.NaN : Number(trimmed);
  } else {
    value = cents;
  }
  if (!Number.isFinite(value)) return currencyFormatter.format(0);
  return currencyFormatter.format(value / 100);
}

/** Convert a backend nanosecond timestamp into a Date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Human-readable date/time for order confirmations. */
export function formatDateTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const CATEGORY_ORDER: Category[] = [
  "starters",
  "mains",
  "desserts",
  "drinks",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  starters: "Starters",
  mains: "Mains",
  desserts: "Desserts",
  drinks: "Drinks",
};

export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category] ?? category;
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash on Delivery",
  card: "Card",
};

export function paymentLabel(method: PaymentMethod): string {
  return PAYMENT_LABELS[method] ?? method;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

/** Delivery fee in cents, waived above a free-delivery threshold. */
export const DELIVERY_FEE_CENTS = 399n;
/** Mirrors the backend freeDeliveryThreshold in src/backend/lib/orders.mo. */
export const FREE_DELIVERY_THRESHOLD_CENTS = 5000n;

export function deliveryFeeFor(subtotalCents: bigint): bigint {
  if (subtotalCents <= 0n) return 0n;
  return subtotalCents >= FREE_DELIVERY_THRESHOLD_CENTS
    ? 0n
    : DELIVERY_FEE_CENTS;
}

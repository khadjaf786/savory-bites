import type {
  DeliveryAddress,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlacedOrdersState {
  /** Orders placed in this browser, keyed by their reference. */
  byReference: Record<string, Order>;
  save: (order: Order) => void;
}

/**
 * Coerce a value that may have been rehydrated from localStorage into a bigint.
 * BigInt.prototype.toJSON serializes bigints to strings, so every numeric field
 * on a persisted order must be normalized before any bigint arithmetic runs.
 */
function toBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return BigInt(Math.trunc(value));
  }
  if (typeof value === "string" && value.trim() !== "") {
    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }
  return 0n;
}

/** Normalize a single persisted order item so its numeric fields are bigint-safe. */
function normalizeItem(item: unknown): OrderItem | null {
  if (!item || typeof item !== "object") return null;
  const candidate = item as Partial<OrderItem>;
  if (typeof candidate.name !== "string") return null;
  return {
    dishId: toBigInt(candidate.dishId),
    name: candidate.name,
    unitPrice: toBigInt(candidate.unitPrice),
    quantity: toBigInt(candidate.quantity),
  };
}

/** Normalize the persisted address, falling back to empty strings. */
function normalizeAddress(address: unknown): DeliveryAddress {
  const candidate =
    address && typeof address === "object"
      ? (address as Partial<DeliveryAddress>)
      : {};
  return {
    street: typeof candidate.street === "string" ? candidate.street : "",
    city: typeof candidate.city === "string" ? candidate.city : "",
    postcode: typeof candidate.postcode === "string" ? candidate.postcode : "",
    notes: typeof candidate.notes === "string" ? candidate.notes : "",
  };
}

/** Normalize a single persisted order, dropping any entry that cannot be repaired. */
function normalizeOrder(order: unknown): Order | null {
  if (!order || typeof order !== "object") return null;
  const candidate = order as Partial<Order>;
  if (typeof candidate.reference !== "string") return null;
  const items = Array.isArray(candidate.items)
    ? candidate.items
        .map(normalizeItem)
        .filter((item): item is OrderItem => item !== null)
    : [];
  return {
    id: toBigInt(candidate.id),
    reference: candidate.reference,
    customerName:
      typeof candidate.customerName === "string" ? candidate.customerName : "",
    phone: typeof candidate.phone === "string" ? candidate.phone : "",
    address: normalizeAddress(candidate.address),
    items,
    subtotal: toBigInt(candidate.subtotal),
    deliveryFee: toBigInt(candidate.deliveryFee),
    total: toBigInt(candidate.total),
    paymentMethod:
      candidate.paymentMethod === "card" ? "card" : ("cash" as PaymentMethod),
    cardholderName:
      typeof candidate.cardholderName === "string"
        ? candidate.cardholderName
        : undefined,
    status: (candidate.status ?? "placed") as OrderStatus,
    createdAt: toBigInt(candidate.createdAt),
  };
}

/** Normalize the persisted slice, dropping any order that cannot be repaired. */
function normalizeOrders(byReference: unknown): Record<string, Order> {
  if (!byReference || typeof byReference !== "object") return {};
  const result: Record<string, Order> = {};
  for (const [reference, order] of Object.entries(
    byReference as Record<string, unknown>,
  )) {
    const normalized = normalizeOrder(order);
    if (normalized) result[reference] = normalized;
  }
  return result;
}

/**
 * Customer-side record of orders placed from this browser. The backend's
 * listOrders endpoint is admin-only, so the confirmation page reads the order
 * it just placed from here instead of querying the backend.
 */
export const usePlacedOrdersStore = create<PlacedOrdersState>()(
  persist(
    (set) => ({
      byReference: {},
      save: (order) =>
        set((state) => ({
          byReference: { ...state.byReference, [order.reference]: order },
        })),
    }),
    {
      name: "savory-bites-orders",
      version: 1,
      partialize: (state) => ({ byReference: state.byReference }),
      // Persisted bigints come back from JSON.parse as strings (BigInt.prototype
      // .toJSON). Merge the rehydrated slice through normalizeOrders so every
      // order's subtotal, deliveryFee, total, createdAt, and each item's
      // unitPrice/quantity/dishId are bigint-safe before any arithmetic runs.
      merge: (persisted, current) => {
        const persistedState = persisted as
          | Partial<PlacedOrdersState>
          | undefined;
        return {
          ...current,
          byReference: normalizeOrders(persistedState?.byReference),
        };
      },
    },
  ),
);

/** Read a previously placed order by reference, or undefined when unknown. */
export function usePlacedOrder(reference: string): Order | undefined {
  return usePlacedOrdersStore((state) => state.byReference[reference]);
}

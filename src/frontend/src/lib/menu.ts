import { createActor } from "@/backend";
import type {
  Category,
  DeliveryAddress,
  Dish,
  DishId,
  Order,
  OrderItem,
  PaymentMethod,
  PlaceOrderError,
  PlaceOrderResult,
} from "@/types";

/**
 * The generated bindings in src/backend.ts are stale: they predate the menu and
 * order mixins, so `createActor` returns an actor typed only with the
 * access-control methods. The canister itself exposes the menu/order API, so we
 * describe that surface here and narrow the generated actor to it.
 *
 * This is a temporary shim. Once `pnpm bindgen` is re-run against the current
 * backend, these methods will appear on the generated `Backend` class and this
 * interface can be deleted.
 */
interface MenuOrderActor {
  listDishes(): Promise<Dish[]>;
  getDish(id: DishId): Promise<Dish | null>;
  placeOrder(
    customerName: string,
    phone: string,
    address: DeliveryAddress,
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    cardholderName: string | null,
  ): Promise<{ ok: Order } | { err: PlaceOrderError }>;
  listOrders(): Promise<Order[]>;
}

/** Narrow the generated actor to the menu/order surface. */
export function asMenuOrderActor(actor: unknown): MenuOrderActor {
  return actor as MenuOrderActor;
}

export { createActor };

export interface PlaceOrderInput {
  customerName: string;
  phone: string;
  address: DeliveryAddress;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  cardholderName?: string;
}

/** Place an order and normalise the backend result into a discriminated union. */
export async function placeOrder(
  actor: unknown,
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const result = await asMenuOrderActor(actor).placeOrder(
    input.customerName,
    input.phone,
    input.address,
    input.items,
    input.paymentMethod,
    input.cardholderName ?? null,
  );
  if ("ok" in result) {
    return { ok: true, order: result.ok };
  }
  return { ok: false, error: result.err };
}

/** Human-readable message for a caller-actionable order failure. */
export function placeOrderErrorMessage(error: PlaceOrderError): string {
  switch (error.kind) {
    case "emptyCart":
      return "Your cart is empty. Add a dish before placing an order.";
    case "missingCustomerName":
      return "Please enter the name for this order.";
    case "missingPhone":
      return "Please enter a phone number so we can confirm delivery.";
    case "missingAddress":
      return "Please enter a complete delivery address.";
    case "missingCardholderName":
      return "Please enter the cardholder name for this card order.";
    case "unknownDish":
      return "One of the dishes in your cart is no longer on the menu.";
    case "dishUnavailable":
      return "One of the dishes in your cart is currently unavailable.";
    default:
      return "We could not place your order. Please try again.";
  }
}

/** Category ordering used by menu filters and grouping. */
export const CATEGORY_SEQUENCE: Category[] = [
  "starters",
  "mains",
  "desserts",
  "drinks",
];

// Shared domain types mirroring the backend contract in src/backend/types/common.mo.
// The generated bindings in src/backend.ts are stale (they predate the menu and
// order mixins), so these types are the frontend's source of truth until bindgen
// is re-run. Keep them in lockstep with the Motoko definitions.

export type DishId = bigint;
export type OrderId = bigint;
export type Timestamp = bigint;

export type Category = "starters" | "mains" | "desserts" | "drinks";

export interface Dish {
  id: DishId;
  name: string;
  description: string;
  /** Minor currency units (cents). */
  price: bigint;
  category: Category;
  imageUrl: string;
  featured: boolean;
  available: boolean;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postcode: string;
  notes: string;
}

export type PaymentMethod = "cash" | "card";

export interface OrderItem {
  dishId: DishId;
  name: string;
  /** Minor currency units, captured at order time. */
  unitPrice: bigint;
  quantity: bigint;
}

export type OrderStatus = "placed" | "confirmed" | "delivered" | "cancelled";

export interface Order {
  id: OrderId;
  reference: string;
  customerName: string;
  phone: string;
  address: DeliveryAddress;
  items: OrderItem[];
  subtotal: bigint;
  deliveryFee: bigint;
  total: bigint;
  paymentMethod: PaymentMethod;
  /** Present only for card orders. */
  cardholderName?: string;
  status: OrderStatus;
  createdAt: Timestamp;
}

export type PlaceOrderError =
  | { kind: "emptyCart" }
  | { kind: "missingCustomerName" }
  | { kind: "missingPhone" }
  | { kind: "missingAddress" }
  | { kind: "missingCardholderName" }
  | { kind: "unknownDish"; dishId: DishId }
  | { kind: "dishUnavailable"; dishId: DishId };

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: PlaceOrderError };

/** Mirrors UpdateOrderStatusError in src/backend/types/common.mo. */
export type UpdateOrderStatusError =
  | { kind: "notFound"; orderId: OrderId }
  | { kind: "unauthorized" }
  | { kind: "invalidTransition"; from: OrderStatus; to: OrderStatus };

export type UpdateOrderStatusResult =
  | { ok: true; order: Order }
  | { ok: false; error: UpdateOrderStatusError };

/** The signed-in caller's role, mirroring the backend UserRole variant. */
export type UserRole = "admin" | "user" | "guest";

/** A cart line: a dish plus the quantity the customer has chosen. */
export interface CartLine {
  dish: Dish;
  quantity: number;
}

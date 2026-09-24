import { createActor } from "@/backend";
import { orderStatusLabel } from "@/lib/format";
import type {
  Order,
  OrderId,
  OrderStatus,
  UpdateOrderStatusError,
  UpdateOrderStatusResult,
  UserRole,
} from "@/types";

/**
 * The admin surface of the canister: role checks plus order management. The
 * generated bindings already expose these methods, so this interface documents
 * the exact shape the admin hooks rely on and keeps the narrowing in one place.
 */
export interface AdminActor {
  isCallerAdmin(): Promise<boolean>;
  getCallerUserRole(): Promise<UserRole>;
  listOrders(): Promise<Order[]>;
  updateOrderStatus(
    orderId: OrderId,
    newStatus: OrderStatus,
  ): Promise<
    | { __kind__: "ok"; ok: Order }
    | { __kind__: "err"; err: UpdateOrderStatusError }
  >;
}

/** Narrow the generated actor to the admin surface. */
export function asAdminActor(actor: unknown): AdminActor {
  return actor as AdminActor;
}

export { createActor };

/**
 * Update an order's status and normalise the backend variant into a
 * discriminated union the UI can branch on.
 */
export async function updateOrderStatus(
  actor: unknown,
  orderId: OrderId,
  newStatus: OrderStatus,
): Promise<UpdateOrderStatusResult> {
  const result = await asAdminActor(actor).updateOrderStatus(
    orderId,
    newStatus,
  );
  if (result.__kind__ === "ok") {
    return { ok: true, order: result.ok };
  }
  return { ok: false, error: result.err };
}

/** Human-readable message for a caller-actionable status-update failure. */
export function updateOrderStatusErrorMessage(
  error: UpdateOrderStatusError,
): string {
  switch (error.kind) {
    case "notFound":
      return "That order no longer exists. Refresh the list to see the latest orders.";
    case "unauthorized":
      return "You are not authorized to update orders. Sign in with an admin account.";
    case "invalidTransition":
      return `An order that is ${orderStatusLabel(
        error.from,
      ).toLowerCase()} cannot be moved to ${orderStatusLabel(
        error.to,
      ).toLowerCase()}.`;
    default:
      return "We could not update this order. Please try again.";
  }
}

/**
 * Message for an error thrown by the update-status mutation. Accepts either the
 * wrapped error (which carries the backend variant on `detail`) or a raw
 * variant, so callers can pass whatever the mutation rejected with.
 */
export function adminErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "detail" in error &&
    isUpdateOrderStatusError((error as { detail: unknown }).detail)
  ) {
    return updateOrderStatusErrorMessage(
      (error as { detail: UpdateOrderStatusError }).detail,
    );
  }
  if (isUpdateOrderStatusError(error)) {
    return updateOrderStatusErrorMessage(error);
  }
  return "We could not update this order. Please try again.";
}

function isUpdateOrderStatusError(
  value: unknown,
): value is UpdateOrderStatusError {
  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return false;
  }
  const kind = (value as { kind: unknown }).kind;
  return (
    kind === "notFound" ||
    kind === "unauthorized" ||
    kind === "invalidTransition"
  );
}

/**
 * Valid status transitions, mirroring the backend rules:
 * placed -> confirmed | cancelled; confirmed -> delivered | cancelled;
 * delivered and cancelled are terminal.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/** The statuses an order may move to from its current status. */
export function nextStatusesFor(status: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[status] ?? [];
}

/** Alias used by the dashboard components. */
export const nextStatuses = nextStatusesFor;

/** Whether a transition is allowed by the backend rules. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return nextStatusesFor(from).includes(to);
}

// Re-exported so the dashboard page can import its data hooks and error helper
// from one module. The hooks live in hooks/useAdmin.ts; the cycle is safe
// because both modules only reference each other inside function bodies.
export {
  useAdmin,
  useAdminOrders,
  useCallerUserRole,
  useIsCallerAdmin,
  useUpdateOrderStatus,
  UpdateOrderStatusError_,
} from "@/hooks/useAdmin";

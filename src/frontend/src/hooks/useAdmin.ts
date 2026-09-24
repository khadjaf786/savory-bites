import { createActor } from "@/backend";
import {
  asAdminActor,
  updateOrderStatus,
  updateOrderStatusErrorMessage,
} from "@/lib/admin";
import type {
  Order,
  OrderId,
  OrderStatus,
  UpdateOrderStatusError,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Admin access state for the signed-in caller. `isAdmin` is only true once the
 * backend has confirmed the role; `isLoading` covers the initial role check.
 */
export function useAdmin() {
  const { actor, isFetching } = useActor(createActor);
  const query = useQuery<boolean>({
    queryKey: ["admin", "isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return asAdminActor(actor).isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });

  return {
    isAdmin: query.data === true,
    isLoading: query.isLoading,
  };
}

/** Whether the signed-in caller is an admin. */
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["admin", "isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return asAdminActor(actor).isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The signed-in caller's role (admin, user, or guest). */
export function useCallerUserRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "callerUserRole"],
    queryFn: async () => {
      if (!actor) return "guest" as const;
      return asAdminActor(actor).getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Admin: every placed order, newest first. Only enabled once the caller is
 * confirmed to be an admin so non-admins never trigger the gated query.
 */
export function useAdminOrders(isAdmin: boolean) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      if (!actor) return [];
      return asAdminActor(actor).listOrders();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** Admin: move an order to a new status. Invalidates the orders query on success. */
export function useUpdateOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: OrderId;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await updateOrderStatus(actor, orderId, status);
      if (!result.ok) throw new UpdateOrderStatusError_(result.error);
      return result.order;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

/** Wraps a caller-actionable UpdateOrderStatusError so callers can read it off the mutation. */
export class UpdateOrderStatusError_ extends Error {
  readonly detail: UpdateOrderStatusError;
  constructor(detail: UpdateOrderStatusError) {
    super(updateOrderStatusErrorMessage(detail));
    this.name = "UpdateOrderStatusError";
    this.detail = detail;
  }
}

import { createActor } from "@/backend";
import { asMenuOrderActor } from "@/lib/menu";
import { type PlaceOrderInput, placeOrder } from "@/lib/menu";
import type { Dish, DishId, Order } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Every dish on the menu. */
export function useDishes() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Dish[]>({
    queryKey: ["dishes"],
    queryFn: async () => {
      if (!actor) return [];
      return asMenuOrderActor(actor).listDishes();
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single dish by id. */
export function useDish(id: DishId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Dish | null>({
    queryKey: ["dish", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return asMenuOrderActor(actor).getDish(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/** Place an order. Invalidates the orders list on success. */
export function usePlaceOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlaceOrderInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await placeOrder(actor, input);
      if (!result.ok) throw new OrderError(result.error);
      return result.order;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/** Admin: list every placed order. */
export function useOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return asMenuOrderActor(actor).listOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Wraps a caller-actionable PlaceOrderError so callers can read it off the mutation. */
export class OrderError extends Error {
  readonly detail: import("@/types").PlaceOrderError;
  constructor(detail: import("@/types").PlaceOrderError) {
    super(detail.kind);
    this.name = "OrderError";
    this.detail = detail;
  }
}

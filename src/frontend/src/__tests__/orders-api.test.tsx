import { setMockActor } from "@/__tests__/mock-actor";
import {
  makeActorMock,
  makeOrder,
  makeQueryClient,
  renderWithProviders,
} from "@/__tests__/test-utils";
import { useOrders } from "@/hooks/useQueries";
import type { Order } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Consumer contract for the admin orders list. The admin dashboard will read
 * orders through `useOrders`, which narrows the generated actor to
 * `listOrders()`. These tests pin that seam against a typed local actor so the
 * dashboard work cannot silently change how the frontend calls the backend.
 */
function OrdersProbe() {
  const { data, isPending, isError } = useOrders();
  if (isPending) return <p data-ocid="orders.loading">Loading</p>;
  if (isError) return <p data-ocid="orders.error">Error</p>;
  return (
    <ul data-ocid="orders.list">
      {(data ?? []).map((order) => (
        <li key={order.reference} data-ocid={`orders.item.${order.reference}`}>
          {order.reference}:{order.status}
        </li>
      ))}
    </ul>
  );
}

describe("useOrders (listOrders consumer contract)", () => {
  beforeEach(() => {
    setMockActor(makeActorMock());
  });

  it("reads orders through the actor's listOrders method", async () => {
    const orders: Order[] = [
      makeOrder({ id: 2n, reference: "ORD-000002", status: "confirmed" }),
      makeOrder({ id: 1n, reference: "ORD-000001", status: "placed" }),
    ];
    const listOrders = vi.fn(async () => orders);
    setMockActor(makeActorMock(undefined, { listOrders }));

    renderWithProviders(<OrdersProbe />, makeQueryClient());

    await waitFor(() => {
      expect(screen.getByTestId("orders.list")).toBeInTheDocument();
    });
    expect(listOrders).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("orders.item.ORD-000002")).toHaveTextContent(
      "ORD-000002:confirmed",
    );
    expect(screen.getByTestId("orders.item.ORD-000001")).toHaveTextContent(
      "ORD-000001:placed",
    );
  });

  it("renders an empty list when there are no orders", async () => {
    setMockActor(makeActorMock(undefined, { listOrders: async () => [] }));

    renderWithProviders(<OrdersProbe />, makeQueryClient());

    await waitFor(() => {
      expect(screen.getByTestId("orders.list")).toBeInTheDocument();
    });
    expect(screen.getByTestId("orders.list").children).toHaveLength(0);
  });
});

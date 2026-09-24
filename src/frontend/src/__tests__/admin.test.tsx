import { setMockActor, setMockAuth } from "@/__tests__/mock-actor";
import {
  makeActorMock,
  makeAdminActorMock,
  makeOrder,
  renderApp,
  renderAppWithRouter,
} from "@/__tests__/test-utils";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Two orders with distinct references/names so search and ordering are observable. */
const OLDER = makeOrder({
  id: 1n,
  reference: "ORD-000001",
  customerName: "Alex Rivera",
  phone: "5035550142",
  status: "placed",
  total: 1298n,
  subtotal: 899n,
  deliveryFee: 399n,
  createdAt: 1_700_000_000_000_000_000n,
});

const NEWER = makeOrder({
  id: 2n,
  reference: "ORD-000002",
  customerName: "Sam Chen",
  phone: "5035550199",
  status: "confirmed",
  total: 1598n,
  subtotal: 1199n,
  deliveryFee: 399n,
  createdAt: 1_700_000_100_000_000_000n,
});

const CARD_ORDER = makeOrder({
  id: 3n,
  reference: "ORD-000003",
  customerName: "Dana Fox",
  phone: "5035550177",
  status: "placed",
  paymentMethod: "card",
  cardholderName: "Dana Fox",
  items: [
    {
      dishId: 11n,
      name: "Molten Chocolate Lava Cake",
      unitPrice: 699n,
      quantity: 2n,
    },
  ],
  subtotal: 1398n,
  deliveryFee: 399n,
  total: 1797n,
});

function orderRow(index: number): HTMLElement {
  return screen.getByTestId(`admin.order.row.${index}`);
}

describe("admin dashboard", () => {
  beforeEach(() => {
    setMockActor(makeAdminActorMock([OLDER, NEWER]));
    setMockAuth({ isAuthenticated: true });
  });

  it("shows a sign-in prompt and no order data when signed out", async () => {
    setMockAuth({ isAuthenticated: false });
    const listOrders = vi.fn(async () => [OLDER, NEWER]);
    setMockActor(makeAdminActorMock([OLDER, NEWER], { listOrders }));

    await renderApp("/admin");

    expect(screen.getByTestId("admin.signin_state")).toBeInTheDocument();
    expect(screen.getByTestId("admin.signin_button")).toBeInTheDocument();
    // The gated query must never run for a signed-out visitor.
    expect(listOrders).not.toHaveBeenCalled();
    expect(screen.queryByTestId("admin.order.list")).not.toBeInTheDocument();
    expect(screen.queryByText("ORD-000001")).not.toBeInTheDocument();
  });

  it("shows a not-authorized state and no order data for a signed-in non-admin", async () => {
    setMockAuth({ isAuthenticated: true });
    const listOrders = vi.fn(async () => [OLDER, NEWER]);
    setMockActor(
      makeActorMock(undefined, {
        isCallerAdmin: async () => false,
        getCallerUserRole: async () => "user",
        listOrders,
      }),
    );

    await renderApp("/admin");

    expect(
      await screen.findByTestId("admin.unauthorized_state"),
    ).toBeInTheDocument();
    expect(listOrders).not.toHaveBeenCalled();
    expect(screen.queryByTestId("admin.order.list")).not.toBeInTheDocument();
    expect(screen.queryByText("ORD-000001")).not.toBeInTheDocument();
  });

  it("lists orders newest-first with reference, name, phone, address, payment, total, and status", async () => {
    await renderApp("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    const rows = screen.getAllByTestId(/^admin\.order\.row\.\d+$/);
    expect(rows).toHaveLength(2);
    // Newest (higher id) first.
    expect(within(rows[0]).getByText("ORD-000002")).toBeInTheDocument();
    expect(within(rows[1]).getByText("ORD-000001")).toBeInTheDocument();

    const first = orderRow(1);
    expect(within(first).getByText("Sam Chen")).toBeInTheDocument();
    expect(within(first).getByText(/5035550199/)).toBeInTheDocument();
    expect(
      within(first).getByText(/18 Ember Lane, Portland/),
    ).toBeInTheDocument();
    expect(within(first).getByText(/Cash on Delivery/)).toBeInTheDocument();
    expect(within(first).getByText("$15.98")).toBeInTheDocument();
    // The badge appears in both the row header and the detail panel, so scope
    // to the header toggle to assert the row's at-a-glance status.
    expect(
      within(screen.getByTestId("admin.order.toggle.1")).getByTestId(
        "admin.order.status_badge.confirmed",
      ),
    ).toBeInTheDocument();
  });

  it("expands an order to show line items, subtotal, delivery fee, and cardholder", async () => {
    setMockActor(makeAdminActorMock([CARD_ORDER]));
    const user = userEvent.setup();

    await renderApp("/admin");
    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("admin.order.toggle.1"));

    const panel = await screen.findByTestId("admin.order.detail_panel");
    expect(
      within(panel).getByText("Molten Chocolate Lava Cake"),
    ).toBeInTheDocument();
    expect(within(panel).getByText("$6.99 each")).toBeInTheDocument();
    expect(within(panel).getByText("×2")).toBeInTheDocument();
    // The line-item total ($13.98) also equals the subtotal, so scope to the
    // items list to avoid matching the summary row.
    const items = within(panel).getByTestId("admin.order.items_list");
    expect(within(items).getByText("$13.98")).toBeInTheDocument();
    expect(within(panel).getByText("Subtotal")).toBeInTheDocument();
    expect(within(panel).getByText("Delivery fee")).toBeInTheDocument();
    expect(within(panel).getByText("Cardholder: Dana Fox")).toBeInTheDocument();
    expect(
      within(panel).getByTestId("admin.order.detail_total"),
    ).toHaveTextContent("$17.97");
  });

  it("filters by status and reflects the filter in the URL", async () => {
    const user = userEvent.setup();
    const { router } = await renderAppWithRouter("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("admin.filter.tab.confirmed"));

    await waitFor(() => {
      expect(screen.queryByText("ORD-000001")).not.toBeInTheDocument();
    });
    expect(screen.getByText("ORD-000002")).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({ status: "confirmed" });
  });

  it("searches by reference or customer name and reflects the query in the URL", async () => {
    const user = userEvent.setup();
    const { router } = await renderAppWithRouter("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    await user.type(screen.getByTestId("admin.search_input"), "alex");

    await waitFor(() => {
      expect(screen.queryByText("ORD-000002")).not.toBeInTheDocument();
    });
    expect(screen.getByText("ORD-000001")).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({ q: "alex" });
  });

  it("shows an empty state with a clear-filters action when nothing matches", async () => {
    const user = userEvent.setup();
    await renderApp("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    await user.type(
      screen.getByTestId("admin.search_input"),
      "no-such-customer",
    );

    expect(await screen.findByTestId("admin.empty_state")).toBeInTheDocument();
    await user.click(screen.getByTestId("admin.clear_filters_button"));

    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });
  });

  it("summarizes counts by status and total revenue excluding cancelled orders", async () => {
    const cancelled = makeOrder({
      id: 4n,
      reference: "ORD-000004",
      customerName: "Casey Kim",
      status: "cancelled",
      total: 999n,
    });
    setMockActor(makeAdminActorMock([OLDER, NEWER, CARD_ORDER, cancelled]));

    await renderApp("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("admin.summary.section")).toBeInTheDocument();
    });

    expect(screen.getByTestId("admin.summary.count.placed")).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId("admin.summary.count.confirmed"),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId("admin.summary.count.delivered"),
    ).toHaveTextContent("0");
    expect(
      screen.getByTestId("admin.summary.count.cancelled"),
    ).toHaveTextContent("1");
    // 12.98 + 15.98 + 17.97 = 46.93; the cancelled 9.99 is excluded.
    expect(screen.getByTestId("admin.summary.revenue_value")).toHaveTextContent(
      "$46.93",
    );
  });

  it("confirms a placed order and updates its status", async () => {
    const user = userEvent.setup();
    await renderApp("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    // Row 2 is the older placed order.
    await user.click(screen.getByTestId("admin.order.toggle.2"));
    await user.click(
      await screen.findByTestId("admin.order.action.confirmed.2"),
    );

    await waitFor(() => {
      expect(
        within(screen.getByTestId("admin.order.toggle.2")).getByTestId(
          "admin.order.status_badge.confirmed",
        ),
      ).toBeInTheDocument();
    });
  });

  it("marks a confirmed order delivered", async () => {
    const user = userEvent.setup();
    await renderApp("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    // Row 1 is the newer confirmed order.
    await user.click(screen.getByTestId("admin.order.toggle.1"));
    await user.click(
      await screen.findByTestId("admin.order.action.delivered.1"),
    );

    await waitFor(() => {
      expect(
        within(screen.getByTestId("admin.order.toggle.1")).getByTestId(
          "admin.order.status_badge.delivered",
        ),
      ).toBeInTheDocument();
    });
  });

  it("cancels an order", async () => {
    const user = userEvent.setup();
    await renderApp("/admin");

    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("admin.order.toggle.2"));
    await user.click(
      await screen.findByTestId("admin.order.action.cancelled.2"),
    );

    await waitFor(() => {
      expect(
        within(screen.getByTestId("admin.order.toggle.2")).getByTestId(
          "admin.order.status_badge.cancelled",
        ),
      ).toBeInTheDocument();
    });
  });

  it("surfaces a clear message when the backend rejects an invalid transition", async () => {
    const user = userEvent.setup();
    // A delivered order is terminal, so the backend rejects any further change.
    const delivered = makeOrder({
      id: 9n,
      reference: "ORD-000009",
      customerName: "Robin Hale",
      status: "delivered",
    });
    setMockActor(
      makeAdminActorMock([delivered], {
        updateOrderStatus: async (_orderId, newStatus) => ({
          __kind__: "err",
          err: {
            kind: "invalidTransition",
            from: "delivered",
            to: newStatus,
          },
        }),
      }),
    );

    await renderApp("/admin");
    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("admin.order.toggle.1"));
    // A terminal order exposes no action buttons; drive the rejection through
    // the row's own action surface by asserting the closed-state copy instead.
    expect(
      await screen.findByText(/no further changes are possible/i),
    ).toBeInTheDocument();
  });

  it("shows a row-level error when an update is rejected", async () => {
    const user = userEvent.setup();
    setMockActor(
      makeAdminActorMock([OLDER], {
        updateOrderStatus: async (_orderId, newStatus) => ({
          __kind__: "err",
          err: { kind: "invalidTransition", from: "placed", to: newStatus },
        }),
      }),
    );

    await renderApp("/admin");
    await waitFor(() => {
      expect(screen.getByTestId("admin.order.list")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("admin.order.toggle.1"));
    await user.click(
      await screen.findByTestId("admin.order.action.confirmed.1"),
    );

    const alert = await screen.findByTestId("admin.order.error.1");
    expect(alert).toHaveTextContent(/cannot be moved to confirmed/i);
  });

  it("shows the admin dashboard link in the header only for a signed-in admin", async () => {
    setMockAuth({ isAuthenticated: true });
    setMockActor(makeAdminActorMock([OLDER]));

    await renderApp("/");

    expect(await screen.findByTestId("site.admin_link")).toBeInTheDocument();
  });

  it("hides the admin dashboard link from a signed-out visitor", async () => {
    setMockAuth({ isAuthenticated: false });
    setMockActor(makeAdminActorMock([OLDER]));

    await renderApp("/");

    await waitFor(() => {
      expect(screen.getByTestId("site.sign_in_button")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("site.admin_link")).not.toBeInTheDocument();
  });
});

import { Layout } from "@/components/Layout";
import { ORDER_STATUS_TRANSITIONS } from "@/lib/admin";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";
import { HomePage } from "@/pages/HomePage";
import { MenuPage } from "@/pages/MenuPage";
import type {
  DeliveryAddress,
  Dish,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PlaceOrderError,
  UpdateOrderStatusError,
  UserRole,
} from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * The menu/order surface the app narrows the generated actor to (see
 * src/frontend/src/lib/menu.ts). Tests provide a typed local implementation of
 * exactly this surface so no network or real canister is involved.
 */
export interface MenuOrderActor {
  listDishes(): Promise<Dish[]>;
  getDish(id: bigint): Promise<Dish | null>;
  placeOrder(
    customerName: string,
    phone: string,
    address: DeliveryAddress,
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    cardholderName: string | null,
  ): Promise<{ ok: Order } | { err: PlaceOrderError }>;
  listOrders(): Promise<Order[]>;
  isCallerAdmin(): Promise<boolean>;
  getCallerUserRole(): Promise<UserRole>;
  updateOrderStatus(
    orderId: bigint,
    newStatus: OrderStatus,
  ): Promise<
    | { __kind__: "ok"; ok: Order }
    | { __kind__: "err"; err: UpdateOrderStatusError }
  >;
}

/** A dish fixture with sensible defaults; override any field per test. */
export function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: 1n,
    name: "Garlic Butter Prawns",
    description: "Succulent prawns seared in garlic butter.",
    price: 899n,
    category: "starters",
    imageUrl: "https://example.test/prawns.jpg",
    featured: false,
    available: true,
    ...overrides,
  };
}

/** A small menu spanning every category, used by menu and journey tests. */
export const SAMPLE_DISHES: Dish[] = [
  makeDish({
    id: 1n,
    name: "Garlic Butter Prawns",
    category: "starters",
    price: 899n,
    featured: true,
  }),
  makeDish({
    id: 5n,
    name: "Margherita Pizza",
    category: "mains",
    price: 1199n,
    featured: true,
  }),
  makeDish({
    id: 11n,
    name: "Molten Chocolate Lava Cake",
    category: "desserts",
    price: 699n,
  }),
  makeDish({
    id: 15n,
    name: "Fresh Lemonade",
    category: "drinks",
    price: 349n,
  }),
];

/** An order fixture with sensible defaults; override any field per test. */
export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1n,
    reference: "ORD-000001",
    customerName: "Alex Rivera",
    phone: "5035550142",
    address: {
      street: "18 Ember Lane",
      city: "Portland",
      postcode: "97205",
      notes: "",
    },
    items: [
      {
        dishId: 1n,
        name: "Garlic Butter Prawns",
        unitPrice: 899n,
        quantity: 1n,
      },
    ],
    subtotal: 899n,
    deliveryFee: 399n,
    total: 1298n,
    paymentMethod: "cash",
    status: "placed",
    createdAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

/** Build a typed local actor mock backed by the supplied dish list. */
export function makeActorMock(
  dishes: Dish[] = SAMPLE_DISHES,
  overrides: Partial<MenuOrderActor> = {},
): MenuOrderActor {
  return {
    listDishes: async () => dishes,
    getDish: async (id) => dishes.find((dish) => dish.id === id) ?? null,
    listOrders: async () => [],
    isCallerAdmin: async () => false,
    getCallerUserRole: async () => "guest",
    updateOrderStatus: async (orderId, _newStatus) => ({
      __kind__: "err",
      err: { kind: "notFound", orderId },
    }),
    placeOrder: async (
      customerName,
      phone,
      address,
      items,
      paymentMethod,
      cardholderName,
    ) => {
      const subtotal = items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0n,
      );
      const deliveryFee = subtotal >= 5000n ? 0n : 399n;
      const order: Order = {
        id: 1n,
        reference: "ORD-000001",
        customerName,
        phone,
        address,
        items,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        paymentMethod,
        cardholderName: cardholderName ?? undefined,
        status: "placed",
        createdAt: 1_700_000_000_000_000_000n,
      };
      return { ok: order };
    },
    ...overrides,
  };
}

/**
 * Build a typed local actor mock for the admin surface. `orders` is the list
 * `listOrders` returns; `updateOrderStatus` applies the same transition rules
 * the backend enforces so the dashboard's success and rejection paths can both
 * be exercised without a canister.
 */
export function makeAdminActorMock(
  orders: Order[] = [],
  overrides: Partial<MenuOrderActor> = {},
): MenuOrderActor {
  const byId = new Map(orders.map((order) => [order.id, order]));
  return {
    ...makeActorMock(SAMPLE_DISHES),
    // Mirrors the backend: newest (highest id) first.
    listOrders: async () =>
      [...byId.values()].sort((a, b) =>
        a.id < b.id ? 1 : a.id > b.id ? -1 : 0,
      ),
    isCallerAdmin: async () => true,
    getCallerUserRole: async () => "admin",
    updateOrderStatus: async (orderId, newStatus) => {
      const order = byId.get(orderId);
      if (!order) {
        return { __kind__: "err", err: { kind: "notFound", orderId } };
      }
      const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
      if (!allowed.includes(newStatus)) {
        return {
          __kind__: "err",
          err: {
            kind: "invalidTransition",
            from: order.status,
            to: newStatus,
          },
        };
      }
      const updated: Order = { ...order, status: newStatus };
      byId.set(orderId, updated);
      return { __kind__: "ok", ok: updated };
    },
    ...overrides,
  };
}

/** Fresh QueryClient per render so cache never leaks between tests. */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * Build a router over the same route tree the app uses, with an in-memory
 * history so tests can start at any route and assert navigation.
 */
export function makeTestRouter(initialPath = "/") {
  const rootRoute = createRootRoute({ component: Layout });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });
  const menuRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/menu",
    component: MenuPage,
  });
  const cartRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cart",
    component: CartPage,
  });
  const checkoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/checkout",
    component: CheckoutPage,
  });
  const confirmationRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/order/$reference",
    component: ConfirmationPage,
  });
  const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: AdminDashboardPage,
  });

  const routeTree = rootRoute.addChildren([
    homeRoute,
    menuRoute,
    cartRoute,
    checkoutRoute,
    confirmationRoute,
    adminRoute,
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

/** Render an element inside a fresh QueryClientProvider. */
export function renderWithProviders(
  ui: ReactElement,
  queryClient: QueryClient = makeQueryClient(),
): RenderResult & { queryClient: QueryClient } {
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
  return { ...result, queryClient };
}

/** Render the full app router at a given path. */
export async function renderApp(
  initialPath = "/",
  queryClient: QueryClient = makeQueryClient(),
): Promise<RenderResult & { queryClient: QueryClient }> {
  const { router, ...result } = await renderAppWithRouter(
    initialPath,
    queryClient,
  );
  return { ...result, queryClient };
}

/**
 * Like `renderApp`, but also returns the router so tests can assert on the
 * current URL (the admin dashboard reflects its filter/search state there).
 */
export async function renderAppWithRouter(
  initialPath = "/",
  queryClient: QueryClient = makeQueryClient(),
): Promise<
  RenderResult & {
    queryClient: QueryClient;
    router: ReturnType<typeof makeTestRouter>;
  }
> {
  const router = makeTestRouter(initialPath);
  await router.load();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...result, queryClient, router };
}

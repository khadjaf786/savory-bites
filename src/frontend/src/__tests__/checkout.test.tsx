import { setMockActor } from "@/__tests__/mock-actor";
import {
  SAMPLE_DISHES,
  makeActorMock,
  makeDish,
  renderApp,
} from "@/__tests__/test-utils";
import { useCartStore } from "@/store/cart";
import { usePlacedOrdersStore } from "@/store/orders";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const PRAWNS = makeDish({
  id: 1n,
  name: "Garlic Butter Prawns",
  price: 899n,
  category: "starters",
});

async function fillContactAndAddress(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByTestId("checkout.name_input"), "Alex Rivera");
  await user.type(screen.getByTestId("checkout.phone_input"), "5035550142");
  await user.type(screen.getByTestId("checkout.street_input"), "18 Ember Lane");
  await user.type(screen.getByTestId("checkout.city_input"), "Portland");
  await user.type(screen.getByTestId("checkout.postcode_input"), "97205");
}

describe("checkout", () => {
  beforeEach(() => {
    setMockActor(makeActorMock(SAMPLE_DISHES));
    useCartStore.setState({ lines: [] });
    usePlacedOrdersStore.setState({ byReference: {} });
    window.localStorage.clear();
  });

  it("shows the empty state when the cart has no lines", async () => {
    await renderApp("/checkout");

    expect(screen.getByTestId("checkout.empty_state")).toBeInTheDocument();
    expect(screen.queryByTestId("checkout.form")).not.toBeInTheDocument();
  });

  it("blocks submission and reports missing required fields", async () => {
    useCartStore.setState({ lines: [{ dish: PRAWNS, quantity: 1 }] });
    const placeOrder = vi.fn();
    setMockActor(makeActorMock(SAMPLE_DISHES, { placeOrder }));

    await renderApp("/checkout");
    await userEvent.setup().click(screen.getByTestId("checkout.submit_button"));

    expect(await screen.findByTestId("checkout.name_error")).toHaveTextContent(
      "Enter the name for this order.",
    );
    expect(screen.getByTestId("checkout.phone_error")).toBeInTheDocument();
    expect(screen.getByTestId("checkout.street_error")).toBeInTheDocument();
    expect(screen.getByTestId("checkout.city_error")).toBeInTheDocument();
    expect(screen.getByTestId("checkout.postcode_error")).toBeInTheDocument();
    expect(placeOrder).not.toHaveBeenCalled();
  });

  it("places a cash order and lands on the confirmation page", async () => {
    useCartStore.setState({ lines: [{ dish: PRAWNS, quantity: 2 }] });
    const user = userEvent.setup();

    await renderApp("/checkout");
    await fillContactAndAddress(user);
    await user.click(screen.getByTestId("checkout.submit_button"));

    // Navigates to /order/$reference and shows the reference from the backend.
    expect(await screen.findByTestId("confirmation.hero")).toBeInTheDocument();
    expect(screen.getByTestId("confirmation.reference")).toHaveTextContent(
      "ORD-000001",
    );
    expect(screen.getByTestId("confirmation.payment_method")).toHaveTextContent(
      "Cash on Delivery",
    );
    // 2 × $8.99 = $17.98 subtotal, + $3.99 delivery = $21.97 total.
    expect(screen.getByTestId("confirmation.total")).toHaveTextContent(
      "$21.97",
    );

    // The cart is cleared once the order is accepted.
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("reveals card fields only for card payment and requires a cardholder", async () => {
    useCartStore.setState({ lines: [{ dish: PRAWNS, quantity: 1 }] });
    const user = userEvent.setup();

    await renderApp("/checkout");
    expect(
      screen.queryByTestId("checkout.card_details_panel"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByTestId("checkout.payment_card_radio"));
    expect(
      await screen.findByTestId("checkout.card_details_panel"),
    ).toBeInTheDocument();

    await fillContactAndAddress(user);
    await user.click(screen.getByTestId("checkout.submit_button"));

    expect(
      await screen.findByTestId("checkout.cardholder_error"),
    ).toHaveTextContent("Enter the cardholder name.");
    expect(screen.getByTestId("checkout.cardnumber_error")).toBeInTheDocument();
    expect(screen.queryByTestId("confirmation.hero")).not.toBeInTheDocument();
  });

  it("surfaces a backend rejection without navigating away", async () => {
    useCartStore.setState({ lines: [{ dish: PRAWNS, quantity: 1 }] });
    setMockActor(
      makeActorMock(SAMPLE_DISHES, {
        placeOrder: async () => ({
          err: { kind: "dishUnavailable", dishId: 1n },
        }),
      }),
    );
    const user = userEvent.setup();

    await renderApp("/checkout");
    await fillContactAndAddress(user);
    await user.click(screen.getByTestId("checkout.submit_button"));

    const alert = await screen.findByTestId("checkout.error_state");
    expect(alert).toHaveTextContent(
      "One of the dishes in your cart is currently unavailable.",
    );
    expect(screen.queryByTestId("confirmation.hero")).not.toBeInTheDocument();
    // The cart is preserved so the customer can adjust it.
    expect(useCartStore.getState().lines).toHaveLength(1);
  });

  it("shows the order summary panel with the cart subtotal", async () => {
    useCartStore.setState({
      lines: [
        { dish: PRAWNS, quantity: 1 },
        { dish: SAMPLE_DISHES[1], quantity: 1 },
      ],
    });

    await renderApp("/checkout");

    const summary = screen.getByTestId("checkout.summary_panel");
    expect(
      within(summary).getByText("Garlic Butter Prawns"),
    ).toBeInTheDocument();
    expect(within(summary).getByText("Margherita Pizza")).toBeInTheDocument();
  });

  it("renders the confirmation with correct totals after a rehydrated refresh", async () => {
    // A refresh reloads the placed-orders store from localStorage, where
    // BigInt.prototype.toJSON has serialized every bigint to a string. The
    // confirmation page must still show the reference, address, and totals.
    window.localStorage.setItem(
      "savory-bites-orders",
      JSON.stringify({
        state: {
          byReference: {
            "ORD-000042": {
              id: "42",
              reference: "ORD-000042",
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
                  dishId: "1",
                  name: "Garlic Butter Prawns",
                  unitPrice: "899",
                  quantity: "2",
                },
              ],
              subtotal: "1798",
              deliveryFee: "399",
              total: "2197",
              paymentMethod: "cash",
              status: "placed",
              createdAt: "1700000000000000000",
            },
          },
        },
        version: 1,
      }),
    );
    await usePlacedOrdersStore.persist.rehydrate();

    await renderApp("/order/ORD-000042");

    expect(screen.getByTestId("confirmation.reference")).toHaveTextContent(
      "ORD-000042",
    );
    expect(screen.getByTestId("confirmation.address")).toHaveTextContent(
      "18 Ember Lane",
    );
    expect(screen.getByTestId("confirmation.payment_method")).toHaveTextContent(
      "Cash on Delivery",
    );
    // 2 × $8.99 = $17.98 subtotal, + $3.99 delivery = $21.97 total.
    expect(screen.getByTestId("confirmation.total")).toHaveTextContent(
      "$21.97",
    );
  });
});

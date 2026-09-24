import { setMockActor } from "@/__tests__/mock-actor";
import { makeActorMock, makeDish, renderApp } from "@/__tests__/test-utils";
import { selectSubtotal, useCartStore } from "@/store/cart";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

const PRAWNS = makeDish({
  id: 1n,
  name: "Garlic Butter Prawns",
  price: 899n,
  category: "starters",
});
const PIZZA = makeDish({
  id: 5n,
  name: "Margherita Pizza",
  price: 1199n,
  category: "mains",
});

describe("cart", () => {
  beforeEach(() => {
    setMockActor(makeActorMock([PRAWNS, PIZZA]));
    useCartStore.setState({ lines: [] });
    window.localStorage.clear();
  });

  it("updates the header cart count when a dish is added", async () => {
    const user = userEvent.setup();
    await renderApp("/menu");

    const starters = await screen.findByTestId(
      "menu.category_section.starters",
    );
    await user.click(within(starters).getByTestId("menu.add_to_cart_button.1"));

    await waitFor(() => {
      expect(screen.getByTestId("site.cart_badge")).toHaveTextContent("1");
    });

    // Add a second prawn via the card quantity stepper.
    await user.click(
      within(starters).getByTestId("menu.quantity_increase_button.1"),
    );
    await user.click(within(starters).getByTestId("menu.add_to_cart_button.1"));

    await waitFor(() => {
      expect(screen.getByTestId("site.cart_badge")).toHaveTextContent("3");
    });
  });

  it("shows the correct line items and subtotal on the cart page", async () => {
    useCartStore.setState({
      lines: [
        { dish: PRAWNS, quantity: 2 },
        { dish: PIZZA, quantity: 1 },
      ],
    });

    await renderApp("/cart");

    const list = screen.getByTestId("cart.list");
    expect(within(list).getByText("Garlic Butter Prawns")).toBeInTheDocument();
    expect(within(list).getByText("Margherita Pizza")).toBeInTheDocument();

    // 2 × $8.99 + 1 × $11.99 = $29.97
    expect(screen.getByTestId("cart.subtotal")).toHaveTextContent("$29.97");
    // Under the $50 free-delivery threshold, so the $3.99 fee applies.
    expect(screen.getByTestId("cart.delivery_fee")).toHaveTextContent("$3.99");
    expect(screen.getByTestId("cart.total")).toHaveTextContent("$33.96");
  });

  it("persists cart contents to storage and rehydrates them", async () => {
    const user = userEvent.setup();
    await renderApp("/menu");

    const starters = await screen.findByTestId(
      "menu.category_section.starters",
    );
    await user.click(within(starters).getByTestId("menu.add_to_cart_button.1"));

    await waitFor(() => {
      expect(useCartStore.getState().lines).toHaveLength(1);
    });

    // The persist middleware writes the cart to localStorage on every change.
    const persisted = window.localStorage.getItem("savory-bites-cart");
    expect(persisted).toBeTruthy();
    expect(persisted).toContain("Garlic Butter Prawns");

    // A fresh page load starts from empty in-memory state and rehydrates from
    // the stored payload. Clearing state also rewrites storage, so restore the
    // captured payload to model the reload faithfully.
    useCartStore.setState({ lines: [] });
    expect(useCartStore.getState().lines).toHaveLength(0);
    window.localStorage.setItem("savory-bites-cart", persisted as string);
    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].dish.name).toBe(
      "Garlic Butter Prawns",
    );
    expect(useCartStore.getState().lines[0].quantity).toBe(1);
  });

  it("normalizes stringified bigints when rehydrating a persisted cart", async () => {
    // BigInt.prototype.toJSON serializes persisted bigints to strings, so a
    // stored cart comes back with string ids/prices. The store's merge must
    // coerce them before any bigint arithmetic runs.
    window.localStorage.setItem(
      "savory-bites-cart",
      JSON.stringify({
        state: {
          lines: [
            {
              dish: {
                id: "1",
                name: "Garlic Butter Prawns",
                description: "Succulent prawns seared in garlic butter.",
                price: "899",
                category: "starters",
                imageUrl: "https://example.test/prawns.jpg",
                featured: false,
                available: true,
              },
              quantity: 2,
            },
          ],
        },
        version: 1,
      }),
    );

    await useCartStore.persist.rehydrate();

    const [line] = useCartStore.getState().lines;
    expect(typeof line.dish.id).toBe("bigint");
    expect(typeof line.dish.price).toBe("bigint");
    expect(line.dish.price).toBe(899n);
    // 2 × $8.99 = $17.98, computed without mixing BigInt and number.
    expect(selectSubtotal(useCartStore.getState())).toBe(1798n);
  });

  it("renders correct amounts on the cart page after a rehydrated reload", async () => {
    window.localStorage.setItem(
      "savory-bites-cart",
      JSON.stringify({
        state: {
          lines: [
            {
              dish: {
                id: "1",
                name: "Garlic Butter Prawns",
                description: "Succulent prawns seared in garlic butter.",
                price: "899",
                category: "starters",
                imageUrl: "https://example.test/prawns.jpg",
                featured: false,
                available: true,
              },
              quantity: 2,
            },
          ],
        },
        version: 1,
      }),
    );
    await useCartStore.persist.rehydrate();

    await renderApp("/cart");

    expect(screen.getByTestId("cart.subtotal")).toHaveTextContent("$17.98");
    expect(screen.getByTestId("cart.total")).toHaveTextContent("$21.97");
  });

  it("removes a line via its remove button and falls back to the empty state", async () => {
    useCartStore.setState({ lines: [{ dish: PRAWNS, quantity: 1 }] });

    await renderApp("/cart");

    await userEvent.setup().click(screen.getByTestId("cart.remove_button.1"));

    await waitFor(() => {
      expect(screen.getByTestId("cart.empty_state")).toBeInTheDocument();
    });
    expect(useCartStore.getState().lines).toHaveLength(0);
  });
});

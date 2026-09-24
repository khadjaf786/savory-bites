import { setMockActor } from "@/__tests__/mock-actor";
import { makeActorMock, renderApp } from "@/__tests__/test-utils";
import { useCartStore } from "@/store/cart";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

/**
 * Baseline for the storefront route surface. The admin dashboard work adds a
 * new /admin route and admin-only endpoints; these tests pin the existing
 * customer-facing routes so that change cannot silently break them.
 */
describe("storefront routes", () => {
  beforeEach(() => {
    setMockActor(makeActorMock());
    useCartStore.setState({ lines: [] });
    window.localStorage.clear();
  });

  it("renders the default route with the app shell instead of a blank screen", async () => {
    await renderApp("/");

    // The layout shell (header + footer) and the home page both mount.
    expect(screen.getByTestId("site.header")).toBeInTheDocument();
    expect(screen.getByTestId("home.page")).toBeInTheDocument();
    expect(screen.getByTestId("home.hero.section")).toBeInTheDocument();
    // A blank screen would leave the document body with no visible text.
    expect(document.body.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });

  it("renders the menu route", async () => {
    await renderApp("/menu");

    await waitFor(() => {
      expect(screen.getByTestId("menu.page")).toBeInTheDocument();
    });
  });

  it("renders the cart route", async () => {
    await renderApp("/cart");

    expect(screen.getByTestId("cart.page")).toBeInTheDocument();
    expect(screen.getByTestId("cart.empty_state")).toBeInTheDocument();
  });

  it("renders the checkout route", async () => {
    await renderApp("/checkout");

    expect(screen.getByTestId("checkout.page")).toBeInTheDocument();
    expect(screen.getByTestId("checkout.empty_state")).toBeInTheDocument();
  });

  it("renders the confirmation route for an unknown reference", async () => {
    await renderApp("/order/ORD-999999");

    expect(screen.getByTestId("confirmation.page")).toBeInTheDocument();
    expect(screen.getByTestId("confirmation.reference")).toHaveTextContent(
      "ORD-999999",
    );
    // An unknown reference still renders the graceful fallback, not a crash.
    expect(
      screen.getByTestId("confirmation.not_found_state"),
    ).toBeInTheDocument();
  });

  it("keeps the header navigation links to Home and Menu working", async () => {
    await renderApp("/");

    expect(screen.getByTestId("site.nav.home")).toBeInTheDocument();
    expect(screen.getByTestId("site.nav.menu")).toBeInTheDocument();
    expect(screen.getByTestId("site.cart_link")).toBeInTheDocument();
  });
});

import { setMockActor } from "@/__tests__/mock-actor";
import { makeActorMock, renderApp } from "@/__tests__/test-utils";
import { FREE_DELIVERY_THRESHOLD_CENTS, formatPrice } from "@/lib/format";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

describe("HomePage", () => {
  beforeEach(() => {
    setMockActor(makeActorMock());
  });

  it("renders the hero with the restaurant name, tagline, and Order Now CTA", async () => {
    await renderApp("/");

    const hero = screen.getByTestId("home.hero.section");
    expect(
      within(hero).getByRole("heading", { name: /wood-fired flavours/i }),
    ).toBeInTheDocument();
    expect(
      within(hero).getByRole("link", { name: /order now/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("site.logo_link")).toHaveTextContent(
      "Savory Bites",
    );
  });

  it("navigates to the menu when the hero Order Now button is clicked", async () => {
    const user = userEvent.setup();
    await renderApp("/");

    const hero = screen.getByTestId("home.hero.section");
    await user.click(within(hero).getByRole("link", { name: /order now/i }));

    await waitFor(() => {
      expect(screen.getByTestId("menu.page")).toBeInTheDocument();
    });
  });

  it("shows the restaurant introduction and opening hours", async () => {
    await renderApp("/");

    expect(screen.getByTestId("home.about.section")).toHaveTextContent(
      /a neighbourhood bistro built around a single fire/i,
    );
    const visit = screen.getByTestId("home.visit.section");
    expect(
      within(visit).getByRole("heading", { name: /opening hours/i }),
    ).toBeInTheDocument();
    expect(within(visit).getByText("Monday – Thursday")).toBeInTheDocument();
  });

  it("derives the free-delivery copy from the shared threshold constant", async () => {
    await renderApp("/");

    // Both the hero stat and the visit call-to-action render the threshold via
    // formatPrice(FREE_DELIVERY_THRESHOLD_CENTS), so the copy tracks the
    // constant instead of hard-coding a stale amount.
    const expected = formatPrice(FREE_DELIVERY_THRESHOLD_CENTS);
    expect(expected).toBe("$50.00");

    const hero = screen.getByTestId("home.hero.section");
    expect(within(hero).getByText(expected)).toBeInTheDocument();

    const visit = screen.getByTestId("home.visit.section");
    expect(visit).toHaveTextContent(
      `Free delivery on orders over ${expected}.`,
    );
  });
});

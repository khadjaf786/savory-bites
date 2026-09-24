import { setMockActor } from "@/__tests__/mock-actor";
import {
  SAMPLE_DISHES,
  makeActorMock,
  renderApp,
} from "@/__tests__/test-utils";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

describe("MenuPage", () => {
  beforeEach(() => {
    setMockActor(makeActorMock());
  });

  it("lists dishes grouped by category with prices", async () => {
    await renderApp("/menu");

    await waitFor(() => {
      expect(screen.getByTestId("menu.dish_list")).toBeInTheDocument();
    });

    // Unfiltered menu groups dishes into per-category sections.
    expect(
      screen.getByTestId("menu.category_section.starters"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("menu.category_section.mains"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("menu.category_section.desserts"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("menu.category_section.drinks"),
    ).toBeInTheDocument();

    expect(screen.getByText("Garlic Butter Prawns")).toBeInTheDocument();
    expect(screen.getByText("$8.99")).toBeInTheDocument();
  });

  it("narrows the visible dishes when a category tab is selected", async () => {
    const user = userEvent.setup();
    await renderApp("/menu");

    await waitFor(() => {
      expect(screen.getByText("Garlic Butter Prawns")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("menu.category.tab.desserts"));

    await waitFor(() => {
      expect(
        screen.getByText("Molten Chocolate Lava Cake"),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText("Garlic Butter Prawns")).not.toBeInTheDocument();
    expect(screen.queryByText("Margherita Pizza")).not.toBeInTheDocument();
  });

  it("narrows the visible dishes when searching by name", async () => {
    const user = userEvent.setup();
    await renderApp("/menu");

    await waitFor(() => {
      expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    });

    await user.type(screen.getByTestId("menu.search_input"), "pizza");

    await waitFor(() => {
      expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    });
    expect(screen.queryByText("Garlic Butter Prawns")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Molten Chocolate Lava Cake"),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state with a clear-filters action when nothing matches", async () => {
    const user = userEvent.setup();
    await renderApp("/menu");

    await waitFor(() => {
      expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    });

    await user.type(
      screen.getByTestId("menu.search_input"),
      "definitely-not-a-dish",
    );

    await waitFor(() => {
      expect(screen.getByTestId("menu.empty_state")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("menu.clear_filters_button"));

    await waitFor(() => {
      expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    });
  });

  it("renders every sample dish exactly once", async () => {
    await renderApp("/menu");

    await waitFor(() => {
      expect(screen.getByTestId("menu.dish_list")).toBeInTheDocument();
    });

    for (const dish of SAMPLE_DISHES) {
      expect(screen.getAllByText(dish.name)).toHaveLength(1);
    }
  });
});

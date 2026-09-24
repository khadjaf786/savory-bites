import {
  type CategoryFilter,
  CategoryTabs,
} from "@/components/menu/CategoryTabs";
import { DishCard } from "@/components/menu/DishCard";
import { MenuSearch } from "@/components/menu/MenuSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { useDishes } from "@/hooks/useQueries";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/format";
import type { Dish } from "@/types";
import { Link } from "@tanstack/react-router";
import { SearchX, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";

const SKELETON_IDS = Array.from({ length: 6 }, (_, i) => `dish-skeleton-${i}`);

export function MenuPage() {
  const { data: dishes, isLoading, isError } = useDishes();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (dishes ?? []).filter((dish) => {
      const matchesCategory = category === "all" || dish.category === category;
      if (!matchesCategory) return false;
      if (term.length === 0) return true;
      return (
        dish.name.toLowerCase().includes(term) ||
        dish.description.toLowerCase().includes(term)
      );
    });
  }, [dishes, category, query]);

  const hasFilters = category !== "all" || query.trim().length > 0;

  // When nothing is filtered, group dishes into per-category sections so the
  // menu reads as courses. A category or search filter falls back to a flat grid.
  const grouped = useMemo(() => {
    if (hasFilters) return [];
    return CATEGORY_ORDER.map((value) => ({
      category: value,
      label: CATEGORY_LABELS[value],
      dishes: filtered.filter((dish) => dish.category === value),
    })).filter((group) => group.dishes.length > 0);
  }, [filtered, hasFilters]);

  return (
    <div data-ocid="menu.page" className="bg-background">
      <section className="border-b border-border/70 bg-ember texture-grain">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="eyebrow">Our Kitchen</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            The Menu
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Wood-fired plates, slow-simmered sauces and house-made sweets —
            browse by course or search for a craving.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <CategoryTabs active={category} onChange={setCategory} />
          <MenuSearch value={query} onChange={setQuery} />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div
              data-ocid="menu.loading_state"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {SKELETON_IDS.map((id) => (
                <div
                  key={id}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-9 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div
              data-ocid="menu.error_state"
              className="rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-warm"
            >
              <h2 className="font-display text-xl font-semibold text-foreground">
                We couldn't load the menu
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Something went wrong on our side. Please refresh the page to try
                again.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="menu.empty_state"
              className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-warm"
            >
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-primary">
                {hasFilters ? (
                  <SearchX className="size-6" aria-hidden="true" />
                ) : (
                  <UtensilsCrossed className="size-6" aria-hidden="true" />
                )}
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
                {hasFilters
                  ? "No dishes match your search"
                  : "The menu is empty"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {hasFilters
                  ? "Try a different category or clear your search to see everything we're cooking."
                  : "Our kitchen is still setting up. Check back shortly for today's dishes."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  data-ocid="menu.clear_filters_button"
                  onClick={() => {
                    setCategory("all");
                    setQuery("");
                  }}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-full gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-warm transition-smooth hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : hasFilters ? (
            <div
              data-ocid="menu.dish_list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((dish, index) => (
                <DishCard key={dish.id.toString()} dish={dish} index={index} />
              ))}
            </div>
          ) : (
            <div data-ocid="menu.dish_list" className="space-y-14">
              {grouped.map((group) => (
                <section
                  key={group.category}
                  data-ocid={`menu.category_section.${group.category}`}
                  aria-labelledby={`menu-heading-${group.category}`}
                >
                  <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                    <h2
                      id={`menu-heading-${group.category}`}
                      className="font-display text-2xl font-semibold tracking-tight text-foreground"
                    >
                      {group.label}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {group.dishes.length}{" "}
                      {group.dishes.length === 1 ? "dish" : "dishes"}
                    </span>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.dishes.map((dish: Dish, index: number) => (
                      <DishCard
                        key={dish.id.toString()}
                        dish={dish}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {!isLoading && !isError && filtered.length > 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Craving something else?{" "}
            <Link
              to="/cart"
              data-ocid="menu.view_cart_link"
              className="font-semibold text-primary underline-offset-4 transition-smooth hover:underline"
            >
              Review your cart
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}

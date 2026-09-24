import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDishes } from "@/hooks/useQueries";
import { categoryLabel, formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import type { Dish } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";

const SKELETON_IDS = Array.from(
  { length: 3 },
  (_, index) => `featured-skeleton-${index}`,
);

export function FeaturedDishes() {
  const { data: dishes, isLoading, isError } = useDishes();
  const addToCart = useCartStore((state) => state.add);

  const featured = (dishes ?? [])
    .filter((dish) => dish.featured && dish.available)
    .slice(0, 4);

  return (
    <section
      data-ocid="home.featured.section"
      className="border-b border-border bg-secondary/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-fade-up">
            <p className="eyebrow">From the kitchen</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Signature dishes
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              A handful of plates our regulars order again and again — pulled
              straight from tonight&apos;s menu.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            data-ocid="home.featured.view_menu_link"
            className="self-start rounded-full text-primary transition-smooth hover:bg-secondary hover:text-primary sm:self-auto"
          >
            <Link to="/menu">
              View full menu
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div
            data-ocid="home.featured.loading_state"
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SKELETON_IDS.map((id) => (
              <div
                key={id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p
            data-ocid="home.featured.error_state"
            className="mt-12 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"
          >
            We couldn&apos;t load tonight&apos;s dishes. Please refresh, or{" "}
            <Link
              to="/menu"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              browse the full menu
            </Link>
            .
          </p>
        ) : featured.length === 0 ? (
          <div
            data-ocid="home.featured.empty_state"
            className="mt-12 rounded-2xl border border-dashed border-border bg-card p-10 text-center"
          >
            <h3 className="font-display text-xl font-semibold text-foreground">
              Tonight&apos;s specials are being plated
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Our featured dishes change daily. Take a look at the full menu to
              see everything the kitchen is cooking right now.
            </p>
            <Button
              asChild
              data-ocid="home.featured.empty_state_button"
              className="mt-6 rounded-full"
            >
              <Link to="/menu">Browse the menu</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((dish, index) => (
              <FeaturedDishCard
                key={dish.id.toString()}
                dish={dish}
                index={index}
                onAdd={() => addToCart(dish)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

interface FeaturedDishCardProps {
  dish: Dish;
  index: number;
  onAdd: () => void;
}

function FeaturedDishCard({ dish, index, onAdd }: FeaturedDishCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <li
      data-ocid={`home.featured.item.${index + 1}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-warm transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-warm-lg animate-fade-up"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-smooth group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-foreground backdrop-blur">
          {categoryLabel(dish.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
          {dish.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {dish.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="font-display text-lg font-semibold text-accent">
            {formatPrice(dish.price)}
          </span>
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            data-ocid={`home.featured.add_button.${index + 1}`}
            aria-label={`Add ${dish.name} to cart`}
            className="rounded-full transition-smooth"
          >
            <Plus className="size-4" aria-hidden="true" />
            {justAdded ? "Added" : "Add"}
          </Button>
        </div>
      </div>
    </li>
  );
}

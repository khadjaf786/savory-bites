import { categoryLabel, formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import type { Dish } from "@/types";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";

interface DishCardProps {
  dish: Dish;
  index: number;
}

export function DishCard({ dish, index }: DishCardProps) {
  const add = useCartStore((state) => state.add);
  const [quantity, setQuantity] = useState(1);
  const [popping, setPopping] = useState(false);

  const unavailable = !dish.available;

  function handleAdd() {
    if (unavailable) return;
    add(dish, quantity);
    setQuantity(1);
    setPopping(true);
    window.setTimeout(() => setPopping(false), 400);
  }

  return (
    <article
      data-ocid={`menu.dish_card.${index + 1}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-warm transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-warm-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          loading="lazy"
          className="size-full object-cover transition-smooth group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
          {categoryLabel(dish.category)}
        </span>
        {unavailable && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-destructive-foreground">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
            {dish.name}
          </h3>
          <p className="shrink-0 font-display text-lg font-semibold text-accent">
            {formatPrice(dish.price)}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {dish.description}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-2">
          <div className="flex items-center rounded-full border border-border bg-background">
            <button
              type="button"
              data-ocid={`menu.quantity_decrease_button.${index + 1}`}
              aria-label={`Decrease quantity of ${dish.name}`}
              disabled={unavailable || quantity <= 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-smooth hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span
              data-ocid={`menu.quantity_value.${index + 1}`}
              aria-live="polite"
              className="min-w-6 text-center text-sm font-semibold tabular-nums text-foreground"
            >
              {quantity}
            </span>
            <button
              type="button"
              data-ocid={`menu.quantity_increase_button.${index + 1}`}
              aria-label={`Increase quantity of ${dish.name}`}
              disabled={unavailable}
              onClick={() =>
                setQuantity((current) => Math.min(20, current + 1))
              }
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-smooth hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            data-ocid={`menu.add_to_cart_button.${index + 1}`}
            disabled={unavailable}
            onClick={handleAdd}
            className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-warm transition-smooth hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
              popping ? "animate-cart-pop" : ""
            }`}
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            {unavailable ? "Unavailable" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}

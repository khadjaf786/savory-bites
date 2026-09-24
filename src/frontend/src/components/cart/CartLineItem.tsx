import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import type { CartLine } from "@/types";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartLineItemProps {
  line: CartLine;
  index: number;
}

export function CartLineItem({ line, index }: CartLineItemProps) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);

  const { dish } = line;
  // Persisted carts can rehydrate numeric fields as plain numbers, so coerce
  // both operands before multiplying to avoid mixing BigInt with number.
  const quantity = Number(line.quantity);
  const unitPrice = BigInt(dish.price);
  const lineTotal = unitPrice * BigInt(quantity);
  const position = index + 1;

  return (
    <li
      data-ocid={`cart.item.${position}`}
      className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-warm transition-smooth hover:border-primary/40 hover:shadow-warm-lg sm:gap-5 sm:p-5"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:size-24">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          loading="lazy"
          className="size-full object-cover transition-smooth group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold tracking-tight text-foreground">
              {dish.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <span className="font-display tabular-nums text-accent">
                {formatPrice(unitPrice)}
              </span>{" "}
              each
            </p>
          </div>

          <button
            type="button"
            data-ocid={`cart.remove_button.${position}`}
            aria-label={`Remove ${dish.name} from cart`}
            onClick={() => remove(dish.id)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-smooth hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            data-ocid={`cart.quantity_stepper.${position}`}
            className="inline-flex items-center rounded-full border border-border bg-background p-1"
          >
            <button
              type="button"
              data-ocid={`cart.decrement_button.${position}`}
              aria-label={`Decrease quantity of ${dish.name}`}
              disabled={quantity <= 1}
              onClick={() => setQuantity(dish.id, quantity - 1)}
              className="inline-flex size-8 items-center justify-center rounded-full text-foreground transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span
              data-ocid={`cart.quantity.${position}`}
              aria-live="polite"
              className="min-w-8 text-center font-display text-base font-semibold tabular-nums text-foreground"
            >
              {quantity}
            </span>
            <button
              type="button"
              data-ocid={`cart.increment_button.${position}`}
              aria-label={`Increase quantity of ${dish.name}`}
              onClick={() => setQuantity(dish.id, quantity + 1)}
              className="inline-flex size-8 items-center justify-center rounded-full text-foreground transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <p
            data-ocid={`cart.line_total.${position}`}
            className="font-display text-lg font-semibold tabular-nums text-accent"
          >
            {formatPrice(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}

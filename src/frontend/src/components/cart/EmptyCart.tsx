import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag } from "lucide-react";

export function EmptyCart() {
  return (
    <div
      data-ocid="cart.empty_state"
      className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-warm"
    >
      <span
        aria-hidden="true"
        className="grid size-16 place-items-center rounded-full bg-accent/15 text-accent"
      >
        <ShoppingBag className="size-7" />
      </span>

      <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">
        Your cart is empty
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Browse the menu and add a few wood-fired favourites to get started.
      </p>

      <Button
        asChild
        className="mt-8 h-12 rounded-full gradient-primary px-8 text-base font-semibold text-primary-foreground shadow-warm transition-smooth hover:-translate-y-0.5 hover:shadow-warm-lg"
      >
        <Link to="/menu" data-ocid="cart.browse_menu_button">
          Browse the menu
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

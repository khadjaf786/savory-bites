import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummaryPanel } from "@/components/checkout/OrderSummaryPanel";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartSubtotal } from "@/store/cart";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

export function CheckoutPage() {
  const lines = useCartStore((state) => state.lines);
  const subtotal = useCartSubtotal();

  if (lines.length === 0) {
    return (
      <div
        data-ocid="checkout.page"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div
          data-ocid="checkout.empty_state"
          className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-warm"
        >
          <span
            aria-hidden="true"
            className="grid size-16 place-items-center rounded-full bg-secondary text-primary"
          >
            <ShoppingBag className="size-7" />
          </span>
          <div className="grid gap-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground">
              Add a few dishes from the menu and your checkout will be waiting
              right here.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            data-ocid="checkout.browse_menu_button"
            className="h-12 rounded-full gradient-primary px-8 text-base font-semibold text-primary-foreground shadow-warm transition-smooth hover:shadow-warm-lg"
          >
            <Link to="/menu">Browse the menu</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="checkout.page"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <header className="max-w-2xl">
        <p className="eyebrow">Almost there</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Checkout
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tell us where to deliver and how you would like to pay. We will
          confirm your order in a moment.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <CheckoutForm />
        <div className="lg:sticky lg:top-24">
          <OrderSummaryPanel lines={lines} subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}

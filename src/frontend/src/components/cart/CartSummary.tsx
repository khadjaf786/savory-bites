import { Button } from "@/components/ui/button";
import {
  FREE_DELIVERY_THRESHOLD_CENTS,
  deliveryFeeFor,
  formatPrice,
} from "@/lib/format";
import { useCartSubtotal } from "@/store/cart";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Truck } from "lucide-react";

export function CartSummary() {
  const subtotal = useCartSubtotal();
  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;
  const isFreeDelivery = deliveryFee === 0n;
  const remaining = FREE_DELIVERY_THRESHOLD_CENTS - subtotal;

  return (
    <aside
      data-ocid="cart.summary_panel"
      aria-label="Order summary"
      className="rounded-2xl border border-border bg-card p-6 shadow-warm lg:sticky lg:top-24"
    >
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        Order summary
      </h2>

      <dl className="mt-6 flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd
            data-ocid="cart.subtotal"
            className="font-display text-base font-semibold tabular-nums text-foreground"
          >
            {formatPrice(subtotal)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd
            data-ocid="cart.delivery_fee"
            className={
              isFreeDelivery
                ? "font-display text-base font-semibold text-success"
                : "font-display text-base font-semibold tabular-nums text-foreground"
            }
          >
            {isFreeDelivery ? "Free" : formatPrice(deliveryFee)}
          </dd>
        </div>
      </dl>

      {!isFreeDelivery && remaining > 0n && (
        <p
          data-ocid="cart.free_delivery_hint"
          className="mt-4 flex items-start gap-2 rounded-xl bg-accent/10 px-3 py-2.5 text-xs text-accent"
        >
          <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Add {formatPrice(remaining)} more for free delivery.</span>
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
        <span className="font-display text-lg font-semibold text-foreground">
          Total
        </span>
        <span
          data-ocid="cart.total"
          className="font-display text-2xl font-bold tabular-nums text-accent"
        >
          {formatPrice(total)}
        </span>
      </div>

      <Button
        asChild
        className="mt-6 h-12 w-full rounded-full gradient-primary text-base font-semibold text-primary-foreground shadow-warm transition-smooth hover:-translate-y-0.5 hover:shadow-warm-lg"
      >
        <Link to="/checkout" data-ocid="cart.checkout_button">
          Proceed to Checkout
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>

      <Link
        to="/menu"
        data-ocid="cart.continue_shopping_link"
        className="mt-4 block text-center text-sm font-medium text-muted-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Continue shopping
      </Link>
    </aside>
  );
}

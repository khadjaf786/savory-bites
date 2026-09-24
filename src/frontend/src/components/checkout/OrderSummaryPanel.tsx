import { Separator } from "@/components/ui/separator";
import {
  DELIVERY_FEE_CENTS,
  FREE_DELIVERY_THRESHOLD_CENTS,
  deliveryFeeFor,
  formatPrice,
} from "@/lib/format";
import type { CartLine } from "@/types";
import { Truck } from "lucide-react";

export interface OrderSummaryPanelProps {
  lines: CartLine[];
  subtotal: bigint;
}

export function OrderSummaryPanel({ lines, subtotal }: OrderSummaryPanelProps) {
  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;
  const remainingForFreeDelivery = FREE_DELIVERY_THRESHOLD_CENTS - subtotal;
  const qualifiesForFreeDelivery = deliveryFee === 0n && subtotal > 0n;

  return (
    <section
      data-ocid="checkout.summary_panel"
      aria-label="Order summary"
      className="rounded-2xl border border-border bg-card p-6 shadow-warm"
    >
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        Order summary
      </h2>

      <ul data-ocid="checkout.summary_list" className="mt-5 grid gap-4">
        {lines.map((line) => (
          <li
            key={line.dish.id.toString()}
            data-ocid="checkout.summary_item"
            className="flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {line.dish.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(line.dish.price)} × {line.quantity}
              </p>
            </div>
            <p className="shrink-0 font-medium tabular-nums text-accent">
              {formatPrice(
                BigInt(line.dish.price) * BigInt(Number(line.quantity)),
              )}
            </p>
          </li>
        ))}
      </ul>

      <Separator className="my-5" />

      <dl className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums text-foreground">
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Delivery fee</dt>
          <dd className="tabular-nums text-foreground">
            {deliveryFee === 0n ? "Free" : formatPrice(deliveryFee)}
          </dd>
        </div>
      </dl>

      {qualifiesForFreeDelivery ? (
        <p
          data-ocid="checkout.free_delivery_note"
          className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success"
        >
          <Truck className="size-4 shrink-0" aria-hidden="true" />
          You have unlocked free delivery.
        </p>
      ) : (
        remainingForFreeDelivery > 0n && (
          <p
            data-ocid="checkout.free_delivery_note"
            className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm text-muted-foreground"
          >
            <Truck className="size-4 shrink-0 text-accent" aria-hidden="true" />
            Add {formatPrice(remainingForFreeDelivery)} more for free delivery.
          </p>
        )
      )}

      <Separator className="my-5" />

      <div className="flex items-baseline justify-between">
        <span className="font-display text-lg font-semibold text-foreground">
          Total
        </span>
        <span
          data-ocid="checkout.total_value"
          className="font-display text-2xl font-semibold tabular-nums text-accent"
        >
          {formatPrice(total)}
        </span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Delivery fee is {formatPrice(DELIVERY_FEE_CENTS)} and waived on orders
        over {formatPrice(FREE_DELIVERY_THRESHOLD_CENTS)}.
      </p>
    </section>
  );
}

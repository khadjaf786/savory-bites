import { Separator } from "@/components/ui/separator";
import { formatPrice, paymentLabel } from "@/lib/format";
import type { Order } from "@/types";
import { CreditCard, MapPin, Wallet } from "lucide-react";

interface OrderDetailsCardProps {
  order: Order;
}

/**
 * Full order breakdown: line items with quantities and totals, the delivery
 * address, the payment method, and the order total.
 */
export function OrderDetailsCard({ order }: OrderDetailsCardProps) {
  const { address } = order;
  const addressLines = [
    address.street,
    [address.city, address.postcode].filter(Boolean).join(", "),
  ].filter((line) => line.trim().length > 0);

  return (
    <section
      data-ocid="confirmation.details_card"
      className="rounded-2xl border border-border bg-card p-6 shadow-warm sm:p-8"
    >
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        Order details
      </h2>

      <ul
        data-ocid="confirmation.items_list"
        className="mt-6 divide-y divide-border"
      >
        {order.items.map((item, index) => (
          <li
            key={`${item.dishId.toString()}-${index}`}
            data-ocid={`confirmation.item.${index + 1}`}
            className="flex items-start justify-between gap-4 py-4 first:pt-0"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatPrice(item.unitPrice)} × {item.quantity.toString()}
              </p>
            </div>
            <p className="shrink-0 font-mono text-sm font-semibold text-accent">
              {formatPrice(item.unitPrice * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <Separator className="my-6" />

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            Delivery address
          </h3>
          <address
            data-ocid="confirmation.address"
            className="not-italic text-sm leading-relaxed text-foreground"
          >
            {addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            {address.notes.trim().length > 0 && (
              <span className="mt-2 block text-muted-foreground">
                {address.notes}
              </span>
            )}
          </address>
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {order.paymentMethod === "card" ? (
              <CreditCard className="size-4 text-primary" aria-hidden="true" />
            ) : (
              <Wallet className="size-4 text-primary" aria-hidden="true" />
            )}
            Payment method
          </h3>
          <p
            data-ocid="confirmation.payment_method"
            className="text-sm font-medium text-foreground"
          >
            {paymentLabel(order.paymentMethod)}
          </p>
          {order.paymentMethod === "card" && order.cardholderName && (
            <p className="text-sm text-muted-foreground">
              Cardholder: {order.cardholderName}
            </p>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-mono text-foreground">
            {formatPrice(order.subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="font-mono text-foreground">
            {order.deliveryFee === 0n ? "Free" : formatPrice(order.deliveryFee)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
          <dt className="font-display text-lg font-semibold text-foreground">
            Total
          </dt>
          <dd
            data-ocid="confirmation.total"
            className="font-mono text-lg font-semibold text-accent"
          >
            {formatPrice(order.total)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

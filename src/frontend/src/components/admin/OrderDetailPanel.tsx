import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatDateTime, formatPrice, paymentLabel } from "@/lib/format";
import type { Order } from "@/types";
import { CreditCard, MapPin, Phone, Receipt, User } from "lucide-react";

interface OrderDetailPanelProps {
  order: Order;
}

/** Full breakdown of a single order: contact, address, line items, and totals. */
export function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  const { address } = order;
  const addressLine = [address.street, address.city, address.postcode]
    .filter((part) => part.trim() !== "")
    .join(", ");

  return (
    <div
      data-ocid="admin.order.detail_panel"
      className="grid gap-6 border-t border-border bg-secondary/40 px-4 py-5 sm:px-6 lg:grid-cols-[1.4fr_1fr]"
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField icon={User} label="Customer">
            {order.customerName}
          </DetailField>
          <DetailField icon={Phone} label="Phone">
            <a
              href={`tel:${order.phone}`}
              className="rounded-sm underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {order.phone}
            </a>
          </DetailField>
          <DetailField icon={MapPin} label="Delivery address">
            {addressLine || "—"}
            {address.notes.trim() !== "" && (
              <span className="mt-1 block text-xs italic text-muted-foreground">
                Note: {address.notes}
              </span>
            )}
          </DetailField>
          <DetailField icon={CreditCard} label="Payment">
            {paymentLabel(order.paymentMethod)}
            {order.paymentMethod === "card" && order.cardholderName && (
              <span className="mt-1 block text-xs text-muted-foreground">
                Cardholder: {order.cardholderName}
              </span>
            )}
          </DetailField>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Receipt className="size-4 text-primary" aria-hidden="true" />
            Line items
          </h3>
          <ul
            data-ocid="admin.order.items_list"
            className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
          >
            {order.items.map((item, index) => (
              <li
                key={`${item.dishId.toString()}-${index}`}
                data-ocid={`admin.order.item.${index + 1}`}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(item.unitPrice)} each
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-secondary-foreground">
                    ×{item.quantity.toString()}
                  </span>
                  <span className="w-20 text-right font-medium tabular-nums text-foreground">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Status
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums text-foreground">
                {formatPrice(order.subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Delivery fee</dt>
              <dd className="tabular-nums text-foreground">
                {order.deliveryFee === 0n
                  ? "Free"
                  : formatPrice(order.deliveryFee)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd
                data-ocid="admin.order.detail_total"
                className="font-display text-lg font-semibold tabular-nums text-foreground"
              >
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </div>

        <dl className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <dt>Reference</dt>
            <dd className="font-mono text-foreground">{order.reference}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Placed</dt>
            <dd className="text-foreground">
              {formatDateTime(order.createdAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

interface DetailFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}

function DetailField({ icon: Icon, label, children }: DetailFieldProps) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      <div className="mt-1 break-words text-sm text-foreground">{children}</div>
    </div>
  );
}

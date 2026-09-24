import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import {
  BadgeDollarSign,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  XCircle,
} from "lucide-react";
import type { ComponentType } from "react";

const STATUS_CARDS: {
  status: OrderStatus;
  label: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}[] = [
  {
    status: "placed",
    label: "New orders",
    icon: ChefHat,
    accent: "text-accent",
  },
  {
    status: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    accent: "text-primary",
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: PackageCheck,
    accent: "text-[oklch(0.5_0.13_148)] dark:text-[oklch(0.78_0.14_150)]",
  },
  {
    status: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    accent: "text-destructive",
  },
];

interface DashboardSummaryProps {
  orders: Order[];
}

/** Status counts plus total revenue, shown above the orders list. */
export function DashboardSummary({ orders }: DashboardSummaryProps) {
  const counts = orders.reduce<Record<OrderStatus, number>>(
    (acc, order) => {
      acc[order.status] += 1;
      return acc;
    },
    { placed: 0, confirmed: 0, delivered: 0, cancelled: 0 },
  );

  // Revenue counts every order that was not cancelled.
  const revenue = orders.reduce(
    (total, order) =>
      order.status === "cancelled" ? total : total + order.total,
    0n,
  );

  return (
    <section
      data-ocid="admin.summary.section"
      aria-label="Order summary"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div
        data-ocid="admin.summary.revenue_card"
        className="relative overflow-hidden rounded-2xl border border-primary/25 bg-card p-5 shadow-warm sm:col-span-2 lg:col-span-1"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full gradient-primary opacity-15"
        />
        <div className="flex items-center gap-2 text-primary">
          <BadgeDollarSign className="size-4" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
            Revenue
          </span>
        </div>
        <p
          data-ocid="admin.summary.revenue_value"
          className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground"
        >
          {formatPrice(revenue)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Excludes cancelled orders
        </p>
      </div>

      {STATUS_CARDS.map(({ status, label, icon: Icon, accent }) => (
        <div
          key={status}
          data-ocid={`admin.summary.card.${status}`}
          className="rounded-2xl border border-border bg-card p-5 shadow-warm"
        >
          <div className={cn("flex items-center gap-2", accent)}>
            <Icon className="size-4" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              {label}
            </span>
          </div>
          <p
            data-ocid={`admin.summary.count.${status}`}
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground"
          >
            {counts[status]}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {counts[status] === 1 ? "order" : "orders"}
          </p>
        </div>
      ))}
    </section>
  );
}

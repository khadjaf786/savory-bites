import { orderStatusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

/**
 * Per-status presentation. Each status gets a distinct hue drawn from the warm
 * Bistro Ember palette so a glance down the dashboard reads at a distance.
 */
const STATUS_STYLES: Record<OrderStatus, string> = {
  placed:
    "border-accent/40 bg-accent/15 text-accent-foreground dark:text-accent",
  confirmed: "border-primary/40 bg-primary/12 text-primary dark:text-primary",
  delivered:
    "border-[oklch(0.55_0.14_148/0.4)] bg-[oklch(0.55_0.14_148/0.14)] text-[oklch(0.4_0.13_148)] dark:text-[oklch(0.78_0.14_150)]",
  cancelled:
    "border-destructive/40 bg-destructive/12 text-destructive dark:text-destructive",
};

const STATUS_DOT: Record<OrderStatus, string> = {
  placed: "bg-accent",
  confirmed: "bg-primary",
  delivered: "bg-[oklch(0.55_0.14_148)]",
  cancelled: "bg-destructive",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

/** A compact, colour-coded pill for an order's lifecycle status. */
export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      data-ocid={`admin.order.status_badge.${status}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", STATUS_DOT[status])}
      />
      {orderStatusLabel(status)}
    </span>
  );
}

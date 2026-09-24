import { OrderDetailPanel } from "@/components/admin/OrderDetailPanel";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { nextStatusesFor } from "@/lib/admin";
import { formatDateTime, formatPrice, paymentLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";

/** Verb-first label for the action that moves an order into `status`. */
const ACTION_LABELS: Record<OrderStatus, string> = {
  placed: "Reopen",
  confirmed: "Confirm order",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
};

interface OrderRowProps {
  order: Order;
  index: number;
  expanded: boolean;
  onToggle: (orderId: bigint) => void;
  onUpdateStatus: (orderId: bigint, status: OrderStatus) => void;
  isUpdating: boolean;
  errorMessage?: string;
}

/**
 * One order in the dashboard list. Collapsed it shows the at-a-glance summary;
 * expanded it reveals the full line-item breakdown and the status actions.
 */
export function OrderRow({
  order,
  index,
  expanded,
  onToggle,
  onUpdateStatus,
  isUpdating,
  errorMessage,
}: OrderRowProps) {
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const actions = nextStatusesFor(order.status);
  const addressLine = [order.address.street, order.address.city]
    .filter((part) => part.trim() !== "")
    .join(", ");

  const handleAction = (status: OrderStatus) => {
    setPendingStatus(status);
    onUpdateStatus(order.id, status);
  };

  return (
    <li
      data-ocid={`admin.order.row.${index + 1}`}
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-warm transition-smooth",
        expanded
          ? "border-primary/40"
          : "border-border hover:border-primary/30",
      )}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <button
          type="button"
          data-ocid={`admin.order.toggle.${index + 1}`}
          aria-expanded={expanded}
          onClick={() => onToggle(order.id)}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-border bg-secondary text-muted-foreground transition-smooth",
              expanded && "rotate-180 border-primary/40 text-primary",
            )}
          >
            <ChevronDown className="size-4" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-sm font-semibold text-foreground">
                {order.reference}
              </span>
              <OrderStatusBadge status={order.status} />
            </span>
            <span className="mt-1 block truncate text-sm font-medium text-foreground">
              {order.customerName}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {order.phone}
              {addressLine && ` · ${addressLine}`}
            </span>
          </span>
        </button>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
          <span
            data-ocid={`admin.order.total.${index + 1}`}
            className="font-display text-lg font-semibold tabular-nums text-foreground"
          >
            {formatPrice(order.total)}
          </span>
          <span className="text-xs text-muted-foreground">
            {paymentLabel(order.paymentMethod)} ·{" "}
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      </div>

      {expanded && (
        <>
          <OrderDetailPanel order={order} />

          <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-muted-foreground">
              {actions.length === 0
                ? "This order is closed. No further changes are possible."
                : "Update the order status:"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {actions.map((status) => {
                const isDestructive = status === "cancelled";
                const isPending = isUpdating && pendingStatus === status;
                return (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={isDestructive ? "outline" : "default"}
                    data-ocid={`admin.order.action.${status}.${index + 1}`}
                    disabled={isUpdating}
                    onClick={() => handleAction(status)}
                    className={cn(
                      "rounded-full px-4",
                      isDestructive &&
                        "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
                    )}
                  >
                    {isPending && (
                      <Loader2
                        className="size-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    {ACTION_LABELS[status]}
                  </Button>
                );
              })}
            </div>
          </div>

          {errorMessage && (
            <p
              data-ocid={`admin.order.error.${index + 1}`}
              role="alert"
              className="border-t border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:px-6"
            >
              {errorMessage}
            </p>
          )}
        </>
      )}
    </li>
  );
}

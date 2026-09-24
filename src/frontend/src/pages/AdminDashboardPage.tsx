import { AdminGate } from "@/components/admin/AdminGate";
import { DashboardSummary } from "@/components/admin/DashboardSummary";
import { OrderRow } from "@/components/admin/OrderRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UpdateOrderStatusError_,
  useAdminOrders,
  useIsCallerAdmin,
  useUpdateOrderStatus,
} from "@/hooks/useAdmin";
import { updateOrderStatusErrorMessage } from "@/lib/admin";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ClipboardList, SearchX, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";

type StatusFilter = OrderStatus | "all";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "placed", label: ORDER_STATUS_LABELS.placed },
  { value: "confirmed", label: ORDER_STATUS_LABELS.confirmed },
  { value: "delivered", label: ORDER_STATUS_LABELS.delivered },
  { value: "cancelled", label: ORDER_STATUS_LABELS.cancelled },
];

const SKELETON_IDS = Array.from({ length: 4 }, (_, i) => `order-skeleton-${i}`);

function isStatusFilter(value: unknown): value is StatusFilter {
  return (
    value === "all" ||
    value === "placed" ||
    value === "confirmed" ||
    value === "delivered" ||
    value === "cancelled"
  );
}

export function AdminDashboardPage() {
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}

function AdminDashboard() {
  const search = useSearch({ strict: false }) as {
    status?: unknown;
    q?: unknown;
  };
  const navigate = useNavigate();

  const status: StatusFilter = isStatusFilter(search.status)
    ? search.status
    : "all";
  const query = typeof search.q === "string" ? search.q : "";

  const { data: isAdmin } = useIsCallerAdmin();
  const { data: orders, isLoading, isError } = useAdminOrders(isAdmin === true);
  const updateStatus = useUpdateOrderStatus();

  const [expandedId, setExpandedId] = useState<bigint | null>(null);
  const [rowError, setRowError] = useState<{
    orderId: bigint;
    message: string;
  } | null>(null);

  const setStatus = (next: StatusFilter) => {
    void navigate({
      to: "/admin",
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        status: next === "all" ? undefined : next,
      }),
      replace: true,
    });
  };

  const setQuery = (next: string) => {
    void navigate({
      to: "/admin",
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        q: next.trim() === "" ? undefined : next,
      }),
      replace: true,
    });
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (orders ?? []).filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (term.length === 0) return true;
      return (
        order.reference.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term)
      );
    });
  }, [orders, status, query]);

  const hasFilters = status !== "all" || query.trim().length > 0;

  const handleUpdateStatus = (orderId: bigint, next: OrderStatus) => {
    setRowError(null);
    updateStatus.mutate(
      { orderId, status: next },
      {
        onError: (error) => {
          const message =
            error instanceof UpdateOrderStatusError_
              ? updateOrderStatusErrorMessage(error.detail)
              : "We could not update this order. Please try again.";
          setRowError({ orderId, message });
        },
      },
    );
  };

  return (
    <div data-ocid="admin.page" className="bg-background">
      <section className="border-b border-border/70 bg-ember texture-grain">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="eyebrow">Staff Dashboard</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Incoming Orders
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Every order placed through the storefront, newest first. Confirm,
            deliver, or cancel as the kitchen works through the queue.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <div
            data-ocid="admin.error_state"
            className="rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-warm"
          >
            <h2 className="font-display text-xl font-semibold text-foreground">
              We couldn't load the orders
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Something went wrong while fetching the order queue. Please
              refresh the page to try again.
            </p>
          </div>
        ) : (
          <>
            <DashboardSummary orders={orders ?? []} />

            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div
                data-ocid="admin.filter.tabs"
                role="tablist"
                aria-label="Filter orders by status"
                className="flex flex-wrap gap-2"
              >
                {FILTERS.map((filter) => {
                  const active = status === filter.value;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      data-ocid={`admin.filter.tab.${filter.value}`}
                      onClick={() => setStatus(filter.value)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-warm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:max-w-xs">
                <SearchX
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  data-ocid="admin.search_input"
                  aria-label="Search orders by reference or customer name"
                  placeholder="Search reference or name…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="rounded-full pl-9"
                />
              </div>
            </div>

            <div className="mt-6">
              {filtered.length === 0 ? (
                <EmptyState
                  hasFilters={hasFilters}
                  onClear={() => {
                    void navigate({
                      to: "/admin",
                      search: {},
                      replace: true,
                    });
                  }}
                />
              ) : (
                <ul
                  data-ocid="admin.order.list"
                  className="flex flex-col gap-4"
                >
                  {filtered.map((order: Order, index: number) => (
                    <OrderRow
                      key={order.id.toString()}
                      order={order}
                      index={index}
                      expanded={expandedId === order.id}
                      onToggle={(orderId) =>
                        setExpandedId((current) =>
                          current === orderId ? null : orderId,
                        )
                      }
                      onUpdateStatus={handleUpdateStatus}
                      isUpdating={
                        updateStatus.isPending &&
                        updateStatus.variables?.orderId === order.id
                      }
                      errorMessage={
                        rowError?.orderId === order.id
                          ? rowError.message
                          : undefined
                      }
                    />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div data-ocid="admin.loading_state">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => `summary-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-28 w-full rounded-2xl" />
          ),
        )}
      </div>
      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:justify-between">
        <Skeleton className="h-10 w-72 rounded-full" />
        <Skeleton className="h-10 w-full rounded-full lg:w-80" />
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {SKELETON_IDS.map((id) => (
          <Skeleton key={id} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  hasFilters: boolean;
  onClear: () => void;
}

function EmptyState({ hasFilters, onClear }: EmptyStateProps) {
  return (
    <div
      data-ocid="admin.empty_state"
      className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-warm"
    >
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-primary">
        {hasFilters ? (
          <SearchX className="size-6" aria-hidden="true" />
        ) : (
          <ClipboardList className="size-6" aria-hidden="true" />
        )}
      </span>
      <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
        {hasFilters ? "No orders match your filters" : "No orders yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {hasFilters
          ? "Try a different status or clear your search to see the full queue."
          : "When customers place orders from the storefront, they'll appear here in real time."}
      </p>
      {hasFilters && (
        <Button
          type="button"
          data-ocid="admin.clear_filters_button"
          onClick={onClear}
          className="mt-6 rounded-full px-5"
        >
          Clear filters
        </Button>
      )}
      {!hasFilters && (
        <span className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <UtensilsCrossed className="size-3.5" aria-hidden="true" />
          Waiting for the first order
        </span>
      )}
    </div>
  );
}

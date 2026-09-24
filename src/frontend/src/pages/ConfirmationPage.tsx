import { ConfirmationHero } from "@/components/confirmation/ConfirmationHero";
import { OrderDetailsCard } from "@/components/confirmation/OrderDetailsCard";
import { Button } from "@/components/ui/button";
import { usePlacedOrder } from "@/store/orders";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, PhoneCall } from "lucide-react";

export function ConfirmationPage() {
  const { reference } = useParams({ from: "/order/$reference" });
  const order = usePlacedOrder(reference);

  return (
    <div
      data-ocid="confirmation.page"
      className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <ConfirmationHero reference={reference} />

      <div className="mt-8 space-y-6">
        {order ? <OrderDetailsCard order={order} /> : <MissingOrderNotice />}

        <NextStepsCard />

        <div className="flex justify-center pt-2">
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full px-6 transition-smooth"
          >
            <Link to="/menu" data-ocid="confirmation.back_to_menu_link">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to menu
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Graceful fallback for a reference we cannot resolve — for example after a
 * refresh on another device, or a direct visit. It still shows the reference
 * and the next-step message instead of an error.
 */
function MissingOrderNotice() {
  return (
    <section
      data-ocid="confirmation.not_found_state"
      className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center sm:p-8"
    >
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        We couldn&apos;t load the full order details
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Your order is still confirmed — the reference above is all we need. If
        you&apos;d like a copy of the itemised receipt, give us a call and
        we&apos;ll pull it up.
      </p>
    </section>
  );
}

/** The single clear next step: the restaurant will call to confirm. */
function NextStepsCard() {
  return (
    <section
      data-ocid="confirmation.next_steps"
      className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-6 sm:flex-row sm:items-start sm:p-8"
    >
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-warm"
      >
        <PhoneCall className="size-5" />
      </span>
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          What happens next
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Our team will call you shortly to confirm your order and the delivery
          time. Please keep your phone nearby — if we can&apos;t reach you, we
          may need to hold the order.
        </p>
      </div>
    </section>
  );
}

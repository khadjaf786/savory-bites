import { Check } from "lucide-react";

interface ConfirmationHeroProps {
  reference: string;
}

/**
 * Celebratory confirmation hero: success check, serif headline, and the order
 * reference displayed prominently so the customer can quote it when the
 * restaurant calls.
 */
export function ConfirmationHero({ reference }: ConfirmationHeroProps) {
  return (
    <section
      data-ocid="confirmation.hero"
      className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-warm sm:px-10 sm:py-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 texture-grain opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <span
          data-ocid="confirmation.success_state"
          className="grid size-16 place-items-center rounded-full gradient-primary text-primary-foreground shadow-warm-lg animate-ember-pulse"
        >
          <Check className="size-8" strokeWidth={3} aria-hidden="true" />
        </span>

        <p className="eyebrow mt-6">Thank you</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Order confirmed
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          Your order is in the kitchen. We&apos;ve saved your details and will
          be in touch shortly to confirm everything.
        </p>

        <div className="mt-8 w-full max-w-sm rounded-2xl border border-border bg-background/60 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Order reference
          </p>
          <p
            data-ocid="confirmation.reference"
            className="mt-2 break-all font-mono text-2xl font-semibold tracking-tight text-accent sm:text-3xl"
          >
            {reference}
          </p>
        </div>
      </div>
    </section>
  );
}

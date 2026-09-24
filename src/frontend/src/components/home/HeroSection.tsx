import { Button } from "@/components/ui/button";
import { FREE_DELIVERY_THRESHOLD_CENTS, formatPrice } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

export function HeroSection() {
  return (
    <section
      data-ocid="home.hero.section"
      className="relative isolate overflow-hidden border-b border-border bg-ember"
    >
      <img
        src="/assets/generated/hero-dish.dim_1536x1024.jpg"
        alt="Herb-roasted whole chicken with roasted vegetables and charred lemon on a dark plate in a candlelit bistro"
        className="absolute inset-0 size-full object-cover opacity-45"
        loading="eager"
        decoding="async"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-1/2 size-[28rem] -translate-y-1/2 rounded-full bg-primary/25 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="max-w-2xl animate-fade-up">
          <p className="eyebrow">Modern Bistro · Est. 2019</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Wood-fired flavours,
            <br />
            <span className="text-gradient-ember">delivered warm.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Seasonal produce, slow embers and a menu that changes with the
            market. Order from our kitchen and we&apos;ll bring the bistro to
            your table.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              data-ocid="home.hero.primary_button"
              className="h-12 rounded-full px-7 text-base shadow-warm-lg transition-smooth hover:scale-[1.02]"
            >
              <Link to="/menu">
                Order Now
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              data-ocid="home.hero.secondary_button"
              className="h-12 rounded-full border-border bg-background/40 px-7 text-base backdrop-blur transition-smooth hover:bg-secondary"
            >
              <Link to="/menu">
                <UtensilsCrossed className="size-4" aria-hidden="true" />
                Browse Menu
              </Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border/70 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Kitchen
              </dt>
              <dd className="mt-1 font-display text-lg font-semibold text-foreground">
                Open daily
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Delivery
              </dt>
              <dd className="mt-1 font-display text-lg font-semibold text-foreground">
                30–40 min
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Free over
              </dt>
              <dd className="mt-1 font-display text-lg font-semibold text-accent">
                {formatPrice(FREE_DELIVERY_THRESHOLD_CENTS)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/button";
import { FREE_DELIVERY_THRESHOLD_CENTS, formatPrice } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";

const HOURS = [
  { days: "Monday – Thursday", time: "11:30 – 22:00" },
  { days: "Friday – Saturday", time: "11:30 – 23:30" },
  { days: "Sunday", time: "12:00 – 21:00" },
];

const CONTACT = [
  {
    icon: MapPin,
    label: "Find us",
    value: "42 Ember Lane, Riverside Quarter, Portland, OR 97204",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "(503) 555-0142",
    href: "tel:+15035550142",
  },
  {
    icon: Mail,
    label: "Email us",
    value: "hello@savorybites.example",
    href: "mailto:hello@savorybites.example",
  },
];

export function VisitSection() {
  return (
    <section
      data-ocid="home.visit.section"
      className="bg-background texture-grain"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="animate-fade-up">
          <p className="eyebrow">Visit us</p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Pull up a chair, or let us come to you
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Walk-ins are always welcome. Delivery runs across the city until
            close, seven days a week.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm animate-fade-up">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Clock className="size-4 text-primary" aria-hidden="true" />
              Opening hours
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {HOURS.map((row) => (
                <li
                  key={row.days}
                  className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 text-muted-foreground last:border-0 last:pb-0"
                >
                  <span>{row.days}</span>
                  <span className="font-mono text-xs text-foreground">
                    {row.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm animate-fade-up">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Contact
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              {CONTACT.map((item) => (
                <li key={item.label} className="flex gap-3">
                  <item.icon
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        data-ocid={`home.visit.${item.label.split(" ")[0].toLowerCase()}_link`}
                        className="mt-0.5 block break-words text-foreground transition-smooth hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 break-words text-foreground">
                        {item.value}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-primary/30 bg-ember p-6 shadow-warm-lg animate-fade-up">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Hungry now?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Browse tonight&apos;s menu and have it delivered warm. Free
                delivery on orders over{" "}
                {formatPrice(FREE_DELIVERY_THRESHOLD_CENTS)}.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              data-ocid="home.visit.order_button"
              className="mt-6 h-12 w-full rounded-full text-base shadow-warm transition-smooth hover:scale-[1.02]"
            >
              <Link to="/menu">
                Order Now
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

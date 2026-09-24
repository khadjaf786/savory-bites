import { Clock, Mail, MapPin, Phone } from "lucide-react";

const HOURS = [
  { days: "Monday – Thursday", time: "11:30 – 22:00" },
  { days: "Friday – Saturday", time: "11:30 – 23:30" },
  { days: "Sunday", time: "12:00 – 21:00" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-ocid="site.footer"
      className="border-t border-border bg-ember text-foreground"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <p className="font-display text-2xl font-semibold tracking-tight">
            Savory Bites
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Wood-fired flavours from our kitchen to your table. Modern bistro
            cooking, delivered warm across the city.
          </p>
          <p className="eyebrow">Modern Bistro · Est. 2019</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Visit us</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>42 Ember Lane, Riverside Quarter, Portland, OR 97204</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <a
                href="tel:+15035550142"
                data-ocid="site.footer.phone_link"
                className="transition-smooth hover:text-foreground"
              >
                (503) 555-0142
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <a
                href="mailto:hello@savorybites.example"
                data-ocid="site.footer.email_link"
                className="transition-smooth hover:text-foreground"
              >
                hello@savorybites.example
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Clock className="size-4 text-primary" aria-hidden="true" />
            Opening hours
          </h2>
          <ul className="space-y-2 text-sm">
            {HOURS.map((row) => (
              <li
                key={row.days}
                className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 text-muted-foreground last:border-0"
              >
                <span>{row.days}</span>
                <span className="font-mono text-xs text-foreground">
                  {row.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} Savory Bites. All rights reserved.</p>
          <p>
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              data-ocid="site.footer.attribution_link"
              className="font-medium text-primary transition-smooth hover:text-accent"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

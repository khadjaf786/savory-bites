import { AdminAuthControl } from "@/components/AdminAuthControl";
import { useCartItemCount } from "@/store/cart";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
] as const;

export function SiteHeader() {
  const itemCount = useCartItemCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the viewport grows past the breakpoint.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const handleChange = () => {
      if (query.matches) setMobileOpen(false);
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <header
      data-ocid="site.header"
      className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          data-ocid="site.logo_link"
          className="group flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full gradient-primary text-primary-foreground shadow-warm transition-smooth group-hover:scale-105"
          >
            <FlameMark />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            Savory Bites
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`site.nav.${link.label.toLowerCase()}`}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              activeProps={{
                className:
                  "rounded-full px-4 py-2 text-sm font-medium text-foreground bg-secondary",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            data-ocid="site.cart_link"
            aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            className="relative inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-warm transition-smooth hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span
                data-ocid="site.cart_badge"
                className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground animate-cart-pop"
              >
                {itemCount}
              </span>
            )}
          </Link>

          <div className="hidden md:block">
            <AdminAuthControl variant="desktop" />
          </div>

          <button
            type="button"
            data-ocid="site.mobile_menu_button"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile"
          data-ocid="site.mobile_menu"
          className="border-t border-border bg-card px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  data-ocid={`site.mobile_nav.${link.label.toLowerCase()}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
                  activeProps={{
                    className:
                      "block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground bg-secondary",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-border pt-2">
            <AdminAuthControl
              variant="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </nav>
      )}
    </header>
  );
}

function FlameMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-5"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2.5c.6 3.2-1.4 4.6-2.7 6.1C7.9 10.2 7 11.6 7 13.6a5 5 0 0 0 10 0c0-1.6-.7-2.9-1.6-4.1-.3 1-.9 1.7-1.7 2.1.4-2.6-.3-5.6-1.7-9.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

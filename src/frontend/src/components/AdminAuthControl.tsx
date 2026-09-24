import { useIsCallerAdmin } from "@/hooks/useAdmin";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogIn, LogOut, ShieldCheck } from "lucide-react";

/**
 * Sign-in / sign-out control plus the admin-only dashboard link. Rendered in
 * both the desktop header and the mobile drawer; `variant` only changes the
 * layout, never the behaviour.
 */
export function AdminAuthControl({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const { isAuthenticated, isLoggingIn, login, clear } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const showAdminLink = isAuthenticated && isAdmin === true;

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-1">
        {showAdminLink && (
          <Link
            to="/admin"
            data-ocid="site.mobile_nav.admin"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
            activeProps={{
              className:
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground bg-secondary",
            }}
          >
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Admin dashboard
          </Link>
        )}
        {isAuthenticated ? (
          <button
            type="button"
            data-ocid="site.mobile_nav.sign_out_button"
            onClick={() => {
              clear();
              onNavigate?.();
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        ) : (
          <button
            type="button"
            data-ocid="site.mobile_nav.sign_in_button"
            onClick={() => {
              login();
              onNavigate?.();
            }}
            disabled={isLoggingIn}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-primary transition-smooth hover:bg-secondary disabled:opacity-60"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {isLoggingIn ? "Signing in…" : "Admin sign in"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showAdminLink && (
        <Link
          to="/admin"
          data-ocid="site.admin_link"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-warm transition-smooth hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          activeProps={{
            className:
              "inline-flex h-10 items-center gap-2 rounded-full border border-primary/50 bg-secondary px-4 text-sm font-medium text-primary shadow-warm transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          }}
        >
          <LayoutDashboard className="size-4" aria-hidden="true" />
          <span className="hidden lg:inline">Dashboard</span>
        </Link>
      )}

      {isAuthenticated ? (
        <button
          type="button"
          data-ocid="site.sign_out_button"
          onClick={() => clear()}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-warm transition-smooth hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span className="hidden lg:inline">Sign out</span>
        </button>
      ) : (
        <button
          type="button"
          data-ocid="site.sign_in_button"
          onClick={() => login()}
          disabled={isLoggingIn}
          className="inline-flex h-10 items-center gap-2 rounded-full gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-warm transition-smooth hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">
            {isLoggingIn ? "Signing in…" : "Admin sign in"}
          </span>
        </button>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsCallerAdmin } from "@/hooks/useAdmin";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Lock, ShieldAlert, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";

interface AdminGateProps {
  children: ReactNode;
}

/**
 * Renders the admin dashboard only for a signed-in admin. Signed-out visitors
 * get a sign-in prompt, signed-in non-admins get a clear "not authorized"
 * state, and neither ever mounts the order data below.
 */
export function AdminGate({ children }: AdminGateProps) {
  const { isAuthenticated, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (!isAuthenticated) {
    return (
      <AdminNotice
        data-ocid="admin.signin_state"
        icon={<Lock className="size-6" aria-hidden="true" />}
        eyebrow="Staff area"
        title="Sign in to manage orders"
        description="The orders dashboard is reserved for Savory Bites staff. Sign in with Internet Identity to continue."
        action={
          <Button
            type="button"
            data-ocid="admin.signin_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="rounded-full px-6"
          >
            {isLoggingIn ? "Signing in…" : "Sign in"}
          </Button>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div
        data-ocid="admin.access_loading_state"
        className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-4 h-5 w-96 max-w-full" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => `admin-gate-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-28 w-full rounded-2xl" />
            ),
          )}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <AdminNotice
        data-ocid="admin.unauthorized_state"
        icon={<ShieldAlert className="size-6" aria-hidden="true" />}
        eyebrow="Access denied"
        title="You are not authorized"
        description="This account does not have admin access to the Savory Bites orders dashboard. Ask a restaurant owner to grant you access."
      />
    );
  }

  return <>{children}</>;
}

interface AdminNoticeProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  "data-ocid": string;
}

/** A centred, warm-toned notice used for the gate's non-authorized states. */
function AdminNotice({
  icon,
  eyebrow,
  title,
  description,
  action,
  "data-ocid": dataOcid,
}: AdminNoticeProps) {
  return (
    <div
      data-ocid={dataOcid}
      className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8"
    >
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-warm"
      >
        {icon}
      </span>
      <p className="eyebrow mt-6">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-balance text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-8">{action}</div>}
      <span className="mt-10 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <UtensilsCrossed className="size-3.5" aria-hidden="true" />
        Savory Bites · Staff dashboard
      </span>
    </div>
  );
}

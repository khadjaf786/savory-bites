import type { MenuOrderActor } from "./test-utils";

/**
 * Controllable holder for the actor returned by the mocked `useActor` hook.
 * Tests call `setMockActor(...)` before rendering; the mock reads it lazily so
 * the value is picked up on every render.
 */
let currentActor: MenuOrderActor | null = null;

export function setMockActor(actor: MenuOrderActor | null): void {
  currentActor = actor;
}

export function getMockActor(): MenuOrderActor | null {
  return currentActor;
}

/**
 * Drop-in replacement for `@caffeineai/core-infrastructure`'s `useActor`.
 * It returns the test-supplied actor synchronously (no query, no network) and
 * reports `isFetching: false` so `useDishes`/`usePlaceOrder` enable immediately.
 */
export function useActor<T>(): { actor: T | null; isFetching: boolean } {
  return { actor: currentActor as T | null, isFetching: false };
}

/**
 * Controllable Internet Identity state for the mocked provider. The admin gate
 * branches on `isAuthenticated`, so tests set this before rendering to model a
 * signed-out visitor, a signed-in non-admin, or a signed-in admin.
 */
export interface MockAuthState {
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  login: () => void;
  clear: () => void;
}

const defaultAuth: MockAuthState = {
  isAuthenticated: false,
  isLoggingIn: false,
  login: () => {},
  clear: () => {},
};

let currentAuth: MockAuthState = defaultAuth;

export function setMockAuth(auth: Partial<MockAuthState> | null): void {
  currentAuth = auth === null ? defaultAuth : { ...defaultAuth, ...auth };
}

export function getMockAuth(): MockAuthState {
  return currentAuth;
}

/**
 * Drop-in replacement for `useInternetIdentity`. Reads the test-supplied auth
 * state lazily so a `setMockAuth` before render is reflected on every render.
 */
export function useInternetIdentity(): MockAuthState & {
  identity: undefined;
  loginStatus: string;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
} {
  const auth = currentAuth;
  return {
    ...auth,
    identity: undefined,
    loginStatus: auth.isLoggingIn ? "logging-in" : "idle",
    isInitializing: false,
    isLoginIdle: !auth.isLoggingIn,
    isLoggingIn: auth.isLoggingIn,
    isLoginSuccess: false,
    isLoginError: false,
  };
}

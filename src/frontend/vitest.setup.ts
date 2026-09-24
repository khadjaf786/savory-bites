import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Generated components expose stable `data-ocid` hooks; use them as test ids
// so scoped queries stay readable without relying on CSS classes.
configure({ testIdAttribute: "data-ocid" });

// main.tsx installs this at app startup so persisted bigint prices (the cart
// store) survive JSON serialization. Tests render pages directly, so mirror it.
if (typeof BigInt.prototype.toJSON !== "function") {
  Object.defineProperty(BigInt.prototype, "toJSON", {
    value: function toJSON(this: bigint) {
      return this.toString();
    },
    writable: true,
    configurable: true,
  });
}

// jsdom does not implement matchMedia; SiteHeader uses it to close the mobile
// drawer at the desktop breakpoint. Provide a minimal, inert implementation.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// jsdom does not implement ResizeObserver; Radix UI primitives (radio groups,
// popovers) observe element size on mount. Provide an inert implementation.
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

// Replace the platform actor hook with a controllable local mock for every
// test file. The real hook would otherwise reach for Internet Identity and a
// live canister; tests supply a typed actor via `setMockActor`.
vi.mock("@caffeineai/core-infrastructure", async () => {
  const mock = await import("./src/__tests__/mock-actor");
  return {
    useActor: mock.useActor,
    InternetIdentityProvider: ({ children }: { children: unknown }) => children,
    useInternetIdentity: mock.useInternetIdentity,
  };
});

afterEach(() => {
  cleanup();
});

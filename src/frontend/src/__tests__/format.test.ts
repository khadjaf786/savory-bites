import {
  DELIVERY_FEE_CENTS,
  FREE_DELIVERY_THRESHOLD_CENTS,
  deliveryFeeFor,
  formatPrice,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("formatPrice", () => {
  it("renders bigint cents as a currency string", () => {
    expect(formatPrice(899n)).toBe("$8.99");
    expect(formatPrice(0n)).toBe("$0.00");
  });

  it("renders a stringified bigint rehydrated from storage", () => {
    // BigInt.prototype.toJSON serializes persisted bigints to strings, so a
    // rehydrated price arrives as a string and must not render as $0.00.
    expect(formatPrice("899")).toBe("$8.99");
    expect(formatPrice("1199")).toBe("$11.99");
  });

  it("renders plain numbers and falls back to $0.00 for unusable input", () => {
    expect(formatPrice(899)).toBe("$8.99");
    expect(formatPrice("")).toBe("$0.00");
    expect(formatPrice("not-a-number")).toBe("$0.00");
  });
});

describe("deliveryFeeFor", () => {
  it("waives the fee at or above the free-delivery threshold", () => {
    expect(deliveryFeeFor(0n)).toBe(0n);
    expect(deliveryFeeFor(FREE_DELIVERY_THRESHOLD_CENTS - 1n)).toBe(
      DELIVERY_FEE_CENTS,
    );
    expect(deliveryFeeFor(FREE_DELIVERY_THRESHOLD_CENTS)).toBe(0n);
    expect(deliveryFeeFor(FREE_DELIVERY_THRESHOLD_CENTS + 1n)).toBe(0n);
  });
});

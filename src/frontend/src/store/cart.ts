import type { CartLine, Dish, DishId } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  lines: CartLine[];
  add: (dish: Dish, quantity?: number) => void;
  remove: (dishId: DishId) => void;
  setQuantity: (dishId: DishId, quantity: number) => void;
  clear: () => void;
}

function sameId(a: DishId, b: DishId): boolean {
  return a === b;
}

/**
 * Coerce a value that may have been rehydrated from localStorage into a bigint.
 * JSON.parse turns persisted bigints into plain numbers, so every numeric field
 * on a persisted cart line must be normalized before any bigint arithmetic.
 */
function toBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return BigInt(Math.trunc(value));
  }
  if (typeof value === "string" && value.trim() !== "") {
    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }
  return 0n;
}

/** Coerce a value that may have been rehydrated into a safe integer quantity. */
function toQuantity(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.trunc(value));
  }
  if (typeof value === "bigint") {
    return Math.max(1, Number(value));
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(1, Math.trunc(parsed));
  }
  return 1;
}

/** Normalize a single persisted cart line so its numeric fields are bigint-safe. */
function normalizeLine(line: unknown): CartLine | null {
  if (!line || typeof line !== "object") return null;
  const candidate = line as Partial<CartLine> & { dish?: Partial<Dish> };
  if (!candidate.dish || typeof candidate.dish !== "object") return null;
  const dish = candidate.dish;
  if (typeof dish.name !== "string") return null;
  return {
    dish: {
      id: toBigInt(dish.id),
      name: dish.name,
      description: typeof dish.description === "string" ? dish.description : "",
      price: toBigInt(dish.price),
      category: dish.category ?? "mains",
      imageUrl: typeof dish.imageUrl === "string" ? dish.imageUrl : "",
      featured: Boolean(dish.featured),
      available: dish.available !== false,
    },
    quantity: toQuantity(candidate.quantity),
  };
}

/** Normalize the persisted slice, dropping any line that cannot be repaired. */
function normalizeLines(lines: unknown): CartLine[] {
  if (!Array.isArray(lines)) return [];
  return lines
    .map(normalizeLine)
    .filter((line): line is CartLine => line !== null);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (dish, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) =>
            sameId(line.dish.id, dish.id),
          );
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                sameId(line.dish.id, dish.id)
                  ? { ...line, quantity: line.quantity + quantity }
                  : line,
              ),
            };
          }
          return { lines: [...state.lines, { dish, quantity }] };
        }),
      remove: (dishId) =>
        set((state) => ({
          lines: state.lines.filter((line) => !sameId(line.dish.id, dishId)),
        })),
      setQuantity: (dishId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              lines: state.lines.filter(
                (line) => !sameId(line.dish.id, dishId),
              ),
            };
          }
          return {
            lines: state.lines.map((line) =>
              sameId(line.dish.id, dishId) ? { ...line, quantity } : line,
            ),
          };
        }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "savory-bites-cart",
      version: 1,
      partialize: (state) => ({ lines: state.lines }),
      // Persisted bigints come back from JSON.parse as plain numbers. Merge the
      // rehydrated slice through normalizeLines so every line's dish.id,
      // dish.price, and quantity are bigint-safe before any arithmetic runs.
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<CartState> | undefined;
        return {
          ...current,
          lines: normalizeLines(persistedState?.lines),
        };
      },
    },
  ),
);

/** Total number of items in the cart (sum of quantities). */
export function selectItemCount(state: CartState): number {
  return state.lines.reduce(
    (total, line) => total + toQuantity(line.quantity),
    0,
  );
}

/** Subtotal in minor currency units (cents). */
export function selectSubtotal(state: CartState): bigint {
  return state.lines.reduce(
    (total, line) =>
      total + toBigInt(line.dish.price) * toBigInt(line.quantity),
    0n,
  );
}

export function useCartItemCount(): number {
  return useCartStore(selectItemCount);
}

export function useCartSubtotal(): bigint {
  return useCartStore(selectSubtotal);
}

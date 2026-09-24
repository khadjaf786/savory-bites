import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BASELINE_WASM });
  await pic.upgradeCanister({ canisterId: installed.canisterId, wasm: BACKEND_WASM, arg: new Uint8Array() });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("lists the seeded menu instead of trapping", async () => {
  const dishes = await actor.listDishes();
  expect(dishes.length).toBeGreaterThan(0);
  // The migration seeds the first-run menu; every dish carries its full shape.
  const prawns = dishes.find((dish) => dish.name === "Garlic Butter Prawns");
  expect(prawns).toBeDefined();
  expect(prawns).toMatchObject({
    id: 1n,
    price: 899n,
    category: { starters: null },
    available: true,
  });
});

it("reads a single dish by id and returns an empty option for an unknown id", async () => {
  const found = await actor.getDish(1n);
  expect(found).toHaveLength(1);
  expect(found[0]).toMatchObject({ id: 1n, name: "Garlic Butter Prawns" });

  // Candid `?T` decodes to `[] | [T]`, so an absent dish is an empty array.
  await expect(actor.getDish(999_999n)).resolves.toEqual([]);
});

it("rejects an empty cart with a caller-actionable error", async () => {
  const result = await actor.placeOrder(
    "Alex Rivera",
    "5035550142",
    { street: "18 Ember Lane", city: "Portland", postcode: "97205", notes: "" },
    [],
    { cash: null },
    [],
  );
  expect(result).toEqual({ err: { emptyCart: null } });
});

it("rejects a card order with no cardholder name", async () => {
  const result = await actor.placeOrder(
    "Alex Rivera",
    "5035550142",
    { street: "18 Ember Lane", city: "Portland", postcode: "97205", notes: "" },
    [{ dishId: 1n, name: "Garlic Butter Prawns", unitPrice: 899n, quantity: 1n }],
    { card: null },
    [],
  );
  expect(result).toEqual({ err: { missingCardholderName: null } });
});

it("round-trips a cash order through the real canister", async () => {
  const result = await actor.placeOrder(
    "Alex Rivera",
    "5035550142",
    { street: "18 Ember Lane", city: "Portland", postcode: "97205", notes: "Leave at door" },
    [
      { dishId: 1n, name: "Garlic Butter Prawns", unitPrice: 899n, quantity: 2n },
      { dishId: 5n, name: "Margherita Pizza", unitPrice: 1199n, quantity: 1n },
    ],
    { cash: null },
    [],
  );

  expect("ok" in result).toBe(true);
  if (!("ok" in result)) {
    throw new Error("expected a placed order");
  }
  const order = result.ok;
  // Prices are re-derived from the current menu, not trusted from the request.
  expect(order.subtotal).toBe(2n * 899n + 1199n);
  expect(order.deliveryFee).toBe(399n);
  expect(order.total).toBe(order.subtotal + order.deliveryFee);
  expect(order.reference).toMatch(/^ORD-\d{6}$/u);
  expect(order.paymentMethod).toEqual({ cash: null });
  expect(order.cardholderName).toEqual([]);
  expect(order.address).toMatchObject({ street: "18 Ember Lane", city: "Portland" });
  expect(order.items).toHaveLength(2);
});

it("records a card order with its cardholder name", async () => {
  const result = await actor.placeOrder(
    "Sam Chen",
    "5035550199",
    { street: "5 Cedar Way", city: "Portland", postcode: "97209", notes: "" },
    [{ dishId: 11n, name: "Molten Chocolate Lava Cake", unitPrice: 699n, quantity: 1n }],
    { card: null },
    ["Sam Chen"],
  );

  expect("ok" in result).toBe(true);
  if (!("ok" in result)) {
    throw new Error("expected a placed order");
  }
  expect(result.ok.paymentMethod).toEqual({ card: null });
  expect(result.ok.cardholderName).toEqual(["Sam Chen"]);
  // A single dessert is under the free-delivery threshold.
  expect(result.ok.deliveryFee).toBe(399n);
});

it("rejects an order for a dish that is not on the menu", async () => {
  const result = await actor.placeOrder(
    "Alex Rivera",
    "5035550142",
    { street: "18 Ember Lane", city: "Portland", postcode: "97205", notes: "" },
    [{ dishId: 999_999n, name: "Ghost Dish", unitPrice: 100n, quantity: 1n }],
    { cash: null },
    [],
  );
  expect(result).toEqual({ err: { unknownDish: 999_999n } });
});

// `listOrders` is admin-only. The first non-anonymous caller to register via
// `_initialize_access_control` becomes `#admin`, so a dedicated identity is
// registered once and reused for the admin reads below.
const admin = createIdentity("savory-bites-admin");

it("lists placed orders newest-first for an admin caller", async () => {
  const adminActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  adminActor.setIdentity(admin);
  await adminActor._initialize_access_control();
  await expect(adminActor.isCallerAdmin()).resolves.toBe(true);

  // Seed two orders through the public API so the list has known contents.
  const first = await actor.placeOrder(
    "Alex Rivera",
    "5035550142",
    { street: "18 Ember Lane", city: "Portland", postcode: "97205", notes: "" },
    [{ dishId: 1n, name: "Garlic Butter Prawns", unitPrice: 899n, quantity: 1n }],
    { cash: null },
    [],
  );
  const second = await actor.placeOrder(
    "Sam Chen",
    "5035550199",
    { street: "5 Cedar Way", city: "Portland", postcode: "97209", notes: "" },
    [{ dishId: 5n, name: "Margherita Pizza", unitPrice: 1199n, quantity: 1n }],
    { cash: null },
    [],
  );
  if (!("ok" in first) || !("ok" in second)) {
    throw new Error("expected both seeded orders to be placed");
  }

  const orders = await adminActor.listOrders();
  const references = orders.map((order) => order.reference);
  // Newest first: the second order's id is greater, so it sorts ahead.
  expect(references.indexOf(second.ok.reference)).toBeLessThan(
    references.indexOf(first.ok.reference),
  );
  expect(orders).toContainEqual(
    expect.objectContaining({
      reference: first.ok.reference,
      status: { placed: null },
    }),
  );
});

it("rejects a non-admin caller from listing orders", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  // A freshly created actor calls as the anonymous principal until an identity
  // is set, and anonymous callers are never registered as admin.
  await expect(guest.listOrders()).rejects.toThrow();
});

it("applies the allowed status transitions and rejects the rest", async () => {
  const adminActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  adminActor.setIdentity(admin);
  await adminActor._initialize_access_control();

  const placed = await actor.placeOrder(
    "Alex Rivera",
    "5035550142",
    { street: "18 Ember Lane", city: "Portland", postcode: "97205", notes: "" },
    [{ dishId: 1n, name: "Garlic Butter Prawns", unitPrice: 899n, quantity: 1n }],
    { cash: null },
    [],
  );
  if (!("ok" in placed)) {
    throw new Error("expected the order to be placed");
  }
  const orderId = placed.ok.id;

  // #placed -> #confirmed is allowed.
  const confirmed = await adminActor.updateOrderStatus(orderId, { confirmed: null });
  expect(confirmed).toEqual({
    ok: expect.objectContaining({ id: orderId, status: { confirmed: null } }),
  });

  // #confirmed -> #delivered is allowed.
  const delivered = await adminActor.updateOrderStatus(orderId, { delivered: null });
  expect(delivered).toEqual({
    ok: expect.objectContaining({ id: orderId, status: { delivered: null } }),
  });

  // #delivered is terminal: any further change is a typed invalidTransition.
  const rejected = await adminActor.updateOrderStatus(orderId, { cancelled: null });
  expect(rejected).toEqual({
    err: {
      invalidTransition: {
        from: { delivered: null },
        to: { cancelled: null },
      },
    },
  });
});

it("cancels a placed order and treats cancellation as terminal", async () => {
  const adminActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  adminActor.setIdentity(admin);
  await adminActor._initialize_access_control();

  const placed = await actor.placeOrder(
    "Sam Chen",
    "5035550199",
    { street: "5 Cedar Way", city: "Portland", postcode: "97209", notes: "" },
    [{ dishId: 5n, name: "Margherita Pizza", unitPrice: 1199n, quantity: 1n }],
    { cash: null },
    [],
  );
  if (!("ok" in placed)) {
    throw new Error("expected the order to be placed");
  }
  const orderId = placed.ok.id;

  const cancelled = await adminActor.updateOrderStatus(orderId, { cancelled: null });
  expect(cancelled).toEqual({
    ok: expect.objectContaining({ id: orderId, status: { cancelled: null } }),
  });

  // #cancelled is terminal.
  const rejected = await adminActor.updateOrderStatus(orderId, { confirmed: null });
  expect(rejected).toEqual({
    err: {
      invalidTransition: {
        from: { cancelled: null },
        to: { confirmed: null },
      },
    },
  });
});

it("returns a typed notFound error for an unknown order id", async () => {
  const adminActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  adminActor.setIdentity(admin);
  await adminActor._initialize_access_control();

  const result = await adminActor.updateOrderStatus(999_999n, { confirmed: null });
  expect(result).toEqual({ err: { notFound: 999_999n } });
});

it("rejects a non-admin caller from updating an order status", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  // Anonymous callers are never registered as admin, so the API layer traps.
  await expect(
    guest.updateOrderStatus(1n, { confirmed: null }),
  ).rejects.toThrow();
});


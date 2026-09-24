import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useCartItemCount, useCartStore } from "@/store/cart";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function CartPage() {
  const lines = useCartStore((state) => state.lines);
  const itemCount = useCartItemCount();
  const isEmpty = lines.length === 0;

  return (
    <div
      data-ocid="cart.page"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8"
    >
      <header className="animate-fade-up">
        <p className="eyebrow">Your order</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Your cart
        </h1>
        {!isEmpty && (
          <p className="mt-3 text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout.
          </p>
        )}
      </header>

      {isEmpty ? (
        <div className="mt-10 animate-fade-up">
          <EmptyCart />
        </div>
      ) : (
        <div className="mt-10 grid animate-fade-up gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section aria-label="Cart items" className="min-w-0">
            <ul data-ocid="cart.list" className="flex flex-col gap-4">
              {lines.map((line, index) => (
                <CartLineItem
                  key={line.dish.id.toString()}
                  line={line}
                  index={index}
                />
              ))}
            </ul>

            <Link
              to="/menu"
              data-ocid="cart.back_to_menu_link"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Add more dishes
            </Link>
          </section>

          <CartSummary />
        </div>
      )}
    </div>
  );
}

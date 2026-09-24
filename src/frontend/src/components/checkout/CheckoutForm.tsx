import { DeliveryAddressFields } from "@/components/checkout/DeliveryAddressFields";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderError, usePlaceOrder } from "@/hooks/useQueries";
import { placeOrderErrorMessage } from "@/lib/menu";
import { useCartStore } from "@/store/cart";
import { usePlacedOrdersStore } from "@/store/orders";
import type { DeliveryAddress, OrderItem, PaymentMethod } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { type FormEvent, useState } from "react";

interface FormErrors {
  customerName?: string;
  phone?: string;
  street?: string;
  city?: string;
  postcode?: string;
  cardholderName?: string;
  cardNumber?: string;
}

const FIELD_CLASS =
  "h-11 rounded-lg border-border bg-background/60 text-foreground placeholder:text-muted-foreground/70 transition-smooth focus-visible:border-primary";

const EMPTY_ADDRESS: DeliveryAddress = {
  street: "",
  city: "",
  postcode: "",
  notes: "",
};

export function CheckoutForm() {
  const navigate = useNavigate();
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clear);
  const savePlacedOrder = usePlacedOrdersStore((state) => state.save);
  const placeOrderMutation = usePlaceOrder();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const backendError =
    placeOrderMutation.error instanceof OrderError
      ? placeOrderErrorMessage(placeOrderMutation.error.detail)
      : placeOrderMutation.error
        ? "We could not place your order. Please try again."
        : null;

  function handleAddressChange(field: keyof DeliveryAddress, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!customerName.trim())
      next.customerName = "Enter the name for this order.";
    if (!phone.trim())
      next.phone = "Enter a phone number for delivery updates.";
    if (!address.street.trim()) next.street = "Enter your street address.";
    if (!address.city.trim()) next.city = "Enter your city.";
    if (!address.postcode.trim()) next.postcode = "Enter your postcode.";
    if (paymentMethod === "card") {
      if (!cardholderName.trim())
        next.cardholderName = "Enter the cardholder name.";
      if (!cardNumber.trim()) next.cardNumber = "Enter the card number.";
    }
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const items: OrderItem[] = lines.map((line) => ({
      dishId: BigInt(line.dish.id),
      name: line.dish.name,
      unitPrice: BigInt(line.dish.price),
      quantity: BigInt(Number(line.quantity)),
    }));

    placeOrderMutation.mutate(
      {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: {
          street: address.street.trim(),
          city: address.city.trim(),
          postcode: address.postcode.trim(),
          notes: address.notes.trim(),
        },
        items,
        paymentMethod,
        cardholderName:
          paymentMethod === "card" ? cardholderName.trim() : undefined,
      },
      {
        onSuccess: (order) => {
          savePlacedOrder(order);
          clearCart();
          void navigate({
            to: "/order/$reference",
            params: { reference: order.reference },
          });
        },
      },
    );
  }

  return (
    <form
      data-ocid="checkout.form"
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-8"
    >
      {backendError && (
        <Alert
          variant="destructive"
          data-ocid="checkout.error_state"
          className="rounded-xl border-destructive/40 bg-destructive/10"
        >
          <AlertCircle aria-hidden="true" />
          <AlertTitle>We could not place your order</AlertTitle>
          <AlertDescription>{backendError}</AlertDescription>
        </Alert>
      )}

      <section
        data-ocid="checkout.contact_section"
        className="rounded-2xl border border-border bg-card p-6 shadow-warm"
      >
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Contact details
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We use these to confirm and deliver your order.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="checkout-name">Full name</Label>
            <Input
              id="checkout-name"
              data-ocid="checkout.name_input"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Alex Rivera"
              autoComplete="name"
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={
                errors.customerName ? "checkout-name-error" : undefined
              }
              className={FIELD_CLASS}
            />
            {errors.customerName && (
              <p
                id="checkout-name-error"
                data-ocid="checkout.name_error"
                className="text-sm text-destructive"
              >
                {errors.customerName}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-phone">Phone number</Label>
            <Input
              id="checkout-phone"
              data-ocid="checkout.phone_input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(503) 555-0142"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={
                errors.phone ? "checkout-phone-error" : undefined
              }
              className={FIELD_CLASS}
            />
            {errors.phone && (
              <p
                id="checkout-phone-error"
                data-ocid="checkout.phone_error"
                className="text-sm text-destructive"
              >
                {errors.phone}
              </p>
            )}
          </div>
        </div>
      </section>

      <section
        data-ocid="checkout.address_section"
        className="rounded-2xl border border-border bg-card p-6 shadow-warm"
      >
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Delivery address
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Where should we bring your order?
        </p>
        <div className="mt-5">
          <DeliveryAddressFields
            value={address}
            errors={errors}
            onChange={handleAddressChange}
          />
        </div>
      </section>

      <section
        data-ocid="checkout.payment_section"
        className="rounded-2xl border border-border bg-card p-6 shadow-warm"
      >
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Payment method
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how you would like to pay when your order arrives.
        </p>
        <div className="mt-5">
          <PaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
            cardholderName={cardholderName}
            cardNumber={cardNumber}
            onCardholderNameChange={setCardholderName}
            onCardNumberChange={setCardNumber}
            cardholderError={errors.cardholderName}
            cardNumberError={errors.cardNumber}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4 shrink-0 text-accent" aria-hidden="true" />
          No payment is taken online. You pay on delivery.
        </p>
        <Button
          type="submit"
          size="lg"
          data-ocid="checkout.submit_button"
          disabled={placeOrderMutation.isPending}
          className="h-12 w-full rounded-full gradient-primary px-8 text-base font-semibold text-primary-foreground shadow-warm transition-smooth hover:shadow-warm-lg sm:w-auto"
        >
          {placeOrderMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Placing order…
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </form>
  );
}

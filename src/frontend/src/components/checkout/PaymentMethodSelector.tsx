import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";
import { Banknote, CreditCard, Info } from "lucide-react";

export interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  cardholderName: string;
  cardNumber: string;
  onCardholderNameChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  cardholderError?: string;
  cardNumberError?: string;
}

const OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Banknote;
}[] = [
  {
    value: "cash",
    label: "Cash on Delivery",
    description: "Pay the driver in cash when your order arrives.",
    icon: Banknote,
  },
  {
    value: "card",
    label: "Card",
    description: "Record your card details now and pay on delivery.",
    icon: CreditCard,
  },
];

const FIELD_CLASS =
  "h-11 rounded-lg border-border bg-background/60 text-foreground placeholder:text-muted-foreground/70 transition-smooth focus-visible:border-primary";

export function PaymentMethodSelector({
  value,
  onChange,
  cardholderName,
  cardNumber,
  onCardholderNameChange,
  onCardNumberChange,
  cardholderError,
  cardNumberError,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-5">
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as PaymentMethod)}
        aria-label="Payment method"
        className="grid gap-3 sm:grid-cols-2"
      >
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;
          return (
            <Label
              key={option.value}
              htmlFor={`checkout-payment-${option.value}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-smooth",
                selected
                  ? "border-primary bg-primary/10 shadow-warm"
                  : "border-border bg-background/40 hover:border-primary/40",
              )}
            >
              <RadioGroupItem
                id={`checkout-payment-${option.value}`}
                value={option.value}
                data-ocid={`checkout.payment_${option.value}_radio`}
                className="mt-0.5"
              />
              <span className="grid gap-1">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Icon
                    className={cn(
                      "size-4",
                      selected ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                  {option.label}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </Label>
          );
        })}
      </RadioGroup>

      {value === "card" && (
        <div
          data-ocid="checkout.card_details_panel"
          className="grid gap-5 rounded-xl border border-border bg-secondary/40 p-4 animate-fade-up"
        >
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info
              className="mt-0.5 size-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            These details are recorded with your order for pay-on-delivery. No
            charge is made now.
          </p>

          <div className="grid gap-2">
            <Label htmlFor="checkout-cardholder">Cardholder name</Label>
            <Input
              id="checkout-cardholder"
              data-ocid="checkout.cardholder_input"
              value={cardholderName}
              onChange={(event) => onCardholderNameChange(event.target.value)}
              placeholder="Name as it appears on the card"
              autoComplete="cc-name"
              aria-invalid={Boolean(cardholderError)}
              aria-describedby={
                cardholderError ? "checkout-cardholder-error" : undefined
              }
              className={FIELD_CLASS}
            />
            {cardholderError && (
              <p
                id="checkout-cardholder-error"
                data-ocid="checkout.cardholder_error"
                className="text-sm text-destructive"
              >
                {cardholderError}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-cardnumber">Card number</Label>
            <Input
              id="checkout-cardnumber"
              data-ocid="checkout.cardnumber_input"
              value={cardNumber}
              onChange={(event) => onCardNumberChange(event.target.value)}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="cc-number"
              aria-invalid={Boolean(cardNumberError)}
              aria-describedby={
                cardNumberError ? "checkout-cardnumber-error" : undefined
              }
              className={FIELD_CLASS}
            />
            {cardNumberError && (
              <p
                id="checkout-cardnumber-error"
                data-ocid="checkout.cardnumber_error"
                className="text-sm text-destructive"
              >
                {cardNumberError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

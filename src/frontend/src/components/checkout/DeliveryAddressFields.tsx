import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DeliveryAddress } from "@/types";

export interface DeliveryAddressFieldsProps {
  value: DeliveryAddress;
  errors: Partial<Record<keyof DeliveryAddress, string>>;
  onChange: (field: keyof DeliveryAddress, value: string) => void;
}

const FIELD_CLASS =
  "h-11 rounded-lg border-border bg-background/60 text-foreground placeholder:text-muted-foreground/70 transition-smooth focus-visible:border-primary";

export function DeliveryAddressFields({
  value,
  errors,
  onChange,
}: DeliveryAddressFieldsProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="checkout-street">Street address</Label>
        <Input
          id="checkout-street"
          data-ocid="checkout.street_input"
          value={value.street}
          onChange={(event) => onChange("street", event.target.value)}
          placeholder="18 Ember Lane, Apt 4"
          autoComplete="street-address"
          aria-invalid={Boolean(errors.street)}
          aria-describedby={errors.street ? "checkout-street-error" : undefined}
          className={FIELD_CLASS}
        />
        {errors.street && (
          <p
            id="checkout-street-error"
            data-ocid="checkout.street_error"
            className="text-sm text-destructive"
          >
            {errors.street}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="checkout-city">City</Label>
          <Input
            id="checkout-city"
            data-ocid="checkout.city_input"
            value={value.city}
            onChange={(event) => onChange("city", event.target.value)}
            placeholder="Portland"
            autoComplete="address-level2"
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "checkout-city-error" : undefined}
            className={FIELD_CLASS}
          />
          {errors.city && (
            <p
              id="checkout-city-error"
              data-ocid="checkout.city_error"
              className="text-sm text-destructive"
            >
              {errors.city}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="checkout-postcode">Postcode</Label>
          <Input
            id="checkout-postcode"
            data-ocid="checkout.postcode_input"
            value={value.postcode}
            onChange={(event) => onChange("postcode", event.target.value)}
            placeholder="97205"
            autoComplete="postal-code"
            aria-invalid={Boolean(errors.postcode)}
            aria-describedby={
              errors.postcode ? "checkout-postcode-error" : undefined
            }
            className={FIELD_CLASS}
          />
          {errors.postcode && (
            <p
              id="checkout-postcode-error"
              data-ocid="checkout.postcode_error"
              className="text-sm text-destructive"
            >
              {errors.postcode}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="checkout-notes">
          Delivery notes
          <span className="text-xs font-normal text-muted-foreground">
            Optional
          </span>
        </Label>
        <Textarea
          id="checkout-notes"
          data-ocid="checkout.notes_textarea"
          value={value.notes}
          onChange={(event) => onChange("notes", event.target.value)}
          placeholder="Gate code, buzzer, or where to leave the bag"
          rows={3}
          className="rounded-lg border-border bg-background/60 text-foreground placeholder:text-muted-foreground/70 transition-smooth focus-visible:border-primary"
        />
      </div>
    </div>
  );
}

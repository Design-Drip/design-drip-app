import { useEffect } from "react";
import { AddressElement, useElements } from "@stripe/react-stripe-js";
import { Label } from "@/components/ui/label";
import { StripeAddressElementChangeEvent } from "@stripe/stripe-js";

interface AddressElementProps {
  onChange?: (
    complete: boolean,
    address: StripeAddressElementChangeEvent["value"]
  ) => void;
}

const ShippingAddressElement = ({ onChange }: AddressElementProps) => {
  const elements = useElements();

  useEffect(() => {
    if (!elements) return;

    const addressElement = elements.getElement("address");
    if (addressElement) {
      // You could perform additional setup here if needed
    }
  }, [elements]);

  return (
    <div className="space-y-2">
      <Label htmlFor="shipping-address">Shipping Address</Label>
      <div className="border rounded-md p-3">
        <AddressElement
          id="shipping-address"
          options={{
            mode: "shipping",
            allowedCountries: ["VN", "US", "CA", "GB", "AU"],
            fields: {
              phone: "always",
            },
            validation: {
              phone: {
                required: "always",
              },
            },
            defaultValues: {
              name: "",
              address: {
                line1: "",
                line2: "",
                city: "",
                state: "",
                postal_code: "",
                country: "VN",
              },
            },
            contacts: [],
          }}
          onChange={(event) => {
            if (onChange) {
              onChange(event.complete, event.value);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ShippingAddressElement;

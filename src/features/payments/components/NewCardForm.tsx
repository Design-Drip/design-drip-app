import { useState, useEffect } from "react";
import { CardElement, useElements } from "@stripe/react-stripe-js";
import { Label } from "@/components/ui/label";

interface NewCardFormProps {
  onCardChange?: (complete: boolean, error: string | null) => void;
}

const NewCardForm = ({ onCardChange }: NewCardFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const elements = useElements();

  useEffect(() => {
    // Notify parent component about card state changes
    if (onCardChange) {
      onCardChange(complete, error);
    }
  }, [complete, error, onCardChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="card-element">Card Information</Label>
      <div className="border rounded-md p-3">
        <CardElement
          id="card-element"
          onChange={(e) => {
            setComplete(e.complete);
            if (e.error) {
              setError(e.error.message);
            } else {
              setError(null);
            }
          }}
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "var(--foreground)",
                "::placeholder": {
                  color: "var(--muted-foreground)",
                },
              },
            },
          }}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default NewCardForm;

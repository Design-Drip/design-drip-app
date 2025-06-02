import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { useAttachPaymentMethodMutation } from "../services/mutations";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AddPaymentMethodProps {
  trigger?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPaymentMethod = ({
  trigger,
  open,
  onOpenChange,
}: AddPaymentMethodProps) => {
  const [error, setError] = useState<string | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(true);

  const stripe = useStripe();
  const elements = useElements();
  const { mutate, isPending } = useAttachPaymentMethodMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }

      mutate(
        {
          paymentMethodId: paymentMethod.id,
          setAsDefault,
        },
        {
          onSuccess: () => {
            toast.success("Payment method added successfully");
            cardElement.clear();
            onOpenChange(false);
          },
          onError: (error) => {
            setError(error.message);
          },
        }
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Payment Method</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Enter your card details to add a new payment method
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="card-element">Card Information</Label>
              <div className="border rounded-md p-3">
                <CardElement
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="set-as-default"
                checked={setAsDefault}
                onCheckedChange={(checked) => setSetAsDefault(!!checked)}
              />
              <Label htmlFor="set-as-default">
                Set as default payment method
              </Label>
            </div>
          </div>

          <DialogFooter onClick={(event) => event.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!stripe || !elements || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add Card"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentMethod;

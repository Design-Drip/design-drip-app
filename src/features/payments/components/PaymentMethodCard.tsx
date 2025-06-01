import { useState } from "react";
import Stripe from "stripe";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, CreditCard, Loader2, Trash2 } from "lucide-react";
import {
  useSetDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
} from "../services/mutations";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PaymentMethodCardProps = {
  paymentMethod: Stripe.PaymentMethod & { isDefault?: boolean };
};

const PaymentMethodCard = ({ paymentMethod }: PaymentMethodCardProps) => {
  const { card, isDefault } = paymentMethod;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: setDefault, isPending: isSettingDefault } =
    useSetDefaultPaymentMethodMutation();
  const { mutate: deletePaymentMethod, isPending: isDeleting } =
    useDeletePaymentMethodMutation();

  const handleSetDefault = () => {
    setDefault(
      { paymentMethodId: paymentMethod.id },
      {
        onSuccess: () => {
          toast.success("Payment method set as default");
        },
        onError: (error) => {
          toast.error("Failed to set payment method as default", {
            description: error.message,
          });
        },
      }
    );
  };

  const handleDelete = () => {
    deletePaymentMethod(paymentMethod.id, {
      onSuccess: () => {
        toast.success("Payment method deleted successfully");
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to delete payment method", {
          description: error.message,
        });
        setIsDeleteDialogOpen(false);
      },
    });
  };

  if (!card) return null;

  return (
    <>
      <Card
        className={cn(
          "relative overflow-hidden",
          isDefault && "border-primary"
        )}
      >
        {isDefault && (
          <div className="absolute bottom-5 left-5">
            <Badge className="rounded-bl rounded-tr-none">Default</Badge>
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {getCardBrandName(card.brand)}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              Expires {card.exp_month}/{card.exp_year.toString().slice(-2)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1">••••</span>
            <span className="text-muted-foreground mr-1">••••</span>
            <span className="text-muted-foreground mr-1">••••</span>
            <span>{card.last4}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-2 pb-3">
          {!isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetDefault}
              disabled={isSettingDefault || isDeleting}
            >
              {isSettingDefault ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting...
                </>
              ) : (
                "Set as Default"
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive h-8 w-8"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting || isSettingDefault}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your {getCardBrandName(card.brand)}{" "}
              card ending in {card.last4}.
              {isDefault && (
                <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <span>
                    This is your default payment method. Removing it may affect
                    any recurring payments.
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const getCardBrandName = (brand: string) => {
  const brands = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    jcb: "JCB",
    diners: "Diners Club",
    unionpay: "UnionPay",
  };

  return brands[brand?.toLowerCase()] || brand || "Card";
};

export default PaymentMethodCard;

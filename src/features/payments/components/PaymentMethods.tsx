import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaymentMethodCard from "./PaymentMethodCard";
import AddPaymentMethod from "./AddPaymentMethod";
import { getPaymentMethodsQuery } from "../services/queries";

const PaymentMethods = () => {
  const [addPaymentMethodOpen, setAddPaymentMethodOpen] = useState(false);
  let content = (
    <div className="flex flex-col items-center gap-2 py-8">
      <CreditCard className="h-10 w-10 text-muted-foreground" />
      <p className="text-muted-foreground">No payment methods found</p>
      <p className="text-sm text-muted-foreground">
        Add a payment method to complete purchases faster
      </p>
    </div>
  );

  const {
    data: paymentMethods,
    isPending,
    error,
  } = useQuery({
    ...getPaymentMethodsQuery(),
  });

  if (isPending) {
    content = (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">
          Loading payment methods...
        </span>
      </div>
    );
  }

  if (error) {
    content = (
      <div className="text-destructive flex flex-col items-center gap-2">
        <p>There was an error loading your payment methods.</p>
        <Button variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  const hasPaymentMethods = paymentMethods && paymentMethods.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payment Methods</h2>
        <AddPaymentMethod
          open={addPaymentMethodOpen}
          onOpenChange={setAddPaymentMethodOpen}
          trigger={
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          }
        />
      </div>

      {!hasPaymentMethods ? (
        <Card className={error ? "border-destructive" : ""}>
          <CardContent className="pt-6">{content}</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <PaymentMethodCard key={method.id} paymentMethod={method} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;

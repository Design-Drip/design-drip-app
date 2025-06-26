"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getCheckoutInfoQuery } from "@/features/payments/services/queries";
import { useProcessCheckoutMutation } from "@/features/payments/services/mutations";
import PaymentMethods from "@/features/payments/components/PaymentMethods";
import NewCardForm from "@/features/payments/components/NewCardForm";
import { formatPrice } from "@/lib/price";
import { Loader2, ShoppingBag } from "lucide-react";
import StripeWrapper from "@/components/StripeWrapper";

const CheckoutPage = () => {
  const router = useRouter();
  const [paymentTab, setPaymentTab] = useState<string>("saved");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [saveNewCard, setSaveNewCard] = useState(true);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Get selected items from session storage
    const storedItems = sessionStorage.getItem("checkoutItems");
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        if (Array.isArray(parsedItems)) {
          setSelectedItemIds(parsedItems);
        }
      } catch (error) {
        console.error("Failed to parse stored checkout items", error);
      }
    } else {
      // No items selected, redirect back to cart
      toast.error("No items selected for checkout");
      router.push("/cart");
    }
  }, [router]);

  const {
    data: checkoutInfo,
    isPending,
    isError,
  } = useQuery({
    ...getCheckoutInfoQuery(selectedItemIds.join(",")),
    enabled: selectedItemIds.length > 0, // Only run query if we have selected items
  });

  const { mutate: processCheckout, isPending: isProcessing } =
    useProcessCheckoutMutation();

  // Set default payment method when data loads
  useEffect(() => {
    if (checkoutInfo?.defaultPaymentMethod) {
      setSelectedPaymentMethod(checkoutInfo.defaultPaymentMethod.id);
    }
  }, [checkoutInfo]);

  const handlePaymentMethodSelect = (id: string) => {
    setSelectedPaymentMethod(id);
  };

  const handleCardChange = (complete: boolean, error: string | null) => {
    setCardComplete(complete);
    setCardError(error);
  };

  const handleCheckout = async () => {
    if (selectedItemIds.length === 0) {
      toast.error("No items selected for checkout");
      return;
    }

    if (paymentTab === "saved" && !selectedPaymentMethod) {
      toast.error("Payment method required", {
        description: "Please select a payment method to continue",
      });
      return;
    }

    const return_url = `${process.env.NEXT_PUBLIC_APP_URL}/orders`;

    if (paymentTab === "new") {
      if (!stripe || !elements) {
        toast.error("Payment error", {
          description: "Could not initialize payment system",
        });
        return;
      }

      if (!cardComplete) {
        toast.error("Card details required", {
          description: "Please complete your card information",
        });
        return;
      }

      setProcessingPayment(true);

      // First, create a payment intent and get the client secret
      processCheckout(
        {
          savePaymentMethod: saveNewCard,
          itemIds: selectedItemIds,
          return_url,
        },
        {
          onSuccess: async (data) => {
            if (!data.clientSecret) {
              toast.error("Payment error", {
                description: "Could not process payment",
              });
              setProcessingPayment(false);
              return;
            }

            // Use the client secret to confirm the payment
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
              toast.error("Payment error", {
                description: "Could not find card element",
              });
              setProcessingPayment(false);
              return;
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(
              data.clientSecret,
              {
                payment_method: {
                  card: cardElement,
                },
              }
            );

            if (error) {
              toast.error("Payment failed", {
                description: error.message || "Could not process payment",
              });
            } else if (paymentIntent.status === "succeeded") {
              // Confirm the payment was successful on the server
              processCheckout(
                { paymentIntent: paymentIntent.id },
                {
                  onSuccess: () => {
                    toast.success("Payment successful", {
                      description: "Your order has been placed successfully",
                    });
                    router.push(`/orders/${paymentIntent.id}`);
                  },
                  onError: (error) => {
                    toast.error("Order error", {
                      description:
                        error.message ||
                        "There was a problem finalizing your order",
                    });
                  },
                }
              );
            } else {
              router.push(`/orders?status=pending&payment=${paymentIntent.id}`);
            }
            setProcessingPayment(false);
          },
          onError: (error) => {
            toast.error("Payment failed", {
              description:
                error.message || "There was a problem processing your payment",
            });
            setProcessingPayment(false);
          },
        }
      );
    } else {
      // Using an existing payment method
      processCheckout(
        {
          paymentMethodId: selectedPaymentMethod,
          itemIds: selectedItemIds,
          return_url,
        },
        {
          onSuccess: (data) => {
            if (data.requiresAction && data.clientSecret) {
              // Handle 3D Secure authentication if needed
              stripe!
                .confirmCardPayment(data.clientSecret)
                .then(function (result) {
                  if (result.error) {
                    toast.error("Payment failed", {
                      description:
                        result.error.message || "Authentication failed",
                    });
                  } else {
                    // Payment succeeded after authentication
                    toast.success("Payment successful", {
                      description: "Your order has been placed successfully",
                    });
                    router.push(`/orders/${data.paymentIntentId}`);
                  }
                });
            } else if (data.status === "succeeded") {
              toast.success("Payment successful", {
                description: "Your order has been placed successfully",
              });
              router.push(`/orders/${data.orderId || data.paymentIntentId}`);
            } else {
              // Order created but payment pending
              router.push(
                `/orders?status=pending&payment=${data.paymentIntentId}`
              );
            }
          },
          onError: (error) => {
            toast.error("Payment failed", {
              description:
                error.message || "There was a problem processing your payment",
            });
          },
        }
      );
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !checkoutInfo) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error Loading Checkout</h2>
          <p className="text-muted-foreground mt-2">
            There was a problem loading your checkout information.
          </p>
          <Button onClick={() => router.refresh()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (checkoutInfo.items.length === 0) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold">No Items Selected</h2>
          <p className="text-muted-foreground mt-2">
            Please select items from your cart to proceed with checkout.
          </p>
          <Button onClick={() => router.push("/cart")} className="mt-4">
            Return to Cart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkoutInfo.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.designName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.name} ({item.color})
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue={checkoutInfo.hasPaymentMethods ? "saved" : "new"}
                value={paymentTab}
                onValueChange={setPaymentTab}
              >
                {checkoutInfo.hasPaymentMethods && (
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="saved">
                      Saved Payment Methods
                    </TabsTrigger>
                    <TabsTrigger value="new">Use New Card</TabsTrigger>
                  </TabsList>
                )}

                <TabsContent value="saved">
                  {checkoutInfo.hasPaymentMethods ? (
                    <div className="space-y-3">
                      <PaymentMethods
                        selectMode={true}
                        onSelect={handlePaymentMethodSelect}
                        selectedPaymentMethod={selectedPaymentMethod}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">
                        You don&apos;t have any saved payment methods.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="new">
                  <div className="space-y-6">
                    <NewCardForm onCardChange={handleCardChange} />

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="save-card"
                        checked={saveNewCard}
                        onCheckedChange={(checked) => setSaveNewCard(!!checked)}
                      />
                      <Label htmlFor="save-card">
                        Save this card for future purchases
                      </Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(checkoutInfo.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(checkoutInfo.totalAmount)}</span>
              </div>

              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handleCheckout}
                disabled={
                  isProcessing ||
                  processingPayment ||
                  (paymentTab === "new" && (!cardComplete || !!cardError))
                }
              >
                {isProcessing || processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatPrice(checkoutInfo.totalAmount)}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutWithStripe() {
  return (
    <StripeWrapper>
      <CheckoutPage />
    </StripeWrapper>
  );
}

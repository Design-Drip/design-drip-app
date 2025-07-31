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
import ShippingAddressElement from "@/features/payments/components/AddressElement";
import { formatPrice } from "@/lib/price";
import { Loader2, ShoppingBag } from "lucide-react";
import StripeWrapper from "@/components/StripeWrapper";
import { Separator } from "@/components/ui/separator";
import { OrderAddress } from "@/types/address";

const CheckoutPage = () => {
  const router = useRouter();
  const [paymentTab, setPaymentTab] = useState("saved");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | undefined
  >(undefined);
  const [saveNewCard, setSaveNewCard] = useState(true);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [addressComplete, setAddressComplete] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<OrderAddress | null>(
    null
  );
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard"
  );
  const [shippingCost, setShippingCost] = useState(0);

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
    enabled: selectedItemIds.length > 0,
  });

  const { mutate: processCheckout, isPending: isProcessing } =
    useProcessCheckoutMutation();

  // Set default payment method when data loads
  useEffect(() => {
    if (checkoutInfo?.defaultPaymentMethod) {
      setSelectedPaymentMethod(checkoutInfo.defaultPaymentMethod.id);
    }
  }, [checkoutInfo]);

  useEffect(() => {
    if (shippingMethod === "express") {
      setShippingCost(30000); // 30,000 VND for express shipping
    } else {
      setShippingCost(0); // Free for standard shipping
    }
  }, [shippingMethod]);

  const handlePaymentMethodSelect = (id: string) => {
    setSelectedPaymentMethod(id);
  };

  const handleCardChange = (complete: boolean, error: string | null) => {
    setCardComplete(complete);
    setCardError(error);
  };

  const handleAddressChange = (complete: boolean, address: any) => {
    setAddressComplete(complete);
    setShippingAddress(address);
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

    if (!addressComplete || !shippingAddress) {
      toast.error("Shipping address required", {
        description: "Please provide a complete shipping address",
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

      // Add shipping method and cost to the shipping address
      const shippingWithMethod = {
        ...shippingAddress,
        method: shippingMethod,
        cost: shippingCost,
      };

      // First, create a payment intent and get the client secret
      processCheckout(
        {
          savePaymentMethod: saveNewCard,
          itemIds: selectedItemIds,
          return_url,
          shipping: shippingWithMethod,
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
                  billing_details: {
                    name: shippingAddress.name,
                    phone: shippingAddress.phone,
                    address: {
                      city: shippingAddress.address.city,
                      country: shippingAddress.address.country,
                      line1: shippingAddress.address.line1,
                      line2: shippingAddress.address.line2 || undefined,
                      postal_code: shippingAddress.address.postal_code,
                      state: shippingAddress.address.state,
                    },
                  },
                },
                shipping: {
                  name: shippingAddress.name,
                  phone: shippingAddress.phone,
                  address: {
                    city: shippingAddress.address.city,
                    country: shippingAddress.address.country,
                    line1: shippingAddress.address.line1,
                    line2: shippingAddress.address.line2 || undefined,
                    postal_code: shippingAddress.address.postal_code,
                    state: shippingAddress.address.state,
                  },
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
                {
                  paymentIntent: paymentIntent.id,
                  shipping: shippingWithMethod,
                },
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
      const shippingWithMethod = {
        ...shippingAddress,
        method: shippingMethod,
        cost: shippingCost,
        address: {
          ...shippingAddress.address,
          line2: shippingAddress.address.line2 || undefined,
        },
      };

      processCheckout(
        {
          paymentMethodId: selectedPaymentMethod,
          itemIds: selectedItemIds,
          return_url,
          shipping: shippingWithMethod,
        },
        {
          onSuccess: (data) => {
            if (data.requiresAction && data.clientSecret) {
              // Handle 3D Secure authentication if needed
              stripe!
                .confirmCardPayment(data.clientSecret, {
                  shipping: {
                    name: shippingAddress.name,
                    phone: shippingAddress.phone,
                    address: {
                      city: shippingAddress.address.city,
                      country: shippingAddress.address.country,
                      line1: shippingAddress.address.line1,
                      line2: shippingAddress.address.line2 || undefined,
                      postal_code: shippingAddress.address.postal_code,
                      state: shippingAddress.address.state,
                    },
                  },
                })
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
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingAddressElement onChange={handleAddressChange} />

              <div className="mt-6">
                <h3 className="font-medium mb-3">Shipping Method</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="standard-shipping"
                      name="shipping-method"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label
                      htmlFor="standard-shipping"
                      className="flex flex-col"
                    >
                      <span className="font-medium">
                        Standard Shipping (Free)
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Delivery in 5-7 business days
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="express-shipping"
                      name="shipping-method"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="express-shipping" className="flex flex-col">
                      <span className="font-medium">
                        Express Shipping ({formatPrice(30000)})
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Delivery in 1-2 business days
                      </span>
                    </Label>
                  </div>
                </div>
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
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost > 0 ? formatPrice(shippingCost) : "Free"}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  {formatPrice(checkoutInfo.totalAmount + shippingCost)}
                </span>
              </div>

              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handleCheckout}
                disabled={
                  isProcessing ||
                  processingPayment ||
                  !addressComplete ||
                  (paymentTab === "new" && (!cardComplete || !!cardError))
                }
              >
                {isProcessing || processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatPrice(checkoutInfo.totalAmount + shippingCost)}`
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

"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertTriangle,
  MapPin,
  CreditCard,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { formatOrderDateTime } from "@/lib/date";
import { formatPrice } from "@/lib/price";
import { getOrderDetailQuery } from "@/features/orders/services/queries";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    ...getOrderDetailQuery(orderId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto max-w-4xl py-10 px-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 flex gap-3 items-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">
              {isError
                ? "There was an error loading this order. Please try again later."
                : "Order not found."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format short order ID for display
  const shortOrderId = order.id.substring(0, 8);

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <div className="grid gap-6">
        {/* Order header */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Order #{shortOrderId}</CardTitle>
                <CardDescription>
                  Placed on {formatOrderDateTime(order.createdAt)}
                </CardDescription>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
          </CardHeader>

          <CardContent className="pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Method */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Payment Method</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.paymentMethodDetails ? (
                    <>
                      {order.paymentMethodDetails.brand?.toUpperCase()} ••••{" "}
                      {order.paymentMethodDetails.last4}
                      <br />
                      Expires {order.paymentMethodDetails.exp_month}/
                      {order.paymentMethodDetails.exp_year}
                    </>
                  ) : (
                    order.paymentMethod
                  )}
                </p>
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Shipping Address</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.shippingDetails?.name &&
                  order.shippingDetails.address ? (
                    <>
                      {order.shippingDetails.name}
                      <br />
                      {order.shippingDetails.address.line1}
                      {order.shippingDetails.address.line2 && (
                        <>
                          <br />
                          {order.shippingDetails.address.line2}
                        </>
                      )}
                      <br />
                      {order.shippingDetails.address.city},{" "}
                      {order.shippingDetails.address.state}{" "}
                      {order.shippingDetails.address.postalCode}
                      <br />
                      {order.shippingDetails.address.country}
                    </>
                  ) : (
                    "No shipping details available"
                  )}
                </p>
              </div>

              {/* Delivery timeline */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Delivery Timeline</h3>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getProgressBarColor(
                          order.status
                        )}`}
                        style={{ width: getProgressWidth(order.status) }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Order Placed</span>
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Order Items</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index}>
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-10 w-10 m-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.color}
                      </p>

                      <div className="mt-2 space-y-1">
                        {item.sizes.map((sizeInfo, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {sizeInfo.size} x {sizeInfo.quantity}
                            </span>
                            <span className="font-medium">
                              {formatPrice(
                                sizeInfo.pricePerUnit * sizeInfo.quantity
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {index < order.items.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex-col items-end border-t pt-4">
            <div className="w-full md:w-1/3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Need Help */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you have any questions or concerns about your order, please
              contact our customer support team.
            </p>
            <div className="mt-4 flex gap-4">
              <Button variant="outline">Contact Support</Button>
              <Button variant="outline">Track Package</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions for the progress bar
function getProgressWidth(status: string): string {
  switch (status) {
    case "pending":
      return "25%";
    case "processing":
      return "50%";
    case "shipped":
      return "75%";
    case "delivered":
      return "100%";
    case "canceled":
      return "25%";
    default:
      return "25%";
  }
}

function getProgressBarColor(status: string): string {
  if (status === "canceled") return "bg-red-500";
  return "bg-primary";
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertTriangle,
  CreditCard,
  Clock,
  MapPin,
  Star,
  MessageSquare,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { formatOrderDateTime } from "@/lib/date";
import { formatPrice } from "@/lib/price";
import { getOrderDetailQuery } from "@/features/orders/services/queries";
import { useCreateFeedbackMutation } from "@/features/feedback/services/mutations";
import { toast } from "sonner";
import { getFeedbackQuery } from "@/features/feedback/services/queries";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery(getOrderDetailQuery(orderId));
  const submitFeedback = useCreateFeedbackMutation();
  const productId = order?.items?.[0]?.designId?.shirt_color_id?.shirt_id?.id;
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const queryClient = useQueryClient();

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
        <Button
          variant="ghost"
          onClick={() => router.replace("/orders")}
          className="mb-6"
        >
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

  const handleFeedbackSubmit = () => {
    if (rating === 0) return;

    setIsSubmittingFeedback(true);
    try {
      if (!orderId) {
        throw new Error("Order ID is required to submit feedback");
      }
      console.log("Submitting feedback:", {
        rating,
        comment,
        orderId,
      });
      submitFeedback.mutate(
        { orderId, rating, comment },
        {
          onSuccess: () => {
            // Reset form after successful submission
            setRating(0);
            setComment("");
            toast.success("Feedback submitted successfully!");
            queryClient.invalidateQueries({
              queryKey: ["feedback"],
            });
            router.push(`/products/${productId}`);
          },
          onError: (error: any) => {
            toast.error(
              error?.message || "Failed to submit feedback. Please try again."
            );
          },
        }
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                <CardDescription>
                  Placed on {formatOrderDateTime(order.createdAt!)}
                </CardDescription>
              </div>
              <OrderStatusBadge status={order.status!} />
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Method */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Payment Method</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.paymentMethod
                    ? order.paymentMethod.charAt(0).toUpperCase() +
                      order.paymentMethod.slice(1)
                    : "N/A"}
                </p>
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Shipping Address</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.shipping?.name ? (
                    <>
                      {order.shipping.name}
                      <br />
                      {order.shipping.phone && (
                        <>
                          {order.shipping.phone}
                          <br />
                        </>
                      )}
                      {order.shipping.address.line1}
                      {order.shipping.address.line2 && (
                        <>
                          <br />
                          {order.shipping.address.line2}
                        </>
                      )}
                      <br />
                      {order.shipping.address.city},{" "}
                      {order.shipping.address.state}{" "}
                      {order.shipping.address.postal_code}
                      <br />
                      {order.shipping.address.country}
                      <br />
                      <span className="mt-2 inline-block">
                        <span className="capitalize font-medium">
                          {order.shipping.method === "express"
                            ? "Express"
                            : "Standard"}{" "}
                          Shipping
                        </span>
                        {order.shipping.cost && order.shipping.cost > 0 && (
                          <span> ({formatPrice(order.shipping.cost)})</span>
                        )}
                      </span>
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
                          order.status!
                        )}`}
                        style={{
                          width: getProgressWidth(order.status!),
                        }}
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
              {order.items!.map((item, index) => (
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

                  {index < order.items!.length - 1 && (
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
                <span>
                  {formatPrice(
                    order.totalAmount! - (order.shipping?.cost || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>
                  {order.shipping?.cost
                    ? formatPrice(order.shipping.cost)
                    : "Free"}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount!)}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Feedback Card - Only show when delivered */}
        {order.status === "delivered" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Share Your Experience</CardTitle>
              </div>
              <CardDescription>
                How was your experience with this order? Your feedback helps us
                improve.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Rate your experience
                </Label>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {rating} star{rating !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label
                  htmlFor="feedback-comment"
                  className="text-sm font-medium"
                >
                  Additional comments (optional)
                </Label>
                <Textarea
                  id="feedback-comment"
                  placeholder="Tell us about your experience with the product quality, delivery, or anything else..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-2 min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/500 characters
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleFeedbackSubmit}
                disabled={rating === 0 || isSubmittingFeedback}
                className="ml-auto"
              >
                {isSubmittingFeedback ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

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

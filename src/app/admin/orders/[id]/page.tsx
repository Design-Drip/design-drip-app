import { ArrowLeft, Clock, Package } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/price";
import { formatOrderDate, formatOrderDateTime } from "@/lib/date";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import OrderStatusUpdate from "@/features/admin/orders/components/OrderStatusUpdate";
import { getOrderById } from "../_action";

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const orderId = params.id;
  const order = await getOrderById(orderId);

  if (!order) {
    return (
      <div className="container py-10">
        <Link
          href="/admin/orders"
          className="flex items-center mb-6 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        <Card className="text-center py-10">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/admin/orders">Return to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate total quantities
  const totalQuantity = order.items.reduce(
    (total, item) =>
      total +
      item.sizes.reduce((itemTotal, size) => itemTotal + size.quantity, 0),
    0
  );

  return (
    <div className="container py-10">
      <Link
        href="/admin/orders"
        className="flex items-center mb-6 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex flex-col lg:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Placed on {formatOrderDate(order.createdAt)} at{" "}
              {formatOrderDateTime(order.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary and Items - 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"} • {totalQuantity}{" "}
                {totalQuantity === 1 ? "unit" : "units"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={`${item.designId}-${index}`}>
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-secondary">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Color: {item.color}
                        </p>
                        <div className="mt-1 space-y-1">
                          {item.sizes.map((size, sizeIndex) => (
                            <div
                              key={`${size.size}-${sizeIndex}`}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                Size: {size.size} x {size.quantity}
                              </span>
                              <span>
                                {formatPrice(size.pricePerUnit * size.quantity)}
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer and Shipping Info - 1/3 width on desktop */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Customer ID
                  </h3>
                  <p>{order.userId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Current Status
                  </h3>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Order Date
                  </h3>
                  <p>{formatOrderDate(order.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Last Updated
                  </h3>
                  <p>{formatOrderDate(order.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

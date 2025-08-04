import { redirect } from "next/navigation";
import { ArrowLeft, Clock, Package, CarTaxiFront, Image } from "lucide-react";
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
import { clerkClient, User } from "@clerk/nextjs/server";
import { ClerkUser } from "../page";
import { checkRole } from "@/lib/roles";

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // Verify admin access
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    redirect("/");
  }
  // Fetch users from Clerk
  const client = await clerkClient();
  const clerkUsersResponse = await client.users.getUserList({
    limit: 100,
  });
  const clerkUsersList = clerkUsersResponse.data;
  const users: ClerkUser[] = clerkUsersList.map((user: User) => {
    const primaryEmail =
      user.emailAddresses.find(
        (email: any) => email.id === user.primaryEmailAddressId
      )?.emailAddress || "";

    return {
      id: user.id,
      email: primaryEmail,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || primaryEmail,
      imageUrl: user.imageUrl,
      isActive: !user.banned,
      lastSignInAt: user.lastSignInAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: (user.publicMetadata.role as string) || "",
    };
  });
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
      item.sizes.reduce(
        (itemTotal: number, size: { quantity: number }) =>
          itemTotal + size.quantity,
        0
      ),
    0
  );
  const userDetails = users.find((user) => user.id === order.userId);
  const userFullName = userDetails?.fullName || "Unknown User";
  const userEmail = userDetails?.email || "No email provided";
  const userImage = userDetails?.imageUrl || null;
  if (!userDetails) {
    return (
      <div className="container py-10">
        <p className="text-red-500">User not found for this order.</p>
      </div>
    );
  }
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
          <CardTitle className="text-xl">Order #{order.id}</CardTitle>
          <CardDescription>
            Placed on {formatOrderDateTime(order.createdAt!)}
          </CardDescription>
        </div>
        <OrderStatusBadge status={order.status!} />
      </div>
      <div>
        <div className="col-span-1 md:col-span-2">
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
            <div className="flex justify-between text-base text-muted-foreground mb-4">
              <span>Order Placed</span>
              <span>Processing</span>
              <span>Shipping</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
          </div>
        </div>
        <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
      </div>
      <div>
        {order.status === "processing" && (
          <div className="text-base text-muted-foreground mb-4">
            <Clock className="inline mr-1" />
            The order has been paid successfully, click "Continue" to proceed
            with delivery.
          </div>
        )}
        {order.status === "shipping" && (
          <div className="text-base text-muted-foreground mb-4">
            <CarTaxiFront className="inline mr-1" />
            Order confirmed, waiting for shipper to pick up the package.
          </div>
        )}
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
                          {item.sizes.map(
                            (
                              size: {
                                size: string;
                                quantity: number;
                                pricePerUnit: number;
                              },
                              sizeIndex: number
                            ) => (
                              <div
                                key={`${size.size}-${sizeIndex}`}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  Size: {size.size} x {size.quantity}
                                </span>
                                <span>
                                  {formatPrice(
                                    size.pricePerUnit * size.quantity
                                  )}
                                </span>
                              </div>
                            )
                          )}
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
                  <span>
                    {formatPrice(
                      order.totalAmount - (order.shipping?.cost || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shipping?.cost
                      ? formatPrice(order.shipping.cost)
                      : "Free"}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Image Card */}
          {(order.status === "shipped" || order.status === "delivered") && order.shippingImage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Shipping Proof
                </CardTitle>
                <CardDescription>
                  Image uploaded by shipper as proof of delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={order.shippingImage}
                      alt="Shipping proof"
                      className="w-full max-w-md rounded-lg border shadow-sm"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Uploaded when order status was changed to "shipped"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Card */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer and Shipping Info - 1/3 width on desktop */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={userFullName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-medium text-muted-foreground">
                        {userFullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{userFullName}</h3>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Customer ID
                  </h3>
                  <p className="font-mono text-sm">{order.userId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Recipient
                    </h3>
                    <p>{order.shipping.name}</p>
                  </div>
                  {order.shipping.phone && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Phone
                      </h3>
                      <p>{order.shipping.phone}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Address
                    </h3>
                    <p>
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
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Shipping Method
                    </h3>
                    <p>
                      {order.shipping.method === "express"
                        ? "Express Shipping"
                        : "Standard Shipping"}
                      {order.shipping?.cost &&
                        order.shipping.cost > 0 &&
                        ` (${formatPrice(order.shipping.cost)})`}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No shipping information available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getProgressWidth(status: string): string {
  switch (status) {
    case "pending":
      return "10%";
    case "processing":
      return "30%";
    case "shipping":
      return "55%";
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
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "processing":
      return "bg-blue-500";
    case "shipping":
      return "bg-blue-700";
    case "shipped":
      return "bg-green-500";
    case "delivered":
      return "bg-green-700";
    case "canceled":
      return "bg-red-500";
    default:
      return "bg-primary";
  }
}

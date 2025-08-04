"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Package, 
  Calendar,
  Phone,
  Mail,
  ArrowLeft,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useShippingOrderDetail } from "@/features/shipper/services/queries";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Fetch order details from API
  const { data, isLoading, error } = useShippingOrderDetail(params.id);
  const order = data?.order;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading order</h3>
          <p className="text-muted-foreground">Failed to load order details. Please try again.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shipping":
        return <Badge variant="default" className="flex items-center gap-1"><Truck className="h-3 w-3" />Shipping</Badge>;
      case "shipped":
        return <Badge variant="secondary" className="flex items-center gap-1"><Truck className="h-3 w-3" />Shipped</Badge>;
      case "delivered":
        return <Badge variant="outline" className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" />Delivered</Badge>;
      default:
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="default">Medium Priority</Badge>;
      case "low":
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
            <p className="text-muted-foreground">
              Shipping order details and tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(order.status)}
          {getPriorityBadge(order.priority)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Contact Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Name:</span>
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{order.address}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                 {order.items.map((item) => (
                   <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                     <div>
                       <h4 className="font-medium">{item.name}</h4>
                       <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                     </div>
                     <div className="text-right">
                       <p className="font-medium">{item.total.replace('$', '')} VNĐ</p>
                       <p className="text-sm text-muted-foreground">{item.price.replace('$', '')} VNĐ each</p>
                     </div>
                   </div>
                 ))}
                 <Separator />
                 <div className="space-y-2">
                   <div className="flex justify-between">
                     <span>Subtotal:</span>
                     <span>{order.subtotal.replace('$', '')} VNĐ</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Shipping:</span>
                     <span>{order.shipping.replace('$', '')} VNĐ</span>
                   </div>
                   <Separator />
                   <div className="flex justify-between font-medium">
                     <span>Total:</span>
                     <span>{order.total.replace('$', '')} VNĐ</span>
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>

         
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          

          {/* Tracking Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Tracking Number</h4>
                <p className="text-sm font-mono bg-muted p-2 rounded">{order.trackingNumber}</p>
              </div>
              <div className="space-y-3">
                                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Pickup Date:</span>
                        <span>{new Date(order.pickupDate).toLocaleDateString()}</span>
                      </div>
                                  {order.estimatedDelivery && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Estimated Delivery:</span>
                      <span>{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  )}
                                  {order.actualDelivery && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Delivered:</span>
                      <span className="text-green-600">{new Date(order.actualDelivery).toLocaleDateString()}</span>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

         {/* Notes */}
         <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Notes</h4>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Shipper Notes</h4>
                  <p className="text-sm text-muted-foreground">{order.shipperNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
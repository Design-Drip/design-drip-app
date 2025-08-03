"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, MapPin, Clock, CheckCircle, AlertCircle, Package, Calendar, Loader2, Upload, Image } from "lucide-react";
import { useMyOrders, useUploadShippingImage } from "@/features/shipper/services/queries";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export default function MyOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useMyOrders();
  const myOrders = data?.orders || [];
  
  const uploadShippingImageMutation = useUploadShippingImage();
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // UploadThing setup
  const { useUploadThing } = generateReactHelpers<OurFileRouter>();
  const { startUpload, isUploading } = useUploadThing("imageUploader");

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

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    return "bg-yellow-500";
  };

  const calculateProgress = (order: any) => {
    // Simple progress calculation based on status
    switch (order.status) {
      case "shipping":
        return 50; // In progress
      case "shipped":
        return 75; // Shipped
      case "delivered":
        return 100; // Completed
      default:
        return 25; // Pending
    }
  };

  const handleImageUpload = async (orderId: string, file: File) => {
    setUploadingOrderId(orderId);
    
    try {
      // Upload using UploadThing
      const uploadResult = await startUpload([file]);
      
      if (!uploadResult || !uploadResult[0]) {
        throw new Error('Failed to upload image');
      }
      
      const imageUrl = uploadResult[0].ufsUrl;
      
             console.log("Uploading image with URL:", imageUrl);
       
       // Update order with shipping image
       const result = await uploadShippingImageMutation.mutateAsync({ 
         orderId, 
         shippingImage: imageUrl 
       });
       
       console.log("Upload result:", result);
       
       // Refresh data
       queryClient.invalidateQueries({ queryKey: ["my-orders"] });
       queryClient.invalidateQueries({ queryKey: ["shipping-orders"] });
      
      toast.success("Shipping image uploaded successfully!", {
        description: "Order status has been updated to shipped.",
      });
    } catch (error) {
      console.error("Failed to upload shipping image:", error);
      toast.error("Failed to upload shipping image", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUploadingOrderId(null);
    }
  };

  const handleFileSelect = (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      
      handleImageUpload(orderId, file);
    }
  };

  const triggerFileInput = (orderId: string) => {
    const fileInput = fileInputRefs.current[orderId];
    if (fileInput) {
      fileInput.click();
    }
  };

  const OrderActions = ({ order }: { order: any }) => (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => router.push(`/shipper_management/shipping-orders/${order.id}`)}
      >
        View Details
      </Button>
             {(order.status === "shipping" || order.status === "shipped") && order.status !== "delivered" && (
         <>
           <input
             type="file"
             accept="image/*"
             onChange={(e) => handleFileSelect(order.id, e)}
             className="hidden"
             disabled={uploadingOrderId === order.id}
             ref={(el) => {
               fileInputRefs.current[order.id] = el;
             }}
           />
           <Button 
             size="sm" 
             variant={order.status === "shipped" ? "outline" : "secondary"}
             disabled={uploadingOrderId === order.id || isUploading}
             onClick={() => triggerFileInput(order.id)}
           >
             {uploadingOrderId === order.id || isUploading ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Uploading...
               </>
             ) : (
               <>
                 <Upload className="mr-2 h-4 w-4" />
                 {order.status === "shipped" ? "Update Image" : "Upload Image"}
               </>
             )}
           </Button>
         </>
       )}
    </div>
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case "medium":
        return <Badge variant="default" className="text-xs">Medium Priority</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-xs">Low Priority</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const OrderInfo = ({ order }: { order: any }) => (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium mb-2">Priority:</p>
        <div className="mb-3">
          {getPriorityBadge(order.priority)}
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2">Notes:</p>
        <p className="text-sm text-muted-foreground">{order.notes || "No notes available"}</p>
      </div>
      
      {order.shippingImage && (
        <div>
          <p className="text-sm font-medium mb-2">Shipping Image:</p>
          <img 
            src={order.shippingImage} 
            alt="Shipping proof" 
            className="w-full max-w-xs rounded-md border"
          />
        </div>
      )}
      
      <OrderActions order={order} />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading orders</h3>
          <p className="text-muted-foreground">Failed to load your orders. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">
          Track your assigned orders and delivery progress
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Pickup</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for pickup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Days per order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
                 <TabsList>
           <TabsTrigger value="all">All Orders ({myOrders.length})</TabsTrigger>
           <TabsTrigger value="active">Active ({myOrders.filter(order => order.status === "shipping").length})</TabsTrigger>
           <TabsTrigger value="shipped">Shipped ({myOrders.filter(order => order.status === "shipped").length})</TabsTrigger>
           <TabsTrigger value="completed">Completed ({myOrders.filter(order => order.status === "delivered").length})</TabsTrigger>
         </TabsList>

        <TabsContent value="all" className="space-y-4">
          {myOrders.length > 0 ? (
            <div className="grid gap-4">
              {myOrders.map((order) => {
                const progress = calculateProgress(order);
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Order #{order.id}
                            {getStatusBadge(order.status)}
                          </CardTitle>
                          <CardDescription>
                            {order.customerName} • {order.items} items • {order.total.replace('$', '')} VNĐ
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{progress}% Complete</p>
                          <Progress value={progress} className="w-24 mt-1" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Delivery Address:</span>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">{order.address}</p>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Assigned Date:</span>
                            <span className="text-muted-foreground">{new Date(order.assignedDate).toLocaleDateString()}</span>
                          </div>
                          
                          {order.estimatedDelivery && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Estimated Delivery:</span>
                              <span className="text-muted-foreground">{order.estimatedDelivery}</span>
                            </div>
                          )}
                        </div>
                        
                        <OrderInfo order={order} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders assigned</h3>
                <p className="text-muted-foreground text-center">
                  You don't have any orders assigned to you yet. 
                  <br />
                  Check the "Shipping Orders" page to find available orders.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

                 <TabsContent value="active" className="space-y-4">
           {myOrders.filter(order => order.status === "shipping").length > 0 ? (
             <div className="grid gap-4">
               {myOrders.filter(order => order.status === "shipping").map((order) => {
                 const progress = calculateProgress(order);
                 return (
                   <Card key={order.id}>
                     <CardHeader>
                       <div className="flex items-center justify-between">
                         <div>
                           <CardTitle className="flex items-center gap-2">
                             Order #{order.id}
                             {getStatusBadge(order.status)}
                           </CardTitle>
                           <CardDescription>
                             {order.customerName} • {order.items} items • {order.total.replace('$', '')} VNĐ
                           </CardDescription>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-medium">{progress}% Complete</p>
                           <Progress value={progress} className="w-24 mt-1" />
                         </div>
                       </div>
                     </CardHeader>
                     <CardContent>
                       <div className="grid gap-4 md:grid-cols-2">
                         <div className="space-y-3">
                           <div className="flex items-center gap-2 text-sm">
                             <MapPin className="h-4 w-4 text-muted-foreground" />
                             <span className="font-medium">Delivery Address:</span>
                           </div>
                           <p className="text-sm text-muted-foreground ml-6">{order.address}</p>
                           
                           <div className="flex items-center gap-2 text-sm">
                             <Calendar className="h-4 w-4 text-muted-foreground" />
                             <span className="font-medium">Assigned Date:</span>
                             <span className="text-muted-foreground">{new Date(order.assignedDate).toLocaleDateString()}</span>
                           </div>
                           
                           {order.estimatedDelivery && (
                             <div className="flex items-center gap-2 text-sm">
                               <Clock className="h-4 w-4 text-muted-foreground" />
                               <span className="font-medium">Estimated Delivery:</span>
                               <span className="text-muted-foreground">{order.estimatedDelivery}</span>
                             </div>
                           )}
                         </div>
                         
                         <OrderInfo order={order} />
                       </div>
                     </CardContent>
                   </Card>
                 );
               })}
             </div>
           ) : (
             <Card>
               <CardContent className="flex flex-col items-center justify-center py-12">
                 <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                 <h3 className="text-lg font-semibold mb-2">No active orders</h3>
                 <p className="text-muted-foreground text-center">
                   You don't have any active orders at the moment.
                 </p>
               </CardContent>
             </Card>
           )}
         </TabsContent>

                 <TabsContent value="shipped" className="space-y-4">
           {myOrders.filter(order => order.status === "shipped").length > 0 ? (
             <div className="grid gap-4">
               {myOrders.filter(order => order.status === "shipped").map((order) => {
                 const progress = calculateProgress(order);
                 return (
                   <Card key={order.id}>
                     <CardHeader>
                       <div className="flex items-center justify-between">
                         <div>
                           <CardTitle className="flex items-center gap-2">
                             Order #{order.id}
                             {getStatusBadge(order.status)}
                           </CardTitle>
                           <CardDescription>
                             {order.customerName} • {order.items} items • {order.total.replace('$', '')} VNĐ
                           </CardDescription>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-medium">{progress}% Complete</p>
                           <Progress value={progress} className="w-24 mt-1" />
                         </div>
                       </div>
                     </CardHeader>
                     <CardContent>
                       <div className="grid gap-4 md:grid-cols-2">
                         <div className="space-y-3">
                           <div className="flex items-center gap-2 text-sm">
                             <MapPin className="h-4 w-4 text-muted-foreground" />
                             <span className="font-medium">Delivery Address:</span>
                           </div>
                           <p className="text-sm text-muted-foreground ml-6">{order.address}</p>
                           
                           <div className="flex items-center gap-2 text-sm">
                             <Calendar className="h-4 w-4 text-muted-foreground" />
                             <span className="font-medium">Assigned Date:</span>
                             <span className="text-muted-foreground">{new Date(order.assignedDate).toLocaleDateString()}</span>
                           </div>
                           
                           {order.estimatedDelivery && (
                             <div className="flex items-center gap-2 text-sm">
                               <Clock className="h-4 w-4 text-muted-foreground" />
                               <span className="font-medium">Estimated Delivery:</span>
                               <span className="text-muted-foreground">{order.estimatedDelivery}</span>
                             </div>
                           )}
                         </div>
                         
                         <OrderInfo order={order} />
                       </div>
                     </CardContent>
                   </Card>
                 );
               })}
             </div>
                        ) : (
               <Card>
                 <CardContent className="flex flex-col items-center justify-center py-12">
                   <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                   <h3 className="text-lg font-semibold mb-2">No shipped orders</h3>
                   <p className="text-muted-foreground text-center">
                     You haven't shipped any orders yet.
                   </p>
                 </CardContent>
               </Card>
                          )}
           </TabsContent>

         <TabsContent value="completed" className="space-y-4">
           {myOrders.filter(order => order.status === "delivered").length > 0 ? (
             <div className="grid gap-4">
               {myOrders.filter(order => order.status === "delivered").map((order) => {
                 const progress = calculateProgress(order);
                 return (
                   <Card key={order.id}>
                     <CardHeader>
                       <div className="flex items-center justify-between">
                         <div>
                           <CardTitle className="flex items-center gap-2">
                             Order #{order.id}
                             {getStatusBadge(order.status)}
                           </CardTitle>
                           <CardDescription>
                             {order.customerName} • {order.items} items • {order.total.replace('$', '')} VNĐ
                           </CardDescription>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-medium">{progress}% Complete</p>
                           <Progress value={progress} className="w-24 mt-1" />
                         </div>
                       </div>
                     </CardHeader>
                     <CardContent>
                       <div className="grid gap-4 md:grid-cols-2">
                         <div className="space-y-3">
                           <div className="flex items-center gap-2 text-sm">
                             <MapPin className="h-4 w-4 text-muted-foreground" />
                             <span className="font-medium">Delivery Address:</span>
                           </div>
                           <p className="text-sm text-muted-foreground ml-6">{order.address}</p>
                           
                           <div className="flex items-center gap-2 text-sm">
                             <Calendar className="h-4 w-4 text-muted-foreground" />
                             <span className="font-medium">Assigned Date:</span>
                             <span className="text-muted-foreground">{new Date(order.assignedDate).toLocaleDateString()}</span>
                           </div>
                           
                           {order.estimatedDelivery && (
                             <div className="flex items-center gap-2 text-sm">
                               <Clock className="h-4 w-4 text-muted-foreground" />
                               <span className="font-medium">Estimated Delivery:</span>
                               <span className="text-muted-foreground">{order.estimatedDelivery}</span>
                             </div>
                           )}
                         </div>
                         
                         <OrderInfo order={order} />
                       </div>
                     </CardContent>
                   </Card>
                 );
               })}
             </div>
           ) : (
             <Card>
               <CardContent className="flex flex-col items-center justify-center py-12">
                 <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                 <h3 className="text-lg font-semibold mb-2">No completed orders</h3>
                 <p className="text-muted-foreground text-center">
                   You haven't delivered any orders yet.
                 </p>
               </CardContent>
             </Card>
           )}
         </TabsContent>
       </Tabs>
     </div>
   );
} 
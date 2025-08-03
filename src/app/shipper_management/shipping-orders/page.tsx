"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Truck, Search, Filter, MapPin, Clock, CheckCircle, AlertCircle, Loader2, MoreVertical, Eye, Package } from "lucide-react";
import { useShippingOrders, useAssignOrder } from "@/features/shipper/services/queries";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ShippingOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; customerName: string } | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Fetch shipping orders from API
  const { data, isLoading, error } = useShippingOrders();
  const shippingOrders = data?.orders || [];

  // Assign order mutation
  const assignOrderMutation = useAssignOrder();

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    return shippingOrders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        order.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [shippingOrders, searchTerm, statusFilter, priorityFilter]);

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
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleGetOrder = (order: { id: string; customerName: string }) => {
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedOrder) return;

    try {
      const result = await assignOrderMutation.mutateAsync({ orderId: selectedOrder.id });
      setIsAssignDialogOpen(false);
      setSelectedOrder(null);
      // Refresh the orders list
      queryClient.invalidateQueries({ queryKey: ["shipping-orders"] });
      // Show success message
      toast.success("Order assigned successfully!", {
        description: `Order #${selectedOrder.id} has been assigned to you.`,
      });
    } catch (error) {
      console.error("Failed to assign order:", error);
      toast.error("Failed to assign order", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading shipping orders...</span>
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
          <p className="text-muted-foreground">Failed to load shipping orders. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shipping Orders</h1>
        <p className="text-muted-foreground">
          Available shipping orders that can be assigned to you
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by order ID, customer name, or address..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Shipping Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} orders found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {order.address}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                    <TableCell>{order.items}</TableCell>
                                         <TableCell className="font-medium">{order.total.replace('$', '')} VNĐ</TableCell>
                    <TableCell>{new Date(order.assignedDate).toLocaleDateString()}</TableCell>
                                         <TableCell>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" className="h-8 w-8 p-0">
                             <span className="sr-only">Open menu</span>
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem
                             onClick={() => router.push(`/shipper_management/shipping-orders/${order.id}`)}
                           >
                             <Eye className="mr-2 h-4 w-4" />
                             View Details
                           </DropdownMenuItem>
                                                       <DropdownMenuItem
                              onClick={() => handleGetOrder({ id: order.id, customerName: order.customerName })}
                            >
                              <Package className="mr-2 h-4 w-4" />
                              Get Order
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="h-8 w-8 text-muted-foreground" />
                                             <h3 className="font-medium">No available shipping orders</h3>
                       <p className="text-sm text-muted-foreground">
                         All shipping orders have been assigned or no orders match your search criteria.
                       </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
                 </CardContent>
       </Card>

       {/* Assign Order Confirmation Dialog */}
       <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Confirm Order Assignment</DialogTitle>
             <DialogDescription>
               Are you sure you want to assign order #{selectedOrder?.id} for customer {selectedOrder?.customerName} to yourself?
               <br />
               <br />
               This action will assign the order to you and you will be responsible for shipping it.
             </DialogDescription>
           </DialogHeader>
           <DialogFooter>
             <Button
               variant="outline"
               onClick={() => {
                 setIsAssignDialogOpen(false);
                 setSelectedOrder(null);
               }}
               disabled={assignOrderMutation.isPending}
             >
               Cancel
             </Button>
             <Button
               onClick={handleConfirmAssign}
               disabled={assignOrderMutation.isPending}
             >
               {assignOrderMutation.isPending ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Assigning...
                 </>
               ) : (
                 "Yes, Assign to Me"
               )}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 } 
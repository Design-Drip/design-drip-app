"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { useUpdateOrderStatus } from "@/features/orders/services/mutations";
import { useQueryClient } from "@tanstack/react-query";
import { OrdersKeys } from "@/features/orders/services/queries/keys";
type OrderStatus =
  | "pending"
  | "processing"
  | "shipping"
  | "shipped"
  | "delivered"
  | "canceled";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export default function OrderStatusUpdate({
  orderId,
  currentStatus,
}: OrderStatusUpdateProps) {
  const updateOrderStatus = useUpdateOrderStatus();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleOrderStatus = () => {
    let status: OrderStatus;
    switch (currentStatus) {
      case "pending":
        status = "processing";
        break;
      case "processing":
        status = "shipping";
        break;
      case "shipping":
        status = "shipped";
        break;
      case "shipped":
        status = "delivered";
        break;
      default:
        status = "pending";
    }

    try {
      updateOrderStatus.mutate(
        {
          orderId,
          status,
        },
        {
          onSuccess: () => {
            toast.success(`Order status updated to ${status}`);
            router.refresh();
            queryClient.invalidateQueries({
              queryKey: [OrdersKeys.GetOrderDetailQuery, orderId],
            });
          },
          onError: (error) => {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
          },
        }
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  return (
    <div className="flex justify-end mb-3">
      <Button
        onClick={handleOrderStatus}
        disabled={updateOrderStatus.isPending || currentStatus !== "processing"}
        variant={updateOrderStatus.isPending ? "outline" : "default"}
      >
        {updateOrderStatus.isPending ? (
          <>
            <Loader2 className="animate-spin" /> <span>Loading...</span>
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
}

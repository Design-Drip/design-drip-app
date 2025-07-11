"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
type OrderStatus =
  | "pending"
  | "processing"
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
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const updateOrderStatus = useUpdateOrderStatus();
  const handleStatusChange = (newStatus: OrderStatus) => {
    setStatus(newStatus);
  };

  const handleOrderStatus = () => {
    if (status === currentStatus) return;

    setIsUpdating(true);
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
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Select
        value={status}
        onValueChange={(value: OrderStatus) =>
          handleStatusChange(value)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            <OrderStatusBadge status={status} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">
            <OrderStatusBadge status="pending" />
          </SelectItem>
          <SelectItem value="processing">
            <OrderStatusBadge status="processing" />
          </SelectItem>
          <SelectItem value="shipped">
            <OrderStatusBadge status="shipped" />
          </SelectItem>
          <SelectItem value="delivered">
            <OrderStatusBadge status="delivered" />
          </SelectItem>
          <SelectItem value="canceled">
            <OrderStatusBadge status="canceled" />
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={handleOrderStatus}
        disabled={status === currentStatus || isUpdating}
        variant={status === currentStatus ? "outline" : "default"}
      >
        {isUpdating ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
}

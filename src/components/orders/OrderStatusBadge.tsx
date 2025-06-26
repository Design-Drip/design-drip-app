import { Badge } from "@/components/ui/badge";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusStyles: Record<
  OrderStatus,
  { color: string; background: string; text: string }
> = {
  pending: {
    color: "text-yellow-700",
    background: "bg-yellow-50 border-yellow-200",
    text: "Pending",
  },
  processing: {
    color: "text-blue-700",
    background: "bg-blue-50 border-blue-200",
    text: "Processing",
  },
  shipped: {
    color: "text-purple-700",
    background: "bg-purple-50 border-purple-200",
    text: "Shipped",
  },
  delivered: {
    color: "text-green-700",
    background: "bg-green-50 border-green-200",
    text: "Delivered",
  },
  canceled: {
    color: "text-red-700",
    background: "bg-red-50 border-red-200",
    text: "Canceled",
  },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <Badge
      className={`${style.background} ${style.color} hover:bg-opacity-75 hover:${style.color}`}
    >
      {style.text}
    </Badge>
  );
}

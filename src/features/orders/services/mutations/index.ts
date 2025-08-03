import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrdersKeys } from "../queries/keys";

// Define the allowed order status types
type OrderStatus =
  | "pending"
  | "processing"
  | "shipping"
  | "shipped"
  | "delivered"
  | "canceled";

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      const response = await client.api.orders[":id"].status.$put({
        param: { id: orderId },
        json: { status },
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [OrdersKeys.GetOrderDetailQuery],
      });
      queryClient.invalidateQueries({
        queryKey: [OrdersKeys.GetOrdersQuery],
      });
    },
  });
};

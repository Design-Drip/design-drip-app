import { queryOptions, skipToken } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { OrdersKeys } from "./keys";

export const getOrdersQuery = (page = 1, limit = 10, status?: string) => {
  let queryParams: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (status) {
    queryParams.status = status;
  }

  return queryOptions({
    queryKey: [OrdersKeys.GetOrdersQuery, page, limit, status],
    queryFn: async () => {
      const response = await client.api.orders.$get({
        query: queryParams,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      return response.json();
    },
  });
};

export const getOrderDetailQuery = (orderId?: string) =>
  queryOptions({
    queryKey: [OrdersKeys.GetOrderDetailQuery, orderId],
    queryFn: orderId
      ? async () => {
          const response = await client.api.orders[":id"].$get({
            param: { id: orderId },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch order details");
          }

          return response.json();
        }
      : skipToken,
    enabled: !!orderId,
  });

import { queryOptions } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { CartKeys } from "./keys";

export const getCartQuery = () =>
  queryOptions({
    queryKey: [CartKeys.GetCartQuery],
    queryFn: async () => {
      const response = await client.api.cart.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      return response.json();
    },
  });

export const getCartItemCountQuery = () =>
  queryOptions({
    queryKey: [CartKeys.GetCartItemCountQuery],
    queryFn: async () => {
      const response = await client.api.cart["item-count"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch cart item count");
      }

      return response.json();
    },
  });

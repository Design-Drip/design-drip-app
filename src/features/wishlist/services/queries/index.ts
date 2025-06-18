import { queryOptions } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { WishlistKeys } from "./keys";

export const getWishlistQuery = () =>
  queryOptions({
    queryKey: [WishlistKeys.GetWishlistQuery],
    queryFn: async () => {
      const response = await client.api["wish-list"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }

      return response.json();
    },
  });

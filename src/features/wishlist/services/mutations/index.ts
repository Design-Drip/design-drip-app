import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { WishlistKeys } from "../queries/keys";

export const useAddToWishlistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await client.api["wish-list"][":id"].$post({
        param: { id: productId },
      });

      if (!response.ok) {
        throw new Error("Failed to add product to wishlist");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WishlistKeys.GetWishlistQuery],
      });
    },
  });
};

export const useRemoveFromWishlistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await client.api["wish-list"][":id"].$delete({
        param: { id: productId },
      });

      if (!response.ok) {
        throw new Error("Failed to remove product from wishlist");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WishlistKeys.GetWishlistQuery],
      });
    },
  });
};

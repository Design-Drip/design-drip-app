import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { CartKeys } from "../queries/keys";

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface AddToCartPayload {
  designId: string;
  quantityBySize: SizeQuantity[];
}

interface UpdateCartItemPayload {
  quantityBySize: SizeQuantity[];
}

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddToCartPayload) => {
      const response = await client.api.cart.$post({
        json: payload,
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CartKeys.GetCartQuery],
      });

      queryClient.invalidateQueries({
        queryKey: [CartKeys.GetCartItemCountQuery],
      });
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateCartItemPayload;
    }) => {
      const response = await client.api.cart[":id"].$put({
        param: { id: itemId },
        json: payload,
      });

      if (!response.ok) {
        throw new Error("Failed to update cart item");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CartKeys.GetCartQuery],
      });
    },
  });
};

export const useRemoveFromCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await client.api.cart[":id"].$delete({
        param: { id: itemId },
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CartKeys.GetCartQuery],
      });

      queryClient.invalidateQueries({
        queryKey: [CartKeys.GetCartItemCountQuery],
      });
    },
  });
};

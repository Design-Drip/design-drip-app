import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getWishlistQuery } from "@/features/wishlist/services/queries";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/features/wishlist/services/mutations";
import { toast } from "sonner";

export function useWishlist() {
  const { isSignedIn } = useAuth();

  const addToWishlist = useAddToWishlistMutation();
  const removeFromWishlist = useRemoveFromWishlistMutation();

  const { data: wishlistItems = [], isLoading } = useQuery({
    ...getWishlistQuery(),
    enabled: isSignedIn,
  });

  const addItem = (productId: string) => {
    if (isSignedIn) {
      return addToWishlist.mutate(productId, {
        onSuccess: () => {
          toast.success("Product added to wishlist!");
        },
      });
    }
  };

  const removeItem = (productId: string) => {
    if (isSignedIn) {
      return removeFromWishlist.mutate(productId, {
        onSuccess: () => {
          toast.success("Product removed from wishlist!");
        },
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.includes(productId);
  };

  return {
    wishlistItems: isSignedIn ? wishlistItems : [],
    isLoading,
    addItem,
    removeItem,
    isInWishlist,
    isSignedIn,
  };
}

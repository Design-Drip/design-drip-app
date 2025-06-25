import dbConnect from "@/lib/db";
import { Cart } from "@/models/cart";
import { User } from "@clerk/nextjs/server";

export const getTotalItemsInCart = async (user: User | null) => {
  if (!user) {
    return 0;
  }

  await dbConnect();

  const cart = await Cart.findOne({
    userId: user.id,
  });

  return cart ? cart.items.length : 0;
};

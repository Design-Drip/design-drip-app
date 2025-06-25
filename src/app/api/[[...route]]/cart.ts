import verifyAuth from "@/lib/middlewares/verifyAuth";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { Cart } from "@/models/cart";
import { Design } from "@/models/design";
import { Shirt, ShirtColor, ShirtSizeVariant } from "@/models/product";
import mongoose from "mongoose";

const quantityBySizeSchema = z.array(
  z.object({
    size: z.string().min(1),
    quantity: z.number().int().min(1),
  })
);

const addToCartSchema = z.object({
  designId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid design ID format",
  }),
  quantityBySize: quantityBySizeSchema,
});

const editCartItemSchema = z.object({
  quantityBySize: quantityBySizeSchema,
});

const app = new Hono()
  .use(verifyAuth)
  .get("/", async (c) => {
    const user = c.get("user")!;

    try {
      const cart = await Cart.findOne({ userId: user.id }).lean();

      if (!cart) {
        return c.json({
          items: [],
          totalItems: 0,
          totalQuantity: 0,
          subtotal: 0,
        });
      }

      const cartItems = await Promise.all(
        cart.items.map(async (item) => {
          const design = await Design.findById(item.designId).lean();

          if (!design) {
            return null;
          }

          const shirtColor = await ShirtColor.findById(
            design.shirt_color_id
          ).lean();

          if (!shirtColor) {
            return null;
          }

          const shirt = await Shirt.findById(shirtColor.shirt_id).lean();

          if (!shirt) {
            return null;
          }

          const shirtSizeVariant = await ShirtSizeVariant.find({
            shirtColor: shirtColor._id,
          }).lean();

          const previewImages = design.design_images
            ? Object.entries(design.design_images).map(([key, value]) => ({
                id: key,
                url: value,
              }))
            : [];

          return {
            id: item._id!.toString(),
            designId: design._id.toString(),
            designName: design.name,
            name: shirt.name,
            color: shirtColor.color,
            colorValue: shirtColor.color_value,
            data: item.quantityBySize.map((size) => {
              const sizeVariant = shirtSizeVariant.find(
                (variant) => variant.size === size.size
              );

              if (!sizeVariant) {
                throw new HTTPException(400, {
                  message: `Size ${size.size} not found for shirt color ${shirtColor.color}`,
                });
              }

              const pricePerSize =
                shirt.base_price + sizeVariant.additional_price;

              return {
                size: size.size,
                quantity: size.quantity,
                pricePerSize,
                totalPrice: pricePerSize * size.quantity,
              };
            }),
            previewImages,
          };
        })
      );

      const validCartItems = cartItems.filter((item) => item !== null);

      return c.json({
        items: validCartItems,
        totalItems: validCartItems.length,
        totalQuantity: validCartItems.reduce(
          (sum, item) =>
            sum + item.data.reduce((s, size) => s + size.quantity, 0),
          0
        ),
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw new HTTPException(500, { message: "Failed to fetch cart" });
    }
  })
  .post("/", zValidator("json", addToCartSchema), async (c) => {
    const user = c.get("user")!;
    const { designId, quantityBySize } = c.req.valid("json");
    try {
      const design = await Design.findById(designId).lean();

      if (!design) {
        throw new HTTPException(404, { message: "Design not found" });
      }

      // Validate that the design belongs to the user
      if (design.user_id.toString() !== user.id) {
        throw new HTTPException(403, {
          message: "Unauthorized to add this design",
        });
      }

      let cart = await Cart.findOne({ userId: user.id });

      if (!cart) {
        cart = new Cart({ userId: user.id, items: [] });
      }

      cart.items.push({
        designId: design._id as mongoose.Types.ObjectId,
        quantityBySize,
      });

      await cart.save();

      return c.json(
        {
          success: true,
          message: "Item added to cart successfully",
          cartItemCount: cart.items.length,
        },
        201
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to add item to cart" });
    }
  })
  .put(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z
          .string()
          .trim()
          .refine((val) => {
            if (!mongoose.isObjectIdOrHexString(val)) {
              throw new HTTPException(400, {
                message: "Invalid cart item ID",
              });
            }
            return true;
          }),
      })
    ),
    zValidator("json", editCartItemSchema),
    async (c) => {
      const user = c.get("user")!;
      const itemId = c.req.param("id");
      const { quantityBySize } = c.req.valid("json");

      try {
        const cart = await Cart.findOne({ userId: user.id });

        if (!cart) {
          throw new HTTPException(404, { message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(
          (item) => item._id!.toString() === itemId
        );

        if (itemIndex === -1) {
          throw new HTTPException(404, { message: "Item not found in cart" });
        }

        // Validate all sizes exist for this product before updating
        const design = await Design.findById(
          cart.items[itemIndex].designId
        ).lean();
        if (!design) {
          throw new HTTPException(404, { message: "Design not found" });
        }

        const shirtColor = await ShirtColor.findById(
          design.shirt_color_id
        ).lean();
        if (!shirtColor) {
          throw new HTTPException(404, { message: "Product color not found" });
        }

        // Fetch available sizes for this shirt color
        const availableSizes = await ShirtSizeVariant.find({
          shirtColor: shirtColor._id,
        }).lean();

        // Validate all sizes in the request are valid for this product
        for (const sizeItem of quantityBySize) {
          const sizeExists = availableSizes.some(
            (s) => s.size === sizeItem.size
          );
          if (!sizeExists) {
            throw new HTTPException(400, {
              message: `Size ${sizeItem.size} is not available for this product`,
            });
          }
        }

        cart.items[itemIndex].quantityBySize = quantityBySize;

        await cart.save();

        return c.json({
          success: true,
          message: "Cart item updated successfully",
          updatedItem: {
            id: cart.items[itemIndex]._id!.toString(),
            designId: cart.items[itemIndex].designId.toString(),
            quantityBySize: cart.items[itemIndex].quantityBySize,
          },
        });
      } catch (error) {
        console.error("Error updating cart item:", error);
        if (error instanceof HTTPException) {
          throw error;
        }
        throw new HTTPException(500, {
          message: "Failed to update cart item",
        });
      }
    }
  )
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z
          .string()
          .trim()
          .refine((val) => {
            if (!mongoose.isObjectIdOrHexString(val)) {
              throw new HTTPException(400, {
                message: "Invalid cart item ID",
              });
            }
            return true;
          }),
      })
    ),
    async (c) => {
      const user = c.get("user")!;
      const itemId = c.req.param("id");

      try {
        const cart = await Cart.findOne({ userId: user.id });

        if (!cart) {
          throw new HTTPException(404, { message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(
          (item) => item._id!.toString() === itemId
        );

        if (itemIndex === -1) {
          throw new HTTPException(404, { message: "Item not found in cart" });
        }

        cart.items.splice(itemIndex, 1);

        await cart.save();

        return c.json({
          success: true,
          message: "Item removed from cart successfully",
          cartItemCount: cart.items.length,
        });
      } catch (error) {
        console.error("Error removing item from cart:", error);
        if (error instanceof HTTPException) {
          throw error;
        }
        throw new HTTPException(500, {
          message: "Failed to remove item from cart",
        });
      }
    }
  );

export default app;

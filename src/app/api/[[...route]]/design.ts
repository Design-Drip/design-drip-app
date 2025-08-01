import verifyAuth from "@/lib/middlewares/verifyAuth";
import { Design } from "@/models/design";
import { Cart } from "@/models/cart";
import user from "@/models/user";
import { auth } from "@clerk/nextjs/server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import mongoose from "mongoose";
import { z } from "zod";

// Schema for validating element design data
const elementDesignSchema = z.object({
  images_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid images_id format",
  }),
  element_Json: z.string().min(1, "element_Json cannot be empty"),
});

// Schema for the main design creation request
const createDesignSchema = z.object({
  shirt_color_id: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid shirt_color_id format",
    }),
  element_design: z.record(z.string(), elementDesignSchema),
  name: z.string().default("Shirt Design"),
  design_images: z.record(z.string(), z.string()).optional(),
  parent_design_id: z.string().optional(), // For versioning - ID of the design being edited
  quote_id: z.string().optional(), // For designs from assigned quotes
});

const app = new Hono()
  .use(verifyAuth)
  .post("/", zValidator("json", createDesignSchema), async (c) => {
    try {
      const user = c.get("user");
      if (!user) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const { shirt_color_id, element_design, name, design_images, parent_design_id, quote_id } =
        c.req.valid("json");

      console.log("[API POST] Request payload:", { parent_design_id, quote_id });


      // Convert string IDs to ObjectIds for the database
      const elementDesignObj: {
        [key: string]: {
          images_id: mongoose.Types.ObjectId;
          element_Json: string;
        };
      } = {};

      Object.entries(element_design).forEach(([key, value]) => {
        elementDesignObj[key] = {
          images_id: new mongoose.Types.ObjectId(value.images_id),
          element_Json: value.element_Json,
        };
      });

      // ALWAYS create a new design (Save as New versioning behavior)
      // This ensures we keep all versions and never overwrite existing designs
      const designData: any = {
        user_id: user.id,
        shirt_color_id: new mongoose.Types.ObjectId(shirt_color_id),
        element_design: elementDesignObj,
        name: name,
        design_images: design_images || {},
      };

      // Add quote_id if provided
      if (quote_id && mongoose.Types.ObjectId.isValid(quote_id)) {
        designData.quote_id = new mongoose.Types.ObjectId(quote_id);
      }

      // Handle versioning logic
      if (parent_design_id && mongoose.Types.ObjectId.isValid(parent_design_id)) {
        // This is a new version of an existing design
        designData.parent_design_id = new mongoose.Types.ObjectId(parent_design_id);
        
        // Find the parent design to get the original design ID
        const parentDesign = await Design.findById(parent_design_id);
        if (!parentDesign) {
          throw new HTTPException(404, { message: "Parent design not found" });
        }

        // Find the root design (original) to count versions
        const rootDesignId = parentDesign.parent_design_id || parent_design_id;
        
        // Count existing versions from this root design
        const existingVersions = await Design.countDocuments({
          $or: [
            { _id: rootDesignId },
            { parent_design_id: rootDesignId }
          ],
          user_id: user.id
        });

        // Set version number (v1, v2, v3, etc.)
        designData.version = `v${existingVersions}`;
        
        console.log("[API POST] Creating new version:", designData.version, "of design:", parent_design_id);
      } else {
        // This is a new original design
        designData.version = "original";
        console.log("[API POST] Creating original design");

      }

      const design = new Design(designData);
      await design.save();

      console.log("[API POST] Design created successfully with ID:", design.id);

      return c.json(
        {
          success: true,
          data: design,
        },
        201 // Always 201 since we're always creating new
      );
    } catch (error) {
      console.error("Error creating/updating design:", error);

      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, {
        message: "Failed to save design",
      });
    }
  })
  .get("/", async (c) => {
    try {
      const user = c.get("user");
      if (!user) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }

      const designs = await Design.find({ user_id: user.id })
        .populate({
          path: "shirt_color_id",
          populate: {
            path: "shirt_id",
            model: "Shirt", // Make sure this matches your Shirt model name
            select: "_id name",
          },
        })
        .populate("element_design.images_id")
        .populate({
          path: "quote_id",
          model: "RequestQuote",
          select: "_id firstName lastName company status type quotedPrice createdAt design_id",
        })
        .sort({ createdAt: -1 })
        .lean(); // Convert to plain objects

      // Debug: Log designs to see if quote_id is populated
      console.log("[API GET /] Found designs:", designs.length);
             designs.forEach((design, index) => {
         console.log(`Design ${index}:`, {
           id: design.id,
           _id: design._id,
           name: design.name,
           hasQuoteId: !!design.quote_id,
           quoteId: design.quote_id?._id,
           quoteData: design.quote_id
         });
       });

      return c.json({
        success: true,
        data: designs,
      });
    } catch (error) {
      console.error("Error fetching designs:", error);
      throw new HTTPException(500, {
        message: "Failed to fetch designs",
      });
    }
  })
  .get(
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
                message: "Invalid design ID",
              });
            }
            return true;
          }),
      })
    ),
    async (c) => {
      try {
        const id = c.req.valid("param").id;
        console.log("[API GET /:id] Fetching design with ID:", id);
        const design = await Design.findById(id)
          .populate({
            path: "shirt_color_id",
            populate: {
              path: "shirt_id",
              model: "Shirt",
              select: "_id name",
            },
          })
          .populate("element_design.images_id")
          .populate({
            path: "quote_id",
            model: "RequestQuote",
            select: "_id firstName lastName company status type quotedPrice createdAt design_id",
          })
          .lean();
        
        if (!design) {
          console.log("[API GET /:id] Design not found for ID:", id);
          throw new HTTPException(404, { message: "Design not found" });
        }
        
        console.log("[API GET /:id] Found design:", { 
          id: design._id, 
          name: design.name,
          version: design.version,
          hasQuoteId: !!design.quote_id,
          quoteId: design.quote_id?._id,
          quoteData: design.quote_id
        });
        
        return c.json({
          success: true,
          data: design,
        });
      } catch (error) {
        console.error("Error fetching design:", error);
        throw new HTTPException(500, {
          message: "Failed to fetch design",
        });
      }
    }
  )
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
                message: "Invalid design ID",
              });
            }
            return true;
          }),
      })
    ),
    zValidator("json", createDesignSchema), // Validate request body using the same schema
    async (c) => {
      try {
        const user = c.get("user");
        if (!user) {
          throw new HTTPException(401, { message: "Unauthorized" });
        }
        const id = c.req.valid("param").id;
        const { shirt_color_id, element_design, name, design_images, parent_design_id, quote_id } =
          c.req.valid("json");

        console.log("[API PUT] Request payload template info:", { parent_design_id });

        // Check if the design exists and belongs to the user
        const existingDesign = await Design.findOne({
          _id: id,
          user_id: user.id,
        });

        // Convert string IDs to ObjectIds for the database
        const elementDesignObj: {
          [key: string]: {
            images_id: mongoose.Types.ObjectId;
            element_Json: string;
          };
        } = {};

        Object.entries(element_design).forEach(([key, value]) => {
          elementDesignObj[key] = {
            images_id: new mongoose.Types.ObjectId(value.images_id),
            element_Json: value.element_Json,
          };
        });

        // Check if the design exists
        if (!existingDesign) {
          throw new HTTPException(404, { message: "Design not found" });
        }

        // Update the design fields
        existingDesign.element_design = elementDesignObj;
        existingDesign.name = name;

        // Only update design_images if provided
        if (design_images) {
          existingDesign.design_images = design_images;
        }

        // Update quote_id if provided
        if (quote_id && mongoose.Types.ObjectId.isValid(quote_id)) {
          existingDesign.quote_id = new mongoose.Types.ObjectId(quote_id);
        }

        // Save the updated design
        const updatedDesign = await existingDesign.save();

        return c.json({
          success: true,
          data: updatedDesign,
        });
      } catch (error) {
        console.error("Error updating design:", error);
        throw new HTTPException(500, {
          message: "Failed to update design",
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
                message: "Invalid design ID",
              });
            }
            return true;
          }),
      })
    ),
    async (c) => {
      try {
        const user = c.get("user");
        if (!user) {
          throw new HTTPException(401, { message: "Unauthorized" });
        }

        const id = c.req.valid("param").id;
        const designObjectId = new mongoose.Types.ObjectId(id);

        const design = await Design.findOne({
          user_id: user.id,
          _id: designObjectId,
        });

        if (!design) {
          throw new HTTPException(404, { message: "Design not found" });
        }
        const carts = await Cart.find({
          "items.designId": designObjectId,
        });

        for (const cart of carts) {
          const initialItemCount = cart.items.length;

          cart.items = cart.items.filter((item) => {
            const itemDesignId = item.designId.toString();
            const targetDesignId = designObjectId.toString();
            return itemDesignId !== targetDesignId;
          });

          const removedItems = initialItemCount - cart.items.length;

          // Only save if items were actually removed
          if (removedItems > 0) {
            await cart.save();
            console.log(`Removed ${removedItems} items from cart ${cart._id}`);
          }
        }

        await Design.findOneAndDelete({
          user_id: user.id,
          _id: designObjectId,
        });
        return c.json({
          success: true,
          message: "Design deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting design:", error);
        throw new HTTPException(500, {
          message: "Failed to delete design",
        });
      }
    }
  );

export default app;

import verifyAuth from "@/lib/middlewares/verifyAuth";
import { Design } from "@/models/design";
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
});

const app = new Hono()
  .use(verifyAuth)
  .post(
    "/",

    zValidator("json", createDesignSchema),
    async (c) => {
      try {
        const user = c.get("user");
        if (!user) {
          throw new HTTPException(401, { message: "Unauthorized" });
        }
        const { shirt_color_id, element_design, name, design_images } =
          c.req.valid("json");

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

        // Check if design already exists for this shirt variant
        const existingDesign = await Design.findOne({
          user_id: user.id,
          shirt_color_id: new mongoose.Types.ObjectId(shirt_color_id),
          name: name,
        });

        let design;

        if (existingDesign) {
          existingDesign.element_design = elementDesignObj;
          existingDesign.name = name;
          if (design_images) {
            existingDesign.design_images = design_images;
          }
          design = await existingDesign.save();
        } else {
          // Check if there's a design with the same shirt color but different name
          const sameShirtColorDesign = await Design.findOne({
            user_id: user.id,
            shirt_color_id: new mongoose.Types.ObjectId(shirt_color_id),
          });

          if (sameShirtColorDesign && sameShirtColorDesign.name !== name) {
            // Create a new design if the name is different
            design = new Design({
              user_id: user.id,
              shirt_color_id: new mongoose.Types.ObjectId(shirt_color_id),
              element_design: elementDesignObj,
              name: name,
              design_images: design_images || {},
            });
            await design.save();
          } else if (!sameShirtColorDesign) {
            // No design exists for this shirt color, create a new one
            design = new Design({
              user_id: user.id,
              shirt_color_id: new mongoose.Types.ObjectId(shirt_color_id),
              element_design: elementDesignObj,
              name: name,
              design_images: design_images || {},
            });
            await design.save();
          } else {
            // This case shouldn't be reached due to the earlier existingDesign check
            // But just to be safe, update the existing design
            sameShirtColorDesign.element_design = elementDesignObj;
            sameShirtColorDesign.name = name;
            if (design_images) {
              sameShirtColorDesign.design_images = design_images;
            }
            design = await sameShirtColorDesign.save();
          }
        }

        return c.json(
          {
            success: true,
            data: design,
          },
          existingDesign ? 200 : 201
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
    }
  )
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
          },
        })
        .populate("element_design.images_id");

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
        const design = await Design.findOneAndDelete({
          user_id: user.id,
          _id: new mongoose.Types.ObjectId(id),
        });

        if (!design) {
          throw new HTTPException(404, { message: "Design not found" });
        }

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

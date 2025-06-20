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
  images_id: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
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
  name: z.string().default("Shirt Design"), // Add this line
});

const app = new Hono().use(verifyAuth).post(
  "/",

  zValidator("json", createDesignSchema),
  async (c) => {
    try {
      const user = c.get("user");
      if (!user) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const { shirt_color_id, element_design, name } =
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
      });

      let design;

      if (existingDesign) {
        existingDesign.element_design = elementDesignObj;
        existingDesign.name = name;
        design = await existingDesign.save();
      } else {
        design = new Design({
          user_id: user.id,
          shirt_color_id: new mongoose.Types.ObjectId(shirt_color_id),
          element_design: elementDesignObj,
          name: name,
        });
        await design.save();
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
);

export default app;

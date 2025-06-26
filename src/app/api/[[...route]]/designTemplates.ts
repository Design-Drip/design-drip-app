import verifyAdmin from "@/lib/middlewares/verifyAdmin";
import { DesignTemplate } from "@/models/design-template";
import { auth, currentUser } from "@clerk/nextjs/server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().optional().default(1),
        limit: z.coerce.number().optional().default(12),
        category: z.string().optional(),
        search: z.string().optional(),
        sort: z.enum(["newest", "popular", "rating"]).optional().default("newest"),
        isActive: z.coerce.boolean().optional(),
        featured: z.coerce.boolean().optional(),
      })
    ),
    async (c) => {
      try {

        const { page, limit, category, search, sort, isActive, featured } = c.req.valid("query");
        const skip = (page - 1) * limit;

        // Build filter query
        const filter: any = {};

        // Only show active templates by default (unless explicitly specified)
        if (isActive) {
          filter.isActive = isActive;
        }

        if (category && category !== 'all') {
          filter.category = category;
        }

        if (featured !== undefined) {
          filter.featured = featured;
        }

        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: "i" } },
          ];
        }

        // Build sort query
        let sortQuery: any = {};
        switch (sort) {
          case "popular":
          case "rating":
            sortQuery = { rating: -1 };
            break;
          default:
            sortQuery = { createdAt: -1 };
        }

        const [results, totalCount] = await Promise.all([
          DesignTemplate.find(filter)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .lean(),
          DesignTemplate.countDocuments(filter)
        ]);

        return c.json({
          items: results,
          totalItems: totalCount,
          page,
          pageSize: limit,
        });
      } catch (error) {
        console.error("Error fetching design templates:", error);
        throw new HTTPException(500, { message: "Failed to fetch design templates" });
      }
    }
  )

  // Get template by ID
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");

      const template = await DesignTemplate.findById(id)
        .populate("created_by", "firstName lastName")
        .lean();

      if (!template) {
        throw new HTTPException(404, { message: "Template not found" });
      }

      return c.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error("Error fetching template:", error);
      throw new HTTPException(500, { message: "Failed to fetch template" });
    }
  })

  // Create new design template (Admin only)
  .post(
    "/",
    verifyAdmin,
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(255),
        imageUrl: z.string().url(),
        category: z.enum([
          "logo",
          "banner",
          "poster",
          "business-card",
          "flyer",
          "social-media",
          "brochure",
          "presentation",
          "invitation",
          "certificate"
        ]),
        featured: z.boolean().optional().default(false),
      })
    ),
    async (c) => {
      try {
        const data = c.req.valid("json");

        const template = new DesignTemplate({ ...data })

        await template.save()

        return c.json({
          success: true,
          data: template,
          message: "Template created successfully"
        }, 201);
      } catch (error) {
        console.error("Error creating template:", error);
        throw new HTTPException(500, { message: "Failed to create template" });
      }
    }
  )

  // Update design template (Admin only)
  .patch(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().min(1, "Template ID is required")
      })
    ),
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(255).optional(),
        imageUrl: z.string().url().optional(),
        category: z.enum([
          "logo",
          "banner",
          "poster",
          "business-card",
          "flyer",
          "social-media",
          "brochure",
          "presentation",
          "invitation",
          "certificate"
        ]).optional(),
      })
    ),
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        const data = c.req.valid("json");

        // Check if template exists first
        const existingTemplate = await DesignTemplate.findById(id)
        if (!existingTemplate) {
          throw new HTTPException(404, {
            message: "Template not found"
          })
        }

        const template = await DesignTemplate.findByIdAndUpdate(
          id,
          data,
          { new: true, runValidators: true }
        );

        if (!template) {
          throw new HTTPException(404, { message: "Template not found" });
        }

        return c.json({
          success: true,
          data: template,
          message: "Template updated successfully"
        });
      } catch (error) {
        console.error("Error updating template:", error);
        throw new HTTPException(500, { message: "Failed to update template" });
      }
    }
  )

  // Delete design template (Admin only)
  .delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");

      const template = await DesignTemplate.findByIdAndDelete(id);
      if (!template) {
        throw new HTTPException(404, { message: "Template not found" });
      }

      return c.json({
        success: true,
        message: "Template deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      throw new HTTPException(500, { message: "Failed to delete template" });
    }
  })

  // Toggle template status (active/inactive)
  .patch("/:id/status", async (c) => {
    try {
      const id = c.req.param("id");

      const template = await DesignTemplate.findById(id);
      if (!template) {
        throw new HTTPException(404, { message: "Template not found" });
      }

      template.isActive = !template.isActive;
      await template.save();

      return c.json({
        success: true,
        data: template,
        message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error("Error toggling template status:", error);
      throw new HTTPException(500, { message: "Failed to toggle template status" });
    }
  })


export default app;
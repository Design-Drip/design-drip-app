import { DesignTemplate } from "@/models/design-template";
import { auth } from "@clerk/nextjs/server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = new Hono()
  // Get all design templates with filtering and pagination
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().optional().default(1),
        limit: z.coerce.number().optional().default(12),
        category: z.string().optional(),
        tags: z.string().optional(), // comma-separated tags
        search: z.string().optional(),
        sort: z.enum(["newest", "popular", "downloads", "rating"]).optional().default("newest"),
        is_active: z.coerce.boolean().optional(),
        featured: z.coerce.boolean().optional(),
      })
    ),
    async (c) => {
      try {

        const { page, limit, category, tags, search, sort, is_active, featured } = c.req.valid("query");
        const skip = (page - 1) * limit;

        // Build filter query
        const filter: any = {};

        // Only show active templates by default (unless explicitly specified)
        if (is_active !== undefined) {
          filter.is_active = is_active;
        } else {
          filter.is_active = true;
        }

        if (category && category !== 'all') {
          filter.category = category;
        }

        if (tags) {
          const tagArray = tags.split(",").map(tag => tag.trim());
          filter.tags = { $in: tagArray };
        }

        if (featured !== undefined) {
          filter.featured = featured;
        }

        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { tags: { $in: [new RegExp(search, "i")] } }
          ];
        }

        // Build sort query
        let sortQuery: any = {};
        switch (sort) {
          case "popular":
          case "downloads":
            sortQuery = { downloads: -1 };
            break;
          case "rating":
            sortQuery = { rating: -1 };
            break;
          default:
            sortQuery = { createdAt: -1 };
        }

        const [templates, total] = await Promise.all([
          DesignTemplate.find(filter)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate("created_by", "firstName lastName")
            .lean(),
          DesignTemplate.countDocuments(filter)
        ]);

        return c.json({
          success: true,
          data: templates,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
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
    zValidator(
      "json",
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
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
        const { userId } = await auth();
        if (!userId) {
          throw new HTTPException(401, { message: "Unauthorized" });
        }

        const data = c.req.valid("json");

        const template = await DesignTemplate.create({
          ...data,
          created_by: userId,
        });

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
      "json",
      z.object({
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
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
        tags: z.array(z.string()).max(10).optional(),
        price: z.number().min(0).max(9999.99).optional(),
        is_active: z.boolean().optional(),
        featured: z.boolean().optional(),
      })
    ),
    async (c) => {
      try {
        const { userId } = await auth();
        if (!userId) {
          throw new HTTPException(401, { message: "Unauthorized" });
        }

        const id = c.req.param("id");
        const data = c.req.valid("json");

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
      const { userId } = await auth();
      if (!userId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }

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

  // Increment download count when template is downloaded
  .post("/:id/download", async (c) => {
    try {
      const id = c.req.param("id");

      const template = await DesignTemplate.findByIdAndUpdate(
        id,
        { $inc: { downloads: 1 } },
        { new: true }
      );

      if (!template) {
        throw new HTTPException(404, { message: "Template not found" });
      }

      return c.json({
        success: true,
        message: "Download count updated"
      });
    } catch (error) {
      console.error("Error updating download count:", error);
      throw new HTTPException(500, { message: "Failed to update download count" });
    }
  })

  // Toggle template status (active/inactive)
  .patch("/:id/status", async (c) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }

      const id = c.req.param("id");

      const template = await DesignTemplate.findById(id);
      if (!template) {
        throw new HTTPException(404, { message: "Template not found" });
      }

      template.is_active = !template.is_active;
      await template.save();

      return c.json({
        success: true,
        data: template,
        message: `Template ${template.is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error("Error toggling template status:", error);
      throw new HTTPException(500, { message: "Failed to toggle template status" });
    }
  })

  // Get template categories with counts
  .get("/stats/categories", async (c) => {
    try {
      const stats = await DesignTemplate.aggregate([
        { $match: { is_active: true } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            total_downloads: { $sum: "$downloads" },
            avg_rating: { $avg: "$rating" }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return c.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("Error fetching category stats:", error);
      throw new HTTPException(500, { message: "Failed to fetch category stats" });
    }
  })

  // Get overall stats
  .get("/stats/overview", async (c) => {
    try {
      const [totalStats] = await DesignTemplate.aggregate([
        {
          $group: {
            _id: null,
            total_templates: { $sum: 1 },
            active_templates: {
              $sum: { $cond: ["$is_active", 1, 0] }
            },
            featured_templates: {
              $sum: { $cond: ["$featured", 1, 0] }
            },
            total_downloads: { $sum: "$downloads" },
            avg_rating: { $avg: "$rating" },
            total_revenue: { $sum: "$price" }
          }
        }
      ]);

      return c.json({
        success: true,
        data: totalStats || {
          total_templates: 0,
          active_templates: 0,
          featured_templates: 0,
          total_downloads: 0,
          avg_rating: 0,
          total_revenue: 0
        }
      });
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      throw new HTTPException(500, { message: "Failed to fetch overview stats" });
    }
  });

export default app;
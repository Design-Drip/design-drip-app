import { FIXED_SIZES } from "@/constants/size";
import { ProductSort } from "@/constants/sort";
import {
  Category,
  Shirt,
  ShirtColor,
  ShirtSizeVariant,
} from "@/models/product";
import { ProductsQueryOptions, ProductsSortOptions } from "@/types/request";
import { ListResponse } from "@/types/response";
import { auth } from "@clerk/nextjs/server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import mongoose from "mongoose";
import { z } from "zod";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        // Sort options
        sort: z.enum(ProductSort).optional(),
        // Filter options
        sizes: z
          .string()
          .array()
          .optional()
          .refine(
            (val) => !val || val.some((size) => FIXED_SIZES.includes(size)),
            {
              message: "Invalid size provided",
            }
          ),
        colors: z.string().array().optional(),
        minPrice: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        categories: z
          .string()
          .array()
          .optional()
          .refine(async (val) => {
            if (!val || val.length === 0) return true;
            const categoryIds = await Category.find({
              _id: { $in: val },
            });
            return categoryIds.length === val.length;
          }),
        isActive: z.boolean().optional(),
        search: z.string().trim().optional(),
      })
    ),
    async (c) => {
      const {
        page = 1,
        limit = 10,
        sort,
        sizes,
        colors,
        minPrice,
        maxPrice,
        categories,
        isActive,
        search,
      } = c.req.valid("query");

      let query: ProductsQueryOptions = {};
      let sortOptions: ProductsSortOptions = { createdAt: -1 }; // Default sort by newest

      // Apply sort options
      if (sort) {
        switch (sort) {
          case "newest":
            sortOptions = { createdAt: -1 };
            break;
          case "oldest":
            sortOptions = { createdAt: 1 };
            break;
          case "price_high":
            sortOptions = { base_price: -1 };
            break;
          case "price_low":
            sortOptions = { base_price: 1 };
            break;
        }
      }

      // Apply filter options
      if (sizes && sizes.length > 0) {
        query.sizes = sizes;
      }

      if (categories && categories.length > 0) {
        query.categories = categories.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
      }

      // Handle price range filter
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) {
          query.price.$gte = minPrice;
        }
        if (maxPrice) {
          query.price.$lte = maxPrice;
        }
      }

      // Handle color filter - requires a more complex join with ShirtColor
      let colorProductIds: mongoose.Types.ObjectId[] | undefined;
      if (colors && colors.length > 0) {
        const colorVariants = await ShirtColor.find({
          color: { $in: colors },
        }).distinct("shirt_id");

        if (colorVariants.length > 0) {
          colorProductIds = colorVariants;
        } else {
          return c.json({
            items: [],
            totalItems: 0,
            page,
            pageSize: limit,
          } as ListResponse);
        }
      }

      if ((await auth()).sessionClaims?.metadata?.role === "admin") {
        query.isActive = isActive;
      } else {
        query.isActive = true;
      }

      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      // If we have color filter results, add them to the query
      if (colorProductIds) {
        query._id = { $in: colorProductIds };
      }

      const skip = (page - 1) * limit;
      try {
        const [products, totalCount] = await Promise.all([
          Shirt.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .populate("categories")
            .lean(),
          Shirt.countDocuments(query),
        ]);

        return c.json({
          items: products,
          totalItems: totalCount,
          page,
          pageSize: limit,
        } as ListResponse);
      } catch (err) {
        console.error("Error fetching products:", err);
        throw new HTTPException(500, {
          message: "Failed to fetch products",
        });
      }
    }
  )
  .get("/categories", async (c) => {
    try {
      const categories = await Category.find({});

      const newCategories = categories.map((cat) => ({
        id: cat._id?.toString()!,
        name: cat.name,
      }));

      return c.json({ categories: newCategories });
    } catch (err) {
      console.error("Error fetching categories:", err);
      throw new HTTPException(500, {
        message: "Failed to fetch categories",
      });
    }
  })
  .get("/colors", async (c) => {
    try {
      const colors = await ShirtColor.distinct("color");

      const colorCounts = await Promise.all(
        colors.map(async (color) => {
          const count = await ShirtColor.countDocuments({ color });
          return {
            name: color,
            count,
          };
        })
      );

      return c.json({ colors: colorCounts });
    } catch (err) {
      console.error("Error fetching colors:", err);
      throw new HTTPException(500, {
        message: "Failed to fetch colors",
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
                message: "Invalid product ID",
              });
            }
            return true;
          }),
      })
    ),
    async (c) => {
      const id = c.req.valid("param").id;

      try {
        const product = await Shirt.findById(id)
          .populate("categories")
          .select([
            "name",
            "description",
            "base_price",
            "categories",
            "isActive",
          ]);

        if (
          !product ||
          ((await auth()).sessionClaims?.metadata?.role !== "admin" &&
            !product.isActive)
        ) {
          throw new HTTPException(404, {
            message: "Product not found",
          });
        }

        const colors = await ShirtColor.find({
          shirt_id: product._id,
        }).select(["color", "color_value", "images"]);

        const sizes = await ShirtSizeVariant.find({
          shirtColor: { $in: colors.map((color) => color._id) },
        }).select(["size", "additional_price"]);

        return c.json({
          product,
          sizes,
          colors,
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        throw new HTTPException(500, {
          message: "Failed to fetch product",
        });
      }
    }
  );

export default app;

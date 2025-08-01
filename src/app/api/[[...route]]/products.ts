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
import mongoose from "mongoose";
import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

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
        sizes: z.preprocess(
          (val) => {
            if (typeof val === "string") {
              return [val as string];
            }

            return val;
          },
          z
            .array(z.string())
            .optional()
            .refine(
              (val) => !val || val.some((size) => FIXED_SIZES.includes(size)),
              {
                message: "Invalid size provided",
              }
            )
        ),
        colors: z.preprocess((val) => {
          if (typeof val === "string") {
            return [val as string];
          }

          return val;
        }, z.array(z.string()).optional()),
        minPrice: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        categories: z.preprocess(
          (val) => {
            if (typeof val === "string") {
              return [val as string];
            }

            return val;
          },
          z
            .array(
              z
                .string()
                .trim()
                .refine((val) => {
                  if (!mongoose.isObjectIdOrHexString(val)) {
                    throw new HTTPException(400, {
                      message: "Invalid product ID",
                    });
                  }
                  return true;
                })
            )
            .optional()
        ),
        isActive: z.boolean().optional(),
        search: z.string().trim().optional(),
        productIds: z.preprocess(
          (val) => {
            if (typeof val === "string") {
              return [val as string];
            }

            return val;
          },
          z
            .array(
              z
                .string()
                .trim()
                .refine((val) => {
                  if (!mongoose.isObjectIdOrHexString(val)) {
                    throw new HTTPException(400, {
                      message: "Invalid product ID",
                    });
                  }
                  return true;
                })
            )
            .optional()
        ),
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
        productIds,
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
        query.base_price = {};
        if (minPrice) {
          query.base_price.$gte = minPrice;
        }
        if (maxPrice) {
          query.base_price.$lte = maxPrice;
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

      // Handle filtering by both colors and specific product IDs
      let productIdFilter: mongoose.Types.ObjectId[] | undefined;

      // If we have color filter results, prepare them
      if (colorProductIds && colorProductIds.length > 0) {
        productIdFilter = colorProductIds;
      }

      // If we have product IDs filter, apply it
      if (productIds && productIds.length > 0) {
        const productObjectIds = productIds.map(
          (id) => new mongoose.Types.ObjectId(id)
        );

        // If we already have color filters, find intersection
        if (productIdFilter) {
          // Find intersection of two ID arrays - products that match both conditions
          productIdFilter = productIdFilter.filter((colorId) =>
            productObjectIds.some(
              (prodId) => prodId.toString() === colorId.toString()
            )
          );

          // If intersection is empty, return empty results early
          if (productIdFilter.length === 0) {
            return c.json({
              items: [],
              totalItems: 0,
              page,
              pageSize: limit,
            } as ListResponse);
          }
        } else {
          // If no color filter, just use product IDs
          productIdFilter = productObjectIds;
        }
      }

      // Apply combined ID filter if any exists
      if (productIdFilter) {
        query._id = { $in: productIdFilter };
      }

      const skip = (page - 1) * limit;
      try {
        const results = [];

        const [products, totalCount] = await Promise.all([
          Shirt.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean()
            .select(["name", "base_price", "description"]),
          Shirt.countDocuments(query),
        ]);

        for (const product of products) {
          const colors = await ShirtColor.find({
            shirt_id: product._id,
          }).select(["color", "color_value", "images"]);

          const transformedColors = await Promise.all(colors.map(async (color) => {
            const primaryImage =
              color.images?.find((img) => img.is_primary) || color.images?.[0];

            const sizes = await ShirtSizeVariant.find({
              shirtColor: color._id,
            }).select(["shirtColor", "size"])

            return {
              id: color._id,
              color: color.color,
              color_value: color.color_value,
              image: primaryImage
                ? {
                  id: primaryImage._id,
                  url: primaryImage.url,
                  view_side: primaryImage.view_side,
                }
                : null,
              sizes: sizes || [],
            };
          }));

          results.push({
            ...product,
            colors: transformedColors,
          });
        }

        return c.json({
          items: results,
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
      // Fetch distinct color names and color values from ShirtColor
      const results = await ShirtColor.aggregate([
        {
          $group: {
            _id: "$color_value",
            color: { $first: "$color" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            color_value: "$_id",
            color: 1,
            count: 1,
          },
        },
      ]);

      return c.json({ colors: results } as {
        colors: { color_value: string; color: string; count: number }[];
      });
    } catch (err) {
      console.error("Error fetching colors:", err);
      throw new HTTPException(500, {
        message: "Failed to fetch colors",
      });
    }
  })
  .get(
    "/colors/:colorId/sizes",
    zValidator(
      "param",
      z.object({
        colorId: z
          .string()
          .trim()
          .refine((val) => {
            if (!mongoose.isObjectIdOrHexString(val)) {
              throw new HTTPException(400, {
                message: "Invalid color ID",
              });
            }
            return true;
          }),
      })
    ),
    async (c) => {
      const colorId = c.req.valid("param").colorId;

      try {
        const color = await ShirtColor.findById(colorId)
          .populate("shirt_id", "name base_price isActive categories")
          .select(["color", "color_value", "images"]);

        if (!color) {
          throw new HTTPException(404, {
            message: "Color not found",
          });
        }

        const sizes = await ShirtSizeVariant.find({
          shirtColor: color._id,
        }).select(["size", "additional_price", "quantity", "shirtColor"]);

        return c.json({
          color: {
            id: color._id,
            color: color.color,
            color_value: color.color_value,
            images: color.images,
          },
          sizes: sizes.map((size) => ({
            id: size._id,
            size: size.size,
            additional_price: size.additional_price,
            quantity: size.quantity,
          })),
        });
      } catch (err) {
        console.error("Error fetching color details:", err);
        throw new HTTPException(500, {
          message: "Failed to fetch color details",
        });
      }
    }
  )
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
        }).select(["size", "additional_price", "quantity", "shirtColor"]);

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
import { queryOptions } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { ProductsKeys } from "./keys";
import { useProductsQueryStore } from "../../store/useProductsQueryStore";
import { ProductDetailResponse } from "@/types/product";

// Get products based on filters and sort options
export const getProductsQuery = (productIds?: string[]) => {
  const {
    search,
    categories,
    sizes,
    colors,
    minPrice,
    maxPrice,
    sort,
    page,
    limit,
  } = useProductsQueryStore.getState();

  return queryOptions({
    queryKey: [
      ProductsKeys.GetProductsQuery,
      {
        search,
        categories,
        sizes,
        colors,
        minPrice,
        maxPrice,
        sort,
        page,
        limit,
        productIds,
      },
    ],
    queryFn: async ({ signal }) => {
      const response = await client.api.products.$get(
        {
          query: {
            search: search.length > 0 ? search : undefined,
            categories: categories.map((cat) => cat.id),
            sizes,
            colors,
            minPrice: minPrice?.toString(),
            maxPrice: maxPrice?.toString(),
            sort,
            page: page.toString(),
            limit: limit.toString(),
            productIds,
          },
        },
        {
          init: {
            signal,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      return response.json();
    },
  });
};

// Get all categories
export const getCategoriesQuery = () =>
  queryOptions({
    queryKey: [ProductsKeys.GetCategoriesQuery],
    queryFn: async () => {
      const response = await client.api.products.categories.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      return response.json();
    },
  });

// Get product colors
export const getColorsQuery = () =>
  queryOptions({
    queryKey: [ProductsKeys.GetColorsQuery],
    queryFn: async () => {
      const response = await client.api.products.colors.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch colors");
      }

      return response.json();
    },
  });

// Get product details by ID
export const getProductDetailQuery = (productId: string) =>
  queryOptions({
    queryKey: [ProductsKeys.GetProductDetailsQuery, productId],
    queryFn: async () => {
      const response = await client.api.products[":id"].$get({
        param: { id: productId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }

      return response.json() as Promise<ProductDetailResponse>;
    },
  });

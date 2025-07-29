import { queryOptions, skipToken } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { AdminRequestQuoteKeys } from "./keys";

export interface AdminRequestQuoteFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const getAdminRequestQuotesQuery = (filters: AdminRequestQuoteFilters = {}) =>
  queryOptions({
    queryKey: [AdminRequestQuoteKeys.GetRequestQuotes, filters],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams[key] = value.toString();
        }
      });

      const response = await client.api["request-quotes"].$get({
        query: queryParams,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch request quotes");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

export const getAdminRequestQuoteQuery = (id?: string) =>
  queryOptions({
    queryKey: [AdminRequestQuoteKeys.GetRequestQuote, id],
    queryFn: id
      ? async () => {
          const response = await client.api["request-quotes"][":id"].$get({
            param: { id },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch request quote");
          }

          return response.json();
        }
      : skipToken,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
import { queryOptions, skipToken } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { RequestQuoteKeys } from "./keys";

export const getRequestQuotesQuery = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const queryParams: Record<string, string> = {};

  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.status) queryParams.status = params.status;
  if (params?.type) queryParams.type = params.type;
  if (params?.search) queryParams.search = params.search;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  return queryOptions({
    queryKey: [RequestQuoteKeys.GetRequestQuotesQuery, params],
    queryFn: async () => {
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
};

export const getRequestQuoteQuery = (id?: string) =>
  queryOptions({
    queryKey: [RequestQuoteKeys.GetRequestQuoteQuery, id],
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
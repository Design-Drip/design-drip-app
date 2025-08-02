import { queryOptions, skipToken } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { PaymentsKeys } from "./keys";

export const getPaymentMethodsQuery = () =>
  queryOptions({
    queryKey: [PaymentsKeys.GetPaymentMethodsQuery],
    queryFn: async () => {
      const response = await client.api.payments["payment-methods"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }

      return response.json();
    },
  });

export const getCheckoutInfoQuery = (itemIds?: string) =>
  queryOptions({
    queryKey: [PaymentsKeys.GetCheckoutInfoQuery, itemIds],
    queryFn: itemIds
      ? async () => {
          const response = await client.api.payments.checkout.info.$get({
            query: { itemIds },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch checkout information");
          }

          return response.json();
        }
      : skipToken,
  });

export const getTransactionsQuery = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  email?: string;
}) =>
  queryOptions({
    queryKey: [PaymentsKeys.GetTransactionsQuery, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.status) searchParams.set("status", params.status);
      if (params?.startDate) searchParams.set("startDate", params.startDate);
      if (params?.endDate) searchParams.set("endDate", params.endDate);
      if (params?.minAmount)
        searchParams.set("minAmount", params.minAmount.toString());
      if (params?.maxAmount)
        searchParams.set("maxAmount", params.maxAmount.toString());
      if (params?.email) searchParams.set("email", params.email);

      const response = await client.api.payments.transactions.$get({
        query: Object.fromEntries(searchParams),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      return response.json();
    },
  });

export const getTransactionDetailQuery = (transactionId?: string) =>
  queryOptions({
    queryKey: [PaymentsKeys.GetTransactionDetailQuery, transactionId],
    queryFn: transactionId
      ? async () => {
          const response = await client.api.payments.transactions[":id"].$get({
            param: { id: transactionId },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch transaction details");
          }

          return response.json();
        }
      : skipToken,
  });

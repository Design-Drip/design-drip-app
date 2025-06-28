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

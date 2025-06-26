import { queryOptions } from "@tanstack/react-query";
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
    queryFn: async () => {
      let url = client.api.payments.checkout.info;
      if (itemIds) {
        url = url.$url({ query: { itemIds } });
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Failed to fetch checkout information");
      }

      return response.json();
    },
  });

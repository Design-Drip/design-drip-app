import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ISetDefaultPaymentMethodPayload,
  IAttachPaymentMethodPayload,
  IProcessCheckoutPayload,
} from "./types";
import { client } from "@/lib/hono";
import { getPaymentMethodsQuery, getCheckoutInfoQuery } from "../queries";

export const useSetDefaultPaymentMethodMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ISetDefaultPaymentMethodPayload) => {
      const response = await client.api.payments[
        "payment-methods"
      ].default.$post({ json: payload });

      if (!response.ok) {
        throw new Error("Failed to set default payment method");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getPaymentMethodsQuery().queryKey,
      });
    },
  });
};

export const useAttachPaymentMethodMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IAttachPaymentMethodPayload) => {
      const response = await client.api.payments[
        "payment-methods"
      ].attach.$post({ json: payload });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getPaymentMethodsQuery().queryKey,
      });
    },
  });
};

export const useDeletePaymentMethodMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await client.api.payments["payment-methods"][
        ":id"
      ].$delete({
        param: { id: paymentMethodId },
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getPaymentMethodsQuery().queryKey,
      });
    },
  });
};

export const useProcessCheckoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IProcessCheckoutPayload) => {
      const response = await client.api.payments.checkout.$post({
        json: payload,
      });

      if (!response.ok) {
        throw new Error("Failed to process checkout");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCheckoutInfoQuery().queryKey,
      });
    },
  });
};

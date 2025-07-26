import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { RequestQuoteKeys } from "../queries/keys";
import { CreateRequestQuotePayload, UpdateRequestQuotePayload } from "./types";
import { InferRequestType, InferResponseType } from "hono";

// Define types using Hono's type inference
type CreateRequestQuoteRequest = InferRequestType<typeof client.api["request-quotes"]["$post"]>["json"];
type CreateRequestQuoteResponse = InferResponseType<typeof client.api["request-quotes"]["$post"]>;

export const useCreateRequestQuoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateRequestQuoteResponse, Error, CreateRequestQuoteRequest>({
    mutationFn: async (payload: CreateRequestQuoteRequest) => {
      const response = await client.api["request-quotes"].$post({
        json: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit request quote");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate request quotes list for admin
      queryClient.invalidateQueries({
        queryKey: [RequestQuoteKeys.GetRequestQuotesQuery],
      });
    },
  });
};

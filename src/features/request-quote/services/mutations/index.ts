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

export const useSetPrimaryDesign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, designId }: { quoteId: string; designId: string }) => {
      const requestBody = { design_id: designId };
      
      const response = await fetch(`/api/request-quotes/${quoteId}/set-primary-design`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText };
        }
        throw new Error(error.message || "Failed to set primary design");
      }

      const responseData = await response.json();
      return responseData;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["my-assigned-quotes"] });
      queryClient.invalidateQueries({ queryKey: ["design"] });
    },
  });
};

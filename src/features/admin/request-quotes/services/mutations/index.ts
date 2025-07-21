import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { AdminRequestQuoteKeys } from "../queries/keys";
import { InferRequestType, InferResponseType } from "hono";

export interface UpdateRequestQuoteStatusPayload {
  id: string;
  status: "pending" | "reviewing" | "quoted" | "approved" | "rejected" | "completed";
  quotedPrice?: number;
  rejectionReason?: string;
  adminNotes?: string;
}

export const useUpdateRequestQuoteStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateRequestQuoteStatusPayload) => {
      const response = await client.api["request-quotes"][":id"].$patch({
        param: { id },
        json: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update request quote");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [AdminRequestQuoteKeys.GetAllRequestQuote],
      });
      queryClient.invalidateQueries({
        queryKey: [AdminRequestQuoteKeys.GetRequestQuoteDetail, id],
      });
    },
  });
};
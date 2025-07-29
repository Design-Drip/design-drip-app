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

export interface AdminResponseData {
    status: "reviewing" | "quoted" | "revised" | "rejected";
    quotedPrice?: number;
    responseMessage?: string;
    rejectionReason?: string;
    adminNotes?: string;
    priceBreakdown?: {
        basePrice?: number;
        setupFee?: number;
        designFee?: number;
        rushFee?: number;
        shippingCost?: number;
        tax?: number;
        totalPrice: number;
    };
    productionDetails?: {
        estimatedDays?: number;
        printingMethod?: "DTG" | "DTF" | "Screen Print" | "Vinyl" | "Embroidery";
        materialSpecs?: string;
        colorLimitations?: string;
    };
    validUntil?: string;
}

export interface RevisionData extends AdminResponseData {
    revisionReason: "customer_request" | "admin_improvement" | "cost_change" | "timeline_change" | "material_change";
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

// Create admin response
export function useCreateAdminResponse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ quoteId, responseData }: { quoteId: string; responseData: AdminResponseData }) => {
            const response = await fetch(`/api/request-quotes/${quoteId}/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(responseData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create response");
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            toast.success("Response created successfully!");
            queryClient.invalidateQueries({ 
                queryKey: ["request-quotes"] 
            });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create response");
        },
    });
}

// Create revision
export function useCreateRevision() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ quoteId, responseData }: { quoteId: string; responseData: RevisionData }) => {
            const response = await fetch(`/api/request-quotes/${quoteId}/revise`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(responseData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create revision");
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            toast.success("Revision created successfully!");
            queryClient.invalidateQueries({ 
                queryKey: ["request-quotes"] 
            });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create revision");
        },
    });
}
import { client } from "@/lib/hono";
import { useMutation } from "@tanstack/react-query";

export const useCreateFeedbackMutation = () => {
  return useMutation({
    mutationKey: ["createFeedback"],
    mutationFn: async (feedbackData: {
      orderId: string;
      rating: number;
      comment?: string;
    }) => {
      const response = await client.api.feedback.$post({
        json: feedbackData,
      });

      if (!response.ok) {
        throw new Error("Failed to create feedback");
      }

      return response.json();
    },
  });
};

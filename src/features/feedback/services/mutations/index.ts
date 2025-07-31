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
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to submit feedback. Please try again.";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
  });
};

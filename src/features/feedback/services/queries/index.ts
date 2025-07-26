import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const getFeedbackQuery = (productId: string) => {
  return useQuery({
    queryKey: ["feedback", productId],
    queryFn: async () => {
      const response = await client.api.feedback[":id"].$get({
        param: { id: productId },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }
      return response.json();
    },
  });
};

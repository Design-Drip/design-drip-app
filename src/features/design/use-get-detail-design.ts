import { client } from "@/lib/hono";
import { skipToken, useQuery } from "@tanstack/react-query";

export function useGetDetailDesign(designId?: string) {
  return useQuery({
    queryKey: ["design", designId],
    queryFn: async () => {
      const response = await client.api.design.$get({
        params: { id: designId },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch design details");
      }
      return response.json();
    },
    enabled: !!designId,
  });
}

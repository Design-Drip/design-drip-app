import { client } from "@/lib/hono";
import { skipToken, useQuery } from "@tanstack/react-query";

export function useGetDetailDesign(designId?: string) {
  return useQuery({
    queryKey: ["design", designId],
    queryFn: async () => {
      console.log("useGetDetailDesign - designId:", designId);
      const response = await client.api.design[":id"].$get({
        param: { id: designId || "" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch design details");
      }
      const data = await response.json();
      console.log("useGetDetailDesign - API response:", data);
      return data;
    },
    enabled: !!designId,
  });
}

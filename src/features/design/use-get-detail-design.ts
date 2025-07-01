import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export function useGetDetailDesign(designId: string) {
  return useQuery({
    queryKey: ["design", designId],
    queryFn: async () => {
      console.log("useGetDetailDesign - fetching design with ID:", designId);
      const response = await client.api.design[":id"].$get({
        param: { id: designId },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch design details");
      }
      const result = await response.json();
      console.log("useGetDetailDesign - response:", result);
      return result;
    },
    enabled: !!designId,
  });
}

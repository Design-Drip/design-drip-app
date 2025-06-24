import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export default function useGetDesign() {
  return useQuery({
    queryKey: ["design"],
    queryFn: async () => {
      const response = await client.api.design.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch design");
      }
      return response.json();
    },
  });
}

import { client } from "@/lib/hono";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

export const useDeleteDesign = () => {
  const mutation = useMutation({
    mutationFn: async (designId: string) => {
      const response = await client.api.design[":id"].$delete({
        param: { id: designId },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete design");
      }

      return data;
    },
  });

  return mutation;
};

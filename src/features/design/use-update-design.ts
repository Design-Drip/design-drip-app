import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define the type for the update design payload
type UpdateDesignPayload = {
  id: string; // The ID of the design to update
  shirt_color_id: string;
  element_design: Record<
    string,
    {
      images_id: string;
      element_Json: string;
    }
  >;
  name: string;
  design_images?: Record<string, string>;
};

export const useUpdateDesign = () => {
  return useMutation({
    mutationFn: async (data: UpdateDesignPayload) => {
      const { id, ...updateData } = data;

      
      // Use the path parameter for the ID and json for the body
      const response = await client.api.design[":id"].$put({
        param: { id },
        json: updateData,
      });

      // Check for success
      if (!response.ok) {
        throw new Error("Failed to update design details");
      }
      
      const result = await response.json();
      
      return result;
    },
  });
};

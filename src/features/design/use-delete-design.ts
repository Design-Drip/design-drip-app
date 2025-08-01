import { useMutation } from "@tanstack/react-query";

export const useDeleteDesign = () => {
  const mutation = useMutation({
    mutationFn: async (designId: string) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
      const response = await fetch(`${baseUrl}/api/design/${designId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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

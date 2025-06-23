import { useMutation, useQueryClient } from "@tanstack/react-query"
import { IDesignTemplatesPayload } from "./types";
import { client } from "@/lib/hono";
import { getDesignTemplates } from "../queries";

export const useCreateTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: IDesignTemplatesPayload) => {
            const response = await client.api["design-templates"].$post({ json: payload });
            if (!response.ok) {
                throw new Error("Failed to create template");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getDesignTemplates().queryKey,
            })
        }

    })
}
import { queryOptions, useQuery } from "@tanstack/react-query"
import { DesignTemplateKeys } from "./keys"
import { client } from "@/lib/hono"

export const getDesignTemplates = () =>
    queryOptions({
        queryKey: [DesignTemplateKeys.GetDesignTemplates],
        queryFn: async () => {
            const response = await client.api["design-templates"].$get();

            if (!response.ok) {
                throw new Error("Failed to fetch templates")
            }

            return response.json()
        }
    })


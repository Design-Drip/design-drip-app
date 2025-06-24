import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { IDesignTemplatesPayload, IUpdateActiveStatusDesignTemplate, IUpdateDesignTemplate } from "./types";
import { client } from "@/lib/hono";
import { getDesignTemplatesQuery } from "../queries";

const useCreateTemplate = () => {
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
                queryKey: getDesignTemplatesQuery().queryKey,
            })
        }

    })
}

const useUpdateTemplate = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: IUpdateDesignTemplate) => {
            const { designTemplateId, ...updateData } = payload
            const response = await client.api["design-templates"][":id"].$patch({
                param: { id: designTemplateId },
                json: updateData
            })

            if (!response.ok) {
                throw new Error('Failed to update template')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getDesignTemplatesQuery().queryKey,
            })
        }
    })
}

const useDeleteTemplate = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (designTemplateId: string) => {
            const response = await client.api["design-templates"][":id"].$delete({
                param: { id: designTemplateId }
            })

            if (!response.ok) {
                throw new Error('Failed to delete template')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getDesignTemplatesQuery().queryKey,
            })
        }
    })
}

const useUpdateActiveStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (designTemplateId: string) => {
            const response = await client.api["design-templates"][":id"]["status"].$patch({
                param: { id: designTemplateId }
            })

            if (!response.ok) {
                throw new Error('Failed to delete template')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getDesignTemplatesQuery().queryKey,
            })
        }
    })
}

export const designTemplate = { useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useUpdateActiveStatus }
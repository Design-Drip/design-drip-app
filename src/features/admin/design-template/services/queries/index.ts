import { queryOptions } from '@tanstack/react-query'
import { DesignTemplateKeys } from './keys'
import { client } from '@/lib/hono'

export interface DesignTemplateFiltersQuery {
    search?: string
    category?: string
    isActive?: boolean | 'all'
    page?: number
    limit?: number
}

export const getDesignTemplatesQuery = (filters: DesignTemplateFiltersQuery = {}) =>
    queryOptions({
        queryKey: [DesignTemplateKeys.GetDesignTemplates, filters],
        queryFn: async () => {
            const searchParams = new URLSearchParams()

            if (filters.search) {
                searchParams.append('search', filters.search)
            }
            if (filters.category && filters.category !== 'all') {
                searchParams.append('category', filters.category)
            }
            if (filters.isActive !== undefined && filters.isActive !== 'all') {
                searchParams.append('isActive', filters.isActive.toString())
            }
            if (filters.page) {
                searchParams.append('page', filters.page.toString())
            }
            if (filters.limit) {
                searchParams.append('limit', filters.limit.toString())
            }

            const response = await client.api["design-templates"].$get({
                query: Object.fromEntries(searchParams)
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch templates: ${response.status}`)
            }

            return response.json()
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
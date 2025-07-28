"use server"
import prisma from "@comend/lib/prisma"
import { filterColumns } from "@/packages/lib/filter-columns"
import { FiltersType } from "@/state/search/requestSearchStore"
import {unstable_cache} from "@comend/lib/unstable-cache"
import { nanoid } from "nanoid"
import { Organization } from "@prisma/client"
import { withOrganizationAuth } from "@/packages/lib/auth"

interface GetRequestsInput {
    searchTerm: string
    filters: FiltersType
    sortBy?: string
    page?: number
    perPage?: number
}

const sortByMap: Record<string, any> = {
    "recently-updated": {updatedAt: "desc"},
    "newest-created": {createdAt: "desc"},
    "oldest-created": {createdAt: "asc"},
}

export const getRequests = withOrganizationAuth(
    async (
        organization: Organization, 
        input: GetRequestsInput
    ) => {
        return unstable_cache(
            async () => {
                try {
                    const page = input.page ?? 1
                    const perPage = input.perPage ?? 10
                    const offset = (page - 1) * perPage

                    const filters: any[] = []

                    if (input.searchTerm) {
                        filters.push({
                            id: "title",
                            value: input.searchTerm,
                            operator: "iLike",
                            variant: "text",
                            filterId: nanoid(),
                        })
                    }

                    if (input.filters.statuses.length > 0) {
                        filters.push({
                            id: "status",
                            value: input.filters.statuses.map(s => s.value),
                            operator: "inArray",
                            variant: "multiSelect",
                            filterId: nanoid(),
                        })
                    }

                    if (input.filters.types.length > 0) {
                        filters.push({
                            id: "type",
                            value: input.filters.types.map(t => t.value),
                            operator: "inArray",
                            variant: "multiSelect",
                            filterId: nanoid(),
                        })
                    }

                    const where = filterColumns({filters, joinOperator: "and"})

                    const [data, total] = await prisma.$transaction([
                        prisma.materialAndDataAccessRequest.findMany({
                            where: {
                                ...where,
                                organizationId: organization.id
                            },
                            skip: offset,
                            take: perPage,
                            orderBy: input.sortBy ? sortByMap[input.sortBy] : {createdAt: "desc"},
                        }),
                        prisma.materialAndDataAccessRequest.count({where}),
                    ])

                    return {
                        data,
                        total,
                    }
                } catch (err) {
                    console.error("getRequests error", err)
                    return {data: [], total: 0}
                }
            },
            [JSON.stringify(input)],
            {revalidate: 1, tags: ["requests"]},
        )()
    }
)
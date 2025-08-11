"use server"

import prisma from "@comend/lib/prisma"
import {withResearcherAuth} from "@/packages/lib/auth";
import {Organization, Tool} from "@prisma/client";
import {unstable_cache} from "@comend/lib/unstable-cache"
import {filterColumns} from "@comend/lib/filter-columns"
import {nanoid} from "nanoid"
import { RequestFiltersType } from "@/packages/lib/types";

export const getAllBiosamples = withResearcherAuth(
    async (organization: Organization): Promise<{data: Tool[], pageCount: number}> => {
        try {
            const data = await prisma.tool.findMany({
                include: {
                    organization: {include: {conditions: {include: {condition: true}}}},
                    milestones: { include: { milestone: true } },
                    contacts: true,
                    attachments: true,
                    gene: true,
                    institution: true,
                    // biosample: { include: { donor: true, institution: true } },
                },
                orderBy: { createdAt: 'asc' },
            });

            return {data, pageCount: 5}
        } catch {
            return {data: [], pageCount: 5};
        }
    }
);

"use server"

import prisma from "@comend/lib/prisma"
import {withResearcherAuth} from "@/packages/lib/auth";
import {Organization, Tool} from "@prisma/client";

export const getAllBiosamples = withResearcherAuth(
    async (_: Organization): Promise<{data: Tool[], pageCount: number}> => {
        try {
            const data = await prisma.tool.findMany({
                include: {
                    organization: {include: {conditions: {include: {condition: true}}}},
                    milestones: { include: { milestone: true } },
                    contacts: true,
                    attachments: true,
                    gene: true,
                    institution: true,
                    company: true,
                    createFacilityRequests: true,
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

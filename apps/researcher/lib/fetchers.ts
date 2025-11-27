"use server"

import prisma from "@comend/lib/prisma"
import {Organization, type Prisma, Tool} from "@prisma/client";
import {withResearcherAuth, getSession, withUserAuth} from "~researcher/lib/auth";
import {InternalArgs} from "@prisma/client/runtime/library";
import {logError} from "@comend/lib/utils";

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

export const getResearcherFromUserId = withUserAuth(
    async (
        userId: string,
        select: Prisma.ResearcherSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        const session = await getSession();

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            const fetchedResearcher = await prisma.researcher.findUnique({
                where: {userId: session.user.id},
                select
            })

            if (!fetchedResearcher) {
                return {success: false, error: "Researcher not found"};
            }

            return {
                success: true,
                data: fetchedResearcher
            };
        } catch (error: any) {
            logError("Error fetching researcher", error);
            return {success: false, error: error};
        }
    }
)

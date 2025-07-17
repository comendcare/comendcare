import prisma from "@comend/lib/prisma"
import {withResearcherAuth} from "@/packages/lib/auth";
import {Organization, Tool} from "@prisma/client";

export const getAllBiosamples = withResearcherAuth(
    async (organization: Organization): Promise<Tool[]> => {
        try {
            const toolTypes = await prisma.toolType.findMany({
                where: { type: 'biosample' },
            });

            const data = await prisma.tool.findMany({
                where: {
                    types: { hasSome: toolTypes.map(type => type.id) },
                    organizationId: organization.id,
                },
                include: {
                    milestones: { include: { milestone: true } },
                    contacts: true,
                    attachments: true,
                    biosample: { include: { donor: true, institution: true } },
                },
                orderBy: { createdAt: 'asc' },
            });

            return data;
        } catch {
            return [];
        }
    }
);

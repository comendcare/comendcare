"use server"

import {getSession, withAuth, withResearcherAuth} from "@comend/lib/auth";
import prisma from "@comend/lib/prisma";
import {logError} from "@comend/lib/utils";


export const deleteResearcher = withResearcherAuth(
    async (researcherId: string | null, text: string) => {
        const session = await getSession()

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            if (!researcherId) {
                return {success: false, error: "Request ID not provided."};
            }

            const researcher = prisma.researcher.delete({
                where: {
                    id: researcherId
                }
            })

            if (!researcher) {
                return {success: false, error: "failed to delete researcher"};
            }

            return {success: true, data: researcher};
        } catch (error: any) {
            logError("Error deleting researcher", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

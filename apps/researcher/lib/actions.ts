"use server"

import {getSession, withAuth, withResearcherAuth} from "@/packages/lib/auth";
import prisma from "@/packages/lib/prisma";
import {logError} from "@/packages/lib/utils";

export const createComment = withAuth(
    async (requestId: string | null, text: string) => {
        const session = await getSession()

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            if (!requestId) {
                return {success: false, error: "Request ID not provided."};
            }

            const comment = prisma.comment.create({
                data: {
                    materialAndDataAccessRequest: {
                        connect: {
                            id: requestId
                        }
                    },
                    author: {
                        connect: {
                            id: session?.user.id
                        }
                    },
                    text: text
                }
            })

            if (!comment) {
                return {success: false, error: "failed to create comment"};
            }

            return {success: true, data: comment};
        } catch (error: any) {
            logError("Error creating comment", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

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

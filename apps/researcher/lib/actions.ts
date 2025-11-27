"use server"

import {getSession, withResearcherAuth} from "@comend/lib/auth";
import prisma from "@comend/lib/prisma";
import {logError} from "@comend/lib/utils";
import {deleteTypeSenseDocument} from "@comend/lib/utils";

export const deleteResearcher = withResearcherAuth(
    async (researcherId: string | null, text: string) => {
        const session = await getSession();

        try {
            if (!session?.user?.id) {
                return {success: false, error: "Session not found."};
            }

            if (!researcherId) {
                return {success: false, error: "Researcher ID not provided."};
            }

            // Get researcher + linked user
            const researcher = await prisma.researcher.findUnique({
                where: {id: researcherId},
                select: {id: true, userId: true},
            });

            if (!researcher) {
                return {success: false, error: "Researcher not found."};
            }

            // Optional: enforce only owner can delete themselves
            if (researcher.userId !== session.user.id) {
                return {success: false, error: "Not authorized to delete this researcher."};
            }

            // Delete Typesense doc (index name: adjust if you use something else)
            const typesenseDelete = deleteTypeSenseDocument(
                `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                (
                    process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
                    process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                        ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                        : process.env.TYPESENSE_ADMIN_API_KEY
                )!,
                researcher.id,
                "researchers"
            );

            // Delete the User; Prisma FK is on Researcher.userId with onDelete: Cascade,
            // so this will also delete the Researcher row.
            const userDelete = prisma.user.delete({
                where: {id: researcher.userId},
            });

            const [deletedUser] = await Promise.all([
                userDelete,
                typesenseDelete,
            ]);

            return {success: true, data: deletedUser};
        } catch (error: any) {
            logError("Error deleting researcher", error);
            return {success: false, error: "Internal server error"};
        }
    }
);

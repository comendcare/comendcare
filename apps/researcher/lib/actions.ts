"use server"

import prisma from "@comend/lib/prisma";
import {deleteTypeSenseDocument, logError} from "@comend/lib/utils";
import {withResearcherAuth} from "~researcher/lib/auth";
import {getSession, withAuth} from "@comend/lib/auth";
import type {Researcher} from "@prisma/client";

export const deleteResearcher = withResearcherAuth(
    async (researcher: Researcher, text: string) => {
        const session = await getSession();

        try {
            if (!session?.user?.id) {
                return {success: false, error: "Session not found."};
            }

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
            return {success: false, error: error};
        }
    }
);
export const updateResearcher = withAuth(
    async (_id: unknown, formData: FormData) => {
        const session = await getSession();
        if (!session?.user.id) {
            return {error: "Not authenticated"};
        }

        try {
            const researcher = await prisma.researcher.findUnique({
                where: {userId: session.user.id},
                select: {id: true},
            });

            if (!researcher) return {error: "Researcher not found"};

            const researcherData: Record<string, any> = {};
            const userData: Record<string, any> = {};

            // 👇 make this a normal string[] + flag
            let affiliationIds: string[] = [];
            let hasAffiliationsField = false;

            formData.forEach((value, key) => {
                const str = value.toString().trim();

                // ARRAY FIELDS ON RESEARCHER
                if (
                    key === "researchInterests" ||
                    key === "therapeuticsOfInterest" ||
                    key === "conditionsOfInterest" ||
                    key === "genesOfInterest"
                ) {
                    researcherData[key] = str ? str.split(",") : [];
                    return;
                }

                // AFFILIATIONS (institution IDs)
                if (key === "affiliations") {
                    hasAffiliationsField = true;
                    affiliationIds = str ? str.split(",") : [];
                    return;
                }

                // USER FIELDS
                if (key === "name") {
                    userData.name = str === "" ? null : str;
                    return;
                }

                if (key === "notificationSettings" || key === "consentSettings") {
                    if (str === "") return; // don't touch if not sent
                    userData[key] = str === "true";
                    return;
                }

                // EVERYTHING ELSE → RESEARCHER SCALARS
                // (title, country, website, description, orcid, etc.)
                researcherData[key] = str === "" ? null : str;
            });

            // Handle affiliations via junction table
            if (hasAffiliationsField) {
                await prisma.affiliation.deleteMany({
                    where: {researcherId: researcher.id},
                });

                if (affiliationIds.length > 0) {
                    const existing = await prisma.institution.findMany({
                        where: {id: {in: affiliationIds}},
                        select: {id: true},
                    });

                    if (existing.length) {
                        await prisma.affiliation.createMany({
                            data: existing.map((inst) => ({
                                researcherId: researcher.id,
                                institutionId: inst.id,
                            })),
                        });
                    }
                }
            }

            // Update user if needed
            if (Object.keys(userData).length > 0) {
                await prisma.user.update({
                    where: {id: session.user.id},
                    data: userData,
                });
            }

            // Update researcher
            const response = await prisma.researcher.update({
                where: {userId: session.user.id},
                data: {
                    ...researcherData,
                    researchInterests: {
                        set: Array.isArray(researcherData.researchInterests)
                            ? researcherData.researchInterests
                            : [],
                    },
                    therapeuticsOfInterest: {
                        set: Array.isArray(researcherData.therapeuticsOfInterest)
                            ? researcherData.therapeuticsOfInterest
                            : [],
                    },
                    genesOfInterest: {
                        set: Array.isArray(researcherData.genesOfInterest)
                            ? researcherData.genesOfInterest
                            : [],
                    },
                    conditionsOfInterest: {
                        set: Array.isArray(researcherData.conditionsOfInterest)
                            ? researcherData.conditionsOfInterest
                            : [],
                    },
                },
            });

            return response;
        } catch (error: any) {
            console.error(error);
            return {error: error.message};
        }
    }
);

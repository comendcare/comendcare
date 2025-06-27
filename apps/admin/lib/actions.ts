"use server"

import prisma from "@comend/lib/prisma"
import {Company} from "@prisma/client"
import {revalidatePath, revalidateTag} from "next/cache"
import {withAdminAuth} from "./auth"
import {getSession} from "@comend/lib/auth"
import {addTypeSenseDocument, deleteTypeSenseDocument, updateTypeSenseDocument} from "@comend/lib/utils";
import {getCategoriesAndMilestones} from "@comend/lib/utils"

export const getSessionInfo = async () => {
    const session = await getSession()
    return session
}

export const addEmailToWhitelist = withAdminAuth(
    async (email: string) => {
        try {
            // Check if the user has already provided feedback for this review
            // Otherwise, create new feedback
            const response = await prisma.whitelist.create({
                data: {
                    email: email
                },
            });

            revalidatePath("/admin/users/whitelist")

            return {success: true, data: response};
        } catch (error: any) {
            console.error("Error adding email to whitelist:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)

export const addEmailToBlacklist = withAdminAuth(
    async (email: string) => {
        try {
            // Check if the user has already provided feedback for this review
            // Otherwise, create new feedback
            const response = await prisma.blacklist.create({
                data: {
                    email: email
                },
            });

            revalidatePath("/admin/users/blacklist")

            return {success: true, data: response};
        } catch (error: any) {
            console.error("Error adding email to blacklist:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)

export const removeEmailFromWhitelist = withAdminAuth(
    async (email: string) => {
        try {
            // Check if the user has already provided feedback for this review
            // Otherwise, create new feedback
            const response = await prisma.whitelist.delete({
                where: {
                    email: email
                }
            });

            revalidatePath("/admin/users/whitelist")

            return {success: true, data: response};
        } catch (error: any) {
            console.error("Error removing email to whitelist:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)

export const removeEmailFromBlacklist = withAdminAuth(
    async (email: string) => {
        try {
            // Check if the user has already provided feedback for this review
            // Otherwise, create new feedback
            const response = await prisma.blacklist.delete({
                where: {
                    email: email
                }
            });

            revalidatePath("/admin/users/blacklist")

            return {success: true, data: response};
        } catch (error: any) {
            console.error("Error removing email to blacklist:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)

export const createCompany = withAdminAuth(
    async (formData: FormData) => {
        const title = formData.get("orgName") as string
        const description = formData.get("description") as string
        const yearEstablished = parseInt(formData.get("founded") as string)
        const headquarters = formData.get("headquarters") as string
        const companyType = formData.get("type") as string
        const url = formData.get("website") as string
        const servicesRaw = formData.get("services") as string
        const certificationsRaw = formData.get("certifications") as string
        const tagsRaw = formData.get("tags") as string

        const parsedServices = servicesRaw
            ? servicesRaw.split(",").map((name) => name.trim())
            : []
        const parsedCertifications = certificationsRaw
            ? certificationsRaw.split(",").map((name) => name.trim())
            : []
        const parsedTags = tagsRaw
            ? tagsRaw.split(",").map((name) => name.trim())
            : []

        const {categories, milestoneTypes} = getCategoriesAndMilestones(parsedServices)

        try {
            const company = await prisma.company.create({
                data: {
                    title,
                    description,
                    yearEstablished: isNaN(yearEstablished) ? null : yearEstablished,
                    companyType,
                    headquarters,
                    url,
                    services: parsedServices.length
                        ? {
                            connectOrCreate: parsedServices.map((name) => ({
                                where: {name},
                                create: {name},
                            })),
                        }
                        : undefined,
                    certifications: parsedCertifications.length
                        ? {
                            connectOrCreate: parsedCertifications.map((name) => ({
                                where: {name},
                                create: {name},
                            })),
                        }
                        : undefined,
                    simplifiedCertifications: parsedCertifications,
                    tags: parsedTags,
                    categories,
                    milestoneTypes,
                },
                include: {services: true},
            })

            await addTypeSenseDocument(
                `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                    ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY!
                    : process.env.TYPESENSE_ADMIN_API_KEY!,
                company,
                "companies"
            )

            await revalidateTag(`${company.id}-company-metadata`)

            return {success: true, data: company}
        } catch (error: any) {
            console.error("Error creating company:", error)
            return {success: false, error: "Database error. Please try again later."}
        }
    }
)

export const updateCompany = withAdminAuth(
        async (companyId: string, formData: FormData) => {
            const title = formData.get("orgName") as string;
            const description = formData.get("description") as string;
            const yearEstablished = parseInt(formData.get("founded") as string);
            const headquarters = formData.get("headquarters") as string;
            const companyType = formData.get("type") as string;
            const url = formData.get("website") as string;
            const servicesRaw = formData.get("services") as string;
            const certificationsRaw = formData.get("certifications") as string;
            const tagsRaw = formData.get("tags") as string;

            const parsedCertifications = certificationsRaw ? JSON.parse(certificationsRaw) : [];
            const parsedTags = tagsRaw ? JSON.parse(tagsRaw) : [];
            const parsedServices = servicesRaw ? JSON.parse(servicesRaw) : [];

            const {categories, milestoneTypes} = getCategoriesAndMilestones(parsedServices);

            try {
                const company = await prisma.company.update({
                    where: {id: companyId},
                    data: {
                        title,
                        description,
                        yearEstablished: isNaN(yearEstablished) ? null : yearEstablished,
                        headquarters,
                        companyType,
                        url,
                        simplifiedCertifications: parsedCertifications,
                        tags: parsedTags,
                        categories,
                        milestoneTypes,
                        services: {
                            set: [],
                            connectOrCreate: parsedServices.map((name: string) => ({
                                where: {name},
                                create: {name},
                            })),
                        },
                        certifications: {
                            set: [],
                            connectOrCreate: parsedCertifications.map((name: string) => ({
                                where: {name},
                                create: {name},
                            })),
                        },
                    },
                });

                await updateTypeSenseDocument(
                    `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                    (
                        process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                            ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                            : process.env.TYPESENSE_ADMIN_API_KEY
                    )!,
                    company,
                    'companies'
                )

                await revalidateTag(`${company.id}-company-metadata`);
                revalidatePath("/admin/companies/database")

                return {success: true, data: company};
            } catch
                (error) {
                console.error("Error updating company:", error);
                return {success: false, error: "Failed to update company."};
            }
        }
)

export const deleteCompany = withAdminAuth(
    async (company: Company) => {
        try {
            const deletedCompany = prisma.company.delete({
                where: {id: company.id},
            });

            const deleteTypeSense = deleteTypeSenseDocument(
                `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                (
                    process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                        ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                        : process.env.TYPESENSE_ADMIN_API_KEY
                )!,
                company.id,
                'companies'
            );

            // Run both deletions concurrently
            const [response] = await Promise.all([deletedCompany, deleteTypeSense])

            if (!response) {
                console.error("Error deleting company.")
                return {success: false, error: "Database error. please try again later."}
            }

            return {success: true, data: response}
        } catch (error: any) {
            console.error("Error deleting company:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

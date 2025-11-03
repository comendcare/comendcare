"use server"

import prisma from "@comend/lib/prisma"
import type {Company} from "@prisma/client"
import {revalidatePath, revalidateTag} from "next/cache"
import {withAdminAuth} from "./auth"
import {getSession} from "@/packages/lib/auth"
import {addTypeSenseDocument, deleteTypeSenseDocument, updateTypeSenseDocument} from "@comend/lib/utils";
import {getCategoriesAndMilestones} from "@comend/lib/utils"
import { JsonValue } from "@prisma/client/runtime/library"
import {writeRawEvent} from "@comend/lib/raw-events";

export const getSessionInfo = async () => {
    const session = await getSession()
    return session
}

export const deleteFacilityCreateRequest = withAdminAuth(
    async (id: string) => {
        try {
            const deletedRequest = await prisma.createFacilityRequest.delete({
                where: {id}
            })

            revalidatePath(`/admin/companies/creation-requests`)

            return {success: true, data: deletedRequest}
        } catch (error: any) {
            console.error("Error deleting facility create request: ", error)
            return {success: false, error: "Database error. Please try again later."}
        }
    }
)

export const addEmailToWhitelist = withAdminAuth(
    async (email: string) => {
        try {
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
        const session = await getSession()

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

            await writeRawEvent({
                provider: "app",
                eventType: "service_provider_created",
                externalId: company.id,
                occurredAt: new Date(),
                payload: {
                    companyId: company.id,
                    title: company.title,
                    url: company.url ?? undefined,
                    companyType: company.companyType ?? undefined,
                    categories: company.categories ?? [],
                    milestoneTypes: company.milestoneTypes ?? [],
                    services: (company.services || []).map((s) => s.name),
                    certifications: company.simplifiedCertifications ?? [],
                    tags: company.tags ?? [],
                    headquarters: company.headquarters ?? undefined,
                    yearEstablished: company.yearEstablished ?? null,
                    userId: session?.user.id,
                    userName: session?.user.name,
                },
            });

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

export const updateOrganization = withAdminAuth(
    async (orgId: string, formData: FormData) => {
        // Convert FormData to a plain object
        const data: Record<string, any> = {};

        formData.forEach((value, key) => {
            // Attempt to parse numbers

            if (!isNaN(Number(value)) && value !== "") {
                data[key] = Number(value);
            } else {
                data[key] = value;
            }

            if (key === "yearFounded") {
                data[key] = value.toString();
            }

            if ((key === "image" || key === "headerImage") && !value) {
                // remove image
                data[key] = null
            }

            if (key === "therapeuticsInDevelopment") {
                data[key] = value.toString().split(",");
            }

            if (key === "therapeuticsOfInterest") {
                data[key] = value.toString().split(",");
            }

            if (key === "metadata") {
                data[key] = JSON.parse(value.toString()) as JsonValue
            }

        });

        try {
            const response = await prisma.organization.update({
                where: {
                    id: orgId,
                },
                data,
            });

            if (response.verified && response.published) {
                await updateTypeSenseDocument(
                    `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                    (
                        process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                            ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                            : process.env.TYPESENSE_ADMIN_API_KEY
                    )!,
                    response,
                    'organizations'
                );
            }

            return response;
        } catch (error: any) {
            console.error("Error updating organization:", error.message);
            throw new Error(error.message || "Failed to update organization.");
        }
    }
);

export const removeProviderContactRequest = withAdminAuth(
    async (id: string) => {
        try {
            const response = await prisma.companyContactRequest.delete({
                where: {
                    id: id
                }
            });

            revalidatePath("/admin/users/contact-requests")

            return {success: true, data: response};
        } catch (error: any) {
            console.error("Error removing provider contact request:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)


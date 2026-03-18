"use server"

import prisma from "@comend/lib/prisma"
import type {Company, Organization, Researcher} from "@prisma/client"
import {revalidatePath, revalidateTag} from "next/cache"
import {withAdminAuth} from "./auth"
import {getSession} from "@comend/lib/auth"
import {addTypeSenseDocument, deleteTypeSenseDocument, logError, updateTypeSenseDocument} from "@comend/lib/utils";
import {getCategoriesAndMilestones} from "@comend/lib/utils"
import { JsonValue } from "@prisma/client/runtime/library"
import {writeRawEvent} from "@comend/lib/raw-events";
import z from "zod"
import { companyFormSchema, institutionFormSchema } from "./types"
import { ApiResponse } from "@comend/lib/types"
import { validateEmailDomain } from "@comend/lib/server-utils"
import { sendInviteEmail } from "@comend/lib/emails"
import { customerIOTrack } from "../../../packages/lib/customerio/customer-io-track"

export const getSessionInfo = async () => {
    const session = await getSession()
    return session
}

export const revokeClaimInvitation = withAdminAuth(
    async (email: string): Promise<ApiResponse<any>> => {
        try {
            // const claimInvitation = await prisma.claimOrganizationInvitation({
            //     where: {email}
            // })

            // if (!claimInvitation) {
            //     throw new Error("Claim organization invitation not found")
            // }

            // const lowerCaseEmail = claimInvitation.email.toLowerCase()
            const lowerCaseEmail = email.toLowerCase()

            // 1. remove user email from whitelist
            await prisma.whitelist.delete({
                where: {email: lowerCaseEmail},
            })

            const deletedClaimInvitation = await prisma.claimOrganizationInvitation.deleteMany({
                where: {email}
            }).then((res) => {
                return res
            })

            if (!deletedClaimInvitation) {
                console.error("Error deleting claim invitation.")
                return {success: false, error: "Database error. please try again later."}
            }

            revalidatePath("/app/team")
            revalidatePath("/app/profile")

            return {success: true, data: deletedClaimInvitation}

        } catch (error) {
            console.error("Error revoking claim organization invitation:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const createClaimInvitation = withAdminAuth(
    async (
        organization: Organization,
        email: string,
        role: string = "owner",
        ip: string,
    ): Promise<ApiResponse<any>> => {
        const session = await getSession();

        try {
            if (!session) {
                return {success: false, error: "You must be signed in to perform this action"}
            }

            const lowerCaseEmail = email.toLowerCase()

            const isDomainValid = await validateEmailDomain(lowerCaseEmail);
            if (!isDomainValid) {
                return {success: false, error: "Email domain is invalid or cannot receive emails."};
            }

            // Check if the user is already a member of the organization
            const existingMember = await prisma.member.findFirst({
                where: {
                    email: lowerCaseEmail,
                    organizationId: organization.id
                }
            });

            if (existingMember) {
                return {success: false, error: "User is already a member of this organization."}
            }

            // Check if an invitation has already been sent to this email for the same organization
            const existingInvitation = await prisma.claimOrganizationInvitation.findFirst({
                where: {
                    email: lowerCaseEmail,
                    organizationId: organization.id
                }
            });

            if (existingInvitation) {
                return {success: false, error: "A claim invitation has already been sent to this email."}
            }

            // 1. Create claim invitiation ----------------------------------------------------------------------
            const claimInvitation = await prisma.claimOrganizationInvitation.create({
                data: {
                    email: lowerCaseEmail,
                    role: role,
                    organizationId: organization.id
                }
            }).then((res) => {
                return res
            })

            // await customerIOTrack({
            //     userId: session.user.id,
            //     event: 'claim_organization_invitation_sent',
            //     timestamp: new Date(),
            //     // Keep org / invite-specific data on the EVENT, not person traits (users can have multiple invites)
            //     properties: {
            //         invitation_id: claimInvitation.id,
            //         organization_id: organization.id,
            //         organization_name: organization.name,
            //         invitee_email: lowerCaseEmail,
            //         role: role,
            //         inviter_user_id: session.user.id,
            //     },
            // });

            // 2. whitelist user email so they can join and claim their organiztion -----------------------------
            // Upsert so that if it already is whitelisted, nothing changes, and if not, they are whitelisted
            await prisma.whitelist.upsert({
                where: {email: lowerCaseEmail},
                update: {}, // No fields to update
                create: {email: lowerCaseEmail},
            }); 

            // const inviter = await prisma.user.findUnique({
            //     where: {id: session?.user.id}
            // })

            // await sendInviteEmail(
            //     {
            //         invitee: {
            //             name: "",
            //             email: email,
            //             image: ""
            //         },
            //         inviter: {
            //             name: inviter?.name || session?.user.name,
            //             email: inviter?.email || session?.user.email,
            //             image: inviter?.image || session?.user.image,
            //             organizationName: organization.name || undefined,
            //             organizationImage: organization.image || undefined,
            //             ip: ip,
            //         },
            //         inviteLink: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`
            //     }
            // ).then(() => {
            //     console.log("email sent")
            // })

            if (!claimInvitation) {
                console.error("Error inviting user to claim.")
                return {success: false, error: "Error inviting user to claim."}
            }

            revalidatePath("/app/team")
            revalidatePath("/app/profile")
            revalidatePath(`/admin/organization/${organization.id}/members`)

            return {success: true, data: claimInvitation}

        } catch (error) {
            console.error("Error inviting user to claim organization:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const deleteResearcherOnly = withAdminAuth(
    async (researcher: Researcher, text: string) => {
        const session = await getSession();

        try {
            if (!session?.user?.id) return {success: false, error: "Session not found."}
            if (!researcher) return {success: false, error: "Researcher not found."}

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

            const researcherDelete = prisma.researcher.delete({
                where: {id: researcher.id}
            })

            const [deleteResearcher] = await Promise.all([
                researcherDelete,
                typesenseDelete
            ])

            return {success: true, data: deleteResearcher};
        } catch (error: any) {
            logError("Error deleting researcher", error);
            return {success: false, error: error};
        }
    }
);

export const deleteResearcherAndUser = withAdminAuth(
    async (researcher: Researcher, text: string) => {
        const session = await getSession();

        try {
            if (!session?.user?.id) return {success: false, error: "Session not found."}
            if (!researcher) return {success: false, error: "Researcher not found."}

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

// Invite user function with updated Organization model
export const inviteUser = withAdminAuth(
    async (
        organization: Organization,
        email: string,
        role: string = "member",
        ip: string,
    ): Promise<ApiResponse<any>> => {
        const session = await getSession();

        try {
            if (!session) {
                throw new Error("You must be signed in to perform this action")
            }

            const lowerCaseEmail = email.toLowerCase()

            const isDomainValid = await validateEmailDomain(lowerCaseEmail);
            if (!isDomainValid) {
                return {success: false, error: "Email domain is invalid or cannot receive emails."};
            }

            // Check if the user is already a member of the organization
            const existingMember = await prisma.member.findFirst({
                where: {
                    email: lowerCaseEmail,
                    organizationId: organization.id
                }
            });

            if (existingMember) {
                return {success: false, error: "User is already a member of this organization."}
            }

            // Check if an invitation has already been sent to this email for the same organization
            const existingInvitation = await prisma.invitation.findFirst({
                where: {
                    email: lowerCaseEmail,
                    organizationId: organization.id
                }
            });

            if (existingInvitation) {
                return {success: false, error: "An invitation has already been sent to this email."}
            }

            const invitation = await prisma.invitation.create({
                data: {
                    email: lowerCaseEmail,
                    role: role,
                    organizationId: organization.id
                }
            }).then((res) => {
                return res
            })

            // Upsert so that if it already is whitelisted, nothing changes, and if not, they are whitelisted
            await prisma.whitelist.upsert({
                where: {email: lowerCaseEmail},
                update: {}, // No fields to update
                create: {email: lowerCaseEmail},
            });

            const inviter = await prisma.user.findUnique({
                where: {id: session?.user.id}
            })

            await sendInviteEmail(
                {
                    invitee: {
                        name: "",
                        email: email,
                        image: ""
                    },
                    inviter: {
                        name: inviter?.name || session?.user.name,
                        email: inviter?.email || session?.user.email,
                        image: inviter?.image || session?.user.image,
                        organizationName: organization.name || undefined,
                        organizationImage: organization.image || undefined,
                        ip: ip,
                    },
                    inviteLink: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`
                }
            ).then(() => {
                console.log("email sent")
            })

            if (!invitation) {
                console.error("Error inviting user.")
                return {success: false, error: "Database error. please try again later."}
            }

            revalidatePath("/app/team")
            revalidatePath("/app/profile")

            return {success: true, data: invitation}
        } catch (error: any) {
            console.error("Error inviting user:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

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

export const addEmailToEmailCapture = withAdminAuth(
    async (email: string) => {
        try {
            const response = await prisma.emailCapture.create({
                data: {
                    email: email
                },
            });

            revalidatePath("/admin/users/email-capture")

            return {success: true, data: response};
        } catch (error: any) {
            console.error("Error adding email to email capture list:", error);
            return {success: false, error: "Database error. Please try again later."};
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

export const removeEmailFromEmailCapture = withAdminAuth(
    async (email: string) => {
        try {
            const response = await prisma.emailCapture.delete({
                where: {
                    email: email
                }
            });

            revalidatePath("/admin/users/email-capture")

            return {success: true, data: response};
        } catch (error: any) {
            console.error("Error removing email from email capture list:", error);
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
            console.error("Error removing email from whitelist:", error);
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
            console.error("Error removing email from blacklist:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)

export const createInstitution = withAdminAuth(
    async (formData: z.infer<typeof institutionFormSchema>) => {
        const name = formData.name as string
        const milestones = formData.milestones
        const biosamples = formData.tools?.filter(tool => tool.type === "Biosamples")
        const diseaseModels = formData.tools?.filter(tool => tool.type === "Disease models")
        const clinicalDatasets = formData.tools?.filter(tool => tool.type === "Clinical datasets")

        try {
            const institution = await prisma.institution.create({
                data: {
                    name,
                    ...(milestones && milestones.length > 0 && ({
                        milestones: {
                            create: milestones.map(milestoneOption => ({
                                milestone: {connect: {id: milestoneOption.value}}
                            }))
                        }
                    })),
                    ...(biosamples && biosamples.length > 0 && ({
                        biosamples: {connect: biosamples.map(b => ({id: b.value}))}
                    })),
                    ...(diseaseModels && diseaseModels.length > 0 && ({
                        diseaseModel: {connect: diseaseModels.map(d => ({id: d.value}))}
                    })),
                    ...(clinicalDatasets && clinicalDatasets.length > 0 && ({
                        tool: {connect: clinicalDatasets.map(c => ({id: c.value}))}
                    }))
                },
            })

            await writeRawEvent({
                provider: "app",
                eventType: "institution_created",
                externalId: institution.id,
                occurredAt: new Date(),
                payload: {
                    companyId: institution.id,
                    name: institution.name,
                },
            });

            // await addTypeSenseDocument(
            //     `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
            //     process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
            //         ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY!
            //         : process.env.TYPESENSE_ADMIN_API_KEY!,
            //     company,
            //     "companies"
            // )

            await revalidateTag(`${institution.id}-institution-metadata`)

            return {success: true, data: institution}
        } catch (error) {
            console.error("Error creating institution:", error)
            return {success: false, error: "Database error. Please try again later."}   
        }
    }
)

export const createCompany = withAdminAuth(
    async (formData: z.infer<typeof companyFormSchema>) => {
        const session = await getSession()

        const title = formData.name as string
        const description = formData.description as string
        const yearEstablished = parseInt(formData.yearFounded as string)
        const headquarters = formData.headquarters as string
        const companyType = formData.type as string
        const url = formData.website as string
        const servicesRaw = (formData.services?.map((service) => service.label).join(",") || "") as string
        const certificationsRaw = (formData.certifications?.map((cert) => cert.label).join(",") || "") as string
        const tagsRaw = (formData.tags?.map((tag) => tag.label).join(",") || "") as string
        const milestones = formData.milestones
        const biosamples = formData.tools?.filter(tool => tool.type === "Biosamples")
        const diseaseModels = formData.tools?.filter(tool => tool.type === "Disease models")
        const clinicalDatasets = formData.tools?.filter(tool => tool.type === "Clinical datasets")

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

        console.log(`milestones`, milestones)

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
                    ...(milestones && milestones.length > 0 && ({
                        milestones: {
                            create: milestones.map(milestoneOption => ({
                                milestone: {connect: {id: milestoneOption.value}}
                            }))
                        }
                    })),
                    ...(biosamples && biosamples.length > 0 && ({
                        biosamples: {connect: biosamples.map(b => ({id: b.value}))}
                    })),
                    ...(diseaseModels && diseaseModels.length > 0 && ({
                        diseaseModel: {connect: diseaseModels.map(d => ({id: d.value}))}
                    })),
                    ...(clinicalDatasets && clinicalDatasets.length > 0 && ({
                        tool: {connect: clinicalDatasets.map(c => ({id: c.value}))}
                    }))
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
        async (companyId: string, formData: z.infer<typeof companyFormSchema>) => {
            const title = formData.name as string;
            const description = formData.description as string;
            const yearEstablished = parseInt(formData.yearFounded as string);
            const headquarters = formData.headquarters as string;
            const companyType = formData.type as string;
            const url = formData.website as string;
            const servicesRaw = (formData.services?.map((service) => service.label).join(",") || "") as string
            const certificationsRaw = (formData.certifications?.map((cert) => cert.label).join(",") || "") as string
            const tagsRaw = (formData.tags?.map((tag) => tag.label).join(",") || "") as string
            const biosamples = formData.tools?.filter(tool => tool.type === "Biosamples")
            const diseaseModels = formData.tools?.filter(tool => tool.type === "Disease models")
            const clinicalDatasets = formData.tools?.filter(tool => tool.type === "Clinical datasets")

            const parsedServices = servicesRaw
                ? servicesRaw.split(",").map((name) => name.trim())
                : []
            const parsedCertifications = certificationsRaw
                ? certificationsRaw.split(",").map((name) => name.trim())
                : []
            const parsedTags = tagsRaw
                ? tagsRaw.split(",").map((name) => name.trim())
                : []

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
                        ...(biosamples && biosamples.length > 0 && ({
                            biosamples: {connect: biosamples.map(b => ({id: b.value}))}
                        })),
                        ...(diseaseModels && diseaseModels.length > 0 && ({
                            diseaseModel: {connect: diseaseModels.map(d => ({id: d.value}))}
                        })),
                        ...(clinicalDatasets && clinicalDatasets.length > 0 && ({
                            tool: {connect: clinicalDatasets.map(c => ({id: c.value}))}
                        }))
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


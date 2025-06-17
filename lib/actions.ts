"use server"

import prisma from "@/lib/prisma"
import {
    Roadmap,
    Organization,
    Prisma,
    Kanban,
    Post,
    User,
    Condition,
    TaskStakeholder, Invitation,
    PlatformNotification,
    Review,
    SavedCompany, Company, MemberRequest
} from "@prisma/client"
import {revalidatePath, revalidateTag} from "next/cache"
import {withAdminAuth, withAuth, withOrganizationAuth, withUserAuth} from "./auth"
import {getSession} from "@/lib/auth"
import {addDomainToVercel, removeDomainFromVercelProject, validDomainRegex,} from "@/lib/domains";
import {put} from "@vercel/blob";
import {customAlphabet} from "nanoid";
import {
    addTypeSenseDocument,
    deleteTypeSenseDocument,
    getBlurDataURL,
    logError,
    sleep,
    toKebabCase,
    updateTypeSenseDocument
} from "@/lib/utils";
import {validateEmailDomain} from "@/lib/server-utils";
import {Session} from "next-auth";
import {
    sendInviteEmail,
    sendMemberRequestCreatedEmail,
    sendMemberRequestApprovedEmail,
    sendNewOrganizationEmail,
    sendMemberRequestDeniedEmail,
    sendMemberDeletedEmail,
} from "@/lib/emails";
import {getKanbanFromOrganizationId} from "./fetchers"
import {ApiResponse, Asset, DEFAULT_KANBAN_COLUMNS, MemberRequestWithUser, Milestone, RFP} from "@/lib/types";
import {includes} from "lodash"
import {templateResearchPlans} from "./templates"
import {getCategoriesAndMilestones} from "@/lib/utils"
import {JsonObject, JsonValue} from "@prisma/client/runtime/library"
import { organizations } from "@/data/sample-pags"

export const getSessionInfo = async () => {
    const session = await getSession()
    return session
}

export type Node = Prisma.NodeGetPayload<{}>

export type Edge = Prisma.EdgeGetPayload<{}>

export type Column = Prisma.ColumnGetPayload<{
    // include: { tasks: true }
}>

export type Task = Prisma.TaskGetPayload<{
    include: { checklist: true, stakeholders: { include: { user: true } } },
}>

const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    7
) // 7-character random string

export const createMemberRequest = withAuth(
    async (organizationId: string): Promise<ApiResponse<any>> => {
        const session = await getSession()
        if (!session?.user.id) {
            throw new Error("You must be signed in to perform this action")
        }

        try {
            // Check if a member request already exists
            const existingRequest = await prisma.memberRequest.findUnique({
                where: {
                    userId_organizationId: {
                        userId: session.user.id,
                        organizationId: organizationId,
                    }
                }
            });

            if (existingRequest) {
                return {success: false, error: "You have already sent a request to join this organization."};
            }

            const memberRequest = await prisma.memberRequest.create({
                data: {
                    email: session.user.email,
                    role: "member",
                    user: {
                        connect: {
                            id: session.user.id
                        }
                    },
                    organization: {
                        connect: {
                            id: organizationId
                        }
                    }
                },
                include: {user: true}
            })

            const organization = await prisma.organization.findUnique({
                where: {
                    id: organizationId
                },
                include: {
                    user: true,
                    members: {
                        where: {role: 'owner'},
                        include: {user: true}
                    }
                }
            })

            if (organization) {
                await sendMemberRequestCreatedEmail(
                    {
                        user: {
                            name: memberRequest.user.name || session.user.name,
                            email: memberRequest.user.email || session.user.email,
                            image: memberRequest.user.image || session.user.image,
                        },
                        owners: organization.members.map(member => ({
                            name: member.user?.name,
                            email: member.user?.email,
                        })),
                        organizationName: organization.name || "",
                        organizationImage: organization.image || "",
                    }
                ).then(() => {
                    console.log("email sent")
                })
            }

            if (!memberRequest) {
                console.error("Error creating member request.")
                return {success: false, error: "Database error. please try again later."}
            }

            return {success: true, data: memberRequest}
        } catch (error: any) {
            console.error("Error creating member request:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const createCondition = withAuth(
    async (formData: FormData) => {
        const session = await getSession();
        if (!session?.user.id) {
            return {
                error: "Not authenticated"
            };
        }

        const name = formData.get("name") as string;
        const summary = formData.get("summary") as string;
        const slug = toKebabCase(name);
        const diseaseCategories = formData.get("diseaseCategories")
            ? (formData.get("diseaseCategories") as string).split(",")
            : [];
        const prevalenceNumerator = formData.get("prevalenceNumerator")
            ? parseInt(formData.get("prevalenceNumerator") as string, 10)
            : null;
        const prevalenceDenominator = formData.get("prevalenceDenominator")
            ? parseInt(formData.get("prevalenceDenominator") as string, 10)
            : null;
        const numberOfPatientsEngaged = formData.get("numberOfPatientsEngaged")
            ? parseInt(formData.get("numberOfPatientsEngaged") as string, 10)
            : null;
        const nationalEstimatedPopulation = formData.get("nationalEstimatedPopulation")
            ? parseInt(formData.get("nationalEstimatedPopulation") as string, 10)
            : null;
        const globalEstimatedPopulation = formData.get("globalEstimatedPopulation")
            ? parseInt(formData.get("globalEstimatedPopulation") as string, 10)
            : null;
        const relevantDiseaseMechanisms = formData.get("relevantDiseaseMechanisms")
            ? (formData.get("relevantDiseaseMechanisms") as string).split(",")
            : [];
        const causalGenes = formData.get("causalGenes")
            ? (formData.get("causalGenes") as string).split(",")
            : [];
        const associatedGenes = formData.get("associatedGenes")
            ? (formData.get("associatedGenes") as string).split(",")
            : [];
        const associatedSystems = formData.get("associatedSystems")
            ? (formData.get("associatedSystems") as string).split(",")
            : [];
        const associatedSignsAndSymptoms = formData.get("associatedSignsAndSymptoms")
            ? (formData.get("associatedSignsAndSymptoms") as string).split(",")
            : [];
        const existingDatabasesAndStudies = formData.get("existingDatabasesAndStudies")
            ? (formData.get("existingDatabasesAndStudies") as string).split(",")
            : [];
        const toolsUnderDevelopment = formData.get("toolsUnderDevelopment")
            ? (formData.get("toolsUnderDevelopment") as string).split(",")
            : [];
        const metadataValue: FormDataEntryValue | null  = formData.get("metadata")
        const metadata: JsonObject = metadataValue
            ? JSON.parse(metadataValue.toString()) as JsonObject
            : {}

        try {
            const condition = await prisma.condition.create({
                data: {
                    name,
                    summary,
                    slug,
                    diseaseCategories,
                    prevalenceNumerator,
                    prevalenceDenominator,
                    numberOfPatientsEngaged,
                    nationalEstimatedPopulation,
                    globalEstimatedPopulation,
                    relevantDiseaseMechanisms,
                    causalGenes,
                    associatedGenes,
                    associatedSystems,
                    associatedSignsAndSymptoms,
                    existingDatabasesAndStudies,
                    toolsUnderDevelopment,
                    metadata
                }
            });

            if (!condition) {
                console.error("Error creating condition.");
                return {success: false, error: "Database error. Please try again later."};
            }

            return {success: true, data: condition};
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    return {success: false, error: "A condition with this name already exists."};
                }
            }

            console.error("Error creating condition:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)

export const connectOrganizationToCondition = withAuth(
    async (organizationId: string | null | undefined, conditionId: string) => {
        const session = await getSession();
        if (!session?.user?.id) {
            return {
                error: "Not authenticated",
            };
        }

        if (!organizationId) {
            return {
                error: "No organization Id",
            };
        }

        try {
            const conditionOrganization = await prisma.conditionToOrganization.create({
                data: {
                    conditionId: conditionId, // Specify the condition ID
                    organizationId: organizationId, // Specify the organization ID
                },
            });

            if (!conditionOrganization) {
                console.error("Error creating condition connection to organization.")
                return {success: false, error: "Database error. please try again later."}
            }

            return {success: true, data: conditionOrganization}
        } catch (error: any) {
            console.error("Error creating condition connection to organization:", error)
            return {
                success: false,
                error: error.message || "An error occurred while connecting the organization to the condition"
            }
        }
    }
)

export const createOrganization = withAuth(
    async (formData: FormData) => {
        const session = await getSession()
        if (!session?.user.id) {
            return {
                error: "Not authenticated"
            }
        }

        const name = formData.get("orgName") as string;
        const description = formData.get("description") as string;
        const subdomain = formData.get("subdomain") as string;
        const website = formData.get("website") as string | null;
        const contactEmail = formData.get("contactEmail") as string | null;
        const title = formData.get("title") as string | null;
        const founded = formData.get("founded") as string | null;
        const incorporationStatus = formData.get("incorporationStatus") as "YES" | "NO" | "INPROGRESS" | null;
        const address1 = formData.get("address1") as string | null;
        const address2 = formData.get("address2") as string | null;
        const formattedAddress = formData.get("formattedAddress") as string | null;
        const city = formData.get("city") as string | null;
        const region = formData.get("region") as string | null;
        const postalCode = formData.get("postalCode") as string | null;
        const country = formData.get("country") as string | null;
        const lat = formData.get("lat") as string | null;
        const lng = formData.get("lng") as string | null;
        const image = formData.get("image") as string | null;
        const therapeuticsInDevelopment = formData.get("therapeuticsInDevelopment")
            ? (formData.get("therapeuticsInDevelopment") as string).split(",")
            : [];
        const therapeuticsOfInterest = formData.get("therapeuticsOfInterest")
            ? (formData.get("therapeuticsOfInterest") as string).split(",")
            : [];
        const metadataValue: FormDataEntryValue | null = formData.get("metadata")
        const metadata: JsonObject = metadataValue
            ? JSON.parse(metadataValue.toString()) as JsonObject
            : {}

        try {
            const organization = await prisma.organization.upsert({
                where: {
                    subdomain,
                },
                update: {
                    name,
                    description,
                    subdomain,
                    yearFounded: founded?.toString(),
                    contactEmail,
                    website,
                    incorporationStatus,
                    therapeuticsInDevelopment,
                    therapeuticsOfInterest,
                    address1,
                    address2,
                    formattedAddress,
                    city,
                    region,
                    postalCode,
                    country,
                    lat,
                    lng,
                    image,
                    verified: true,  // Default verified to true for beta testing
                    metadata
                },
                create: {
                    name,
                    description,
                    subdomain,
                    yearFounded: founded?.toString(),
                    contactEmail,
                    website,
                    incorporationStatus,
                    therapeuticsInDevelopment,
                    therapeuticsOfInterest,
                    address1,
                    address2,
                    formattedAddress,
                    city,
                    region,
                    postalCode,
                    country,
                    lat,
                    lng,
                    image,
                    user: {
                        connect: {
                            id: session.user.id,
                        },
                    },
                    verified: true,  // Default verified to true for beta testing
                    metadata
                },
            });

            const membership = await prisma.member.create({
                data: {
                    userId: session.user.id,
                    email: session.user.email,
                    role: "owner", // Creator of organization is owner by default
                    title: title,
                    organizationId: organization.id
                }
            })

            if (organization.verified && organization.published) {
                await addTypeSenseDocument(
                    `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                    (
                        process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                            ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                            : process.env.TYPESENSE_ADMIN_API_KEY
                    )!,
                    organization,
                    'organizations'
                );
            }

            await revalidateTag(
                `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
            )

            await sendNewOrganizationEmail(
                {
                    user: {
                        name: session.user.name,
                        email: session.user.email
                    },
                    organization: {
                        name: organization.name,
                        subdomain: organization.subdomain
                    }
                }
            ).then(() => {
                console.log("email sent")
            })

            return {organization, membership};
        } catch (error: any) {
            if (error.code === "P2002") {
                const target = error.meta?.target?.[0];

                switch (target) {
                    case "subdomain":
                        return { error: "This subdomain is already taken" };
                    case "customDomain":
                        return { error: "This custom domain is already taken" };
                    default:
                        return { error: `Unique constraint failed on ${target}` };
                }
            } else {
                return {
                    error: error.message
                }
            }
        }
    }
)

export const toggleBiopharmaConsentSettings = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            // const organization = await prisma.organization.findUnique({
            //     where: {
            //         id: organizationId,
            //     }
            // })
            const newConsent = !organization?.biopharmaConsentSettings

            if (organization) {
                const updatedOrganization = await prisma.organization.update({
                    where: {
                        id: organization.id
                    },
                    data: {
                        biopharmaConsentSettings: newConsent
                    }
                })

                if (newConsent) {
                    await addTypeSenseDocument(
                        `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                        (
                            process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                                ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                                : process.env.TYPESENSE_ADMIN_API_KEY
                        )!,
                        {
                            id: organization.id,
                            name: organization.name,
                            description: organization.description,
                            biopharmaConsentSettings: newConsent,
                            subdomain: organization.subdomain,
                        },
                        'organizations'
                    );
                } else {
                    await deleteTypeSenseDocument(
                        `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                        (
                            process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                                ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                                : process.env.TYPESENSE_ADMIN_API_KEY
                        )!,
                        organization.id,
                        'organizations'
                    );
                }

                console.log("Toggled biopharma consent settings for organization", organization.id)
                await revalidateTag(
                    `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
                )

                return updatedOrganization
            }
        } catch (error: any) {
            return {
                error: error.message
            }
        }
    }
)

export const toggleOrganizationPublished = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            // const organization = await prisma.organization.findUnique({
            //     where: {
            //         id: organizationId,
            //     }
            // })
            const newPublished = !organization?.published

            if (organization) {
                // Toggle the 'published' attribute
                const updatedOrganization = await prisma.organization.update({
                    where: {
                        id: organization.id
                    },
                    data: {
                        published: newPublished
                    }
                })

                // if the org is being published, don't change milestone types
                // if the org is being unpublished, change all the org's milestones to private
                if (!newPublished) {
                    const updatedMilestones = await prisma.milestone.updateMany({
                        where: {organizationId: organization.id},
                        data: {
                            private: true
                        }
                    })
                }

                if (newPublished) {
                    await addTypeSenseDocument(
                        `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                        (
                            process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                                ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                                : process.env.TYPESENSE_ADMIN_API_KEY
                        )!,
                        {
                            id: organization.id,
                            name: organization.name,
                            description: organization.description,
                            published: newPublished,
                            subdomain: organization.subdomain,
                        },
                        'organizations'
                    );
                } else {
                    // Delete from TypeSense
                    await deleteTypeSenseDocument(
                        `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                        (
                            process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                                ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                                : process.env.TYPESENSE_ADMIN_API_KEY
                        )!,
                        organization.id,
                        'organizations'
                    );
                }

                // Log or revalidate if necessary
                await revalidateTag(
                    `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
                )

                return updatedOrganization
            }
        } catch (error: any) {
            return {
                error: error.message
            }
        }
    }
)

export const toggleOrganizationVerified = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            // const organization = await prisma.organization.findUnique({
            //     where: {
            //         id: organizationId,
            //     }
            // })

            if (organization) {
                // Toggle the 'verified' attribute
                const updatedOrganization = await prisma.organization.update({
                    where: {
                        id: organization.id
                    },
                    data: {
                        verified: !organization.verified
                    }
                })

                // Log or revalidate if necessary
                await revalidateTag(
                    `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
                )

                return updatedOrganization
            }
        } catch (error: any) {
            return {
                error: error.message
            }
        }
    }
)

export const updateOrganization = withOrganizationAuth(
    async (organization: Organization, formData: FormData) => {
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
                    id: organization.id,
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

export const adminUpdateOrganizationAttribute = withAdminAuth(
    async (formData: FormData, organization: Organization, key: string) => {
        const value = formData.get(key) as string

        try {
            let response

            if (key === "customDomain") {
                if (value.includes("vercel.pub")) {
                    return {
                        error: "Cannot use vercel.pub subdomain as your custom domain"
                    }

                    // if the custom domain is valid, we need to add it to Vercel
                } else if (validDomainRegex.test(value)) {
                    response = await prisma.organization.update({
                        where: {
                            id: organization.id
                        },
                        data: {
                            customDomain: value
                        }
                    })
                    await Promise.all([
                        addDomainToVercel(value)
                        // Optional: add www subdomain as well and redirect to apex domain
                        // addDomainToVercel(`www.${value}`),
                    ])

                    // empty value means the user wants to remove the custom domain
                } else if (value === "") {
                    response = await prisma.organization.update({
                        where: {
                            id: organization.id
                        },
                        data: {
                            customDomain: null
                        }
                    })
                }

                // if the organization had a different customDomain before, we need to remove it from Vercel
                if (
                    organization.customDomain &&
                    organization.customDomain !== value
                ) {
                    response = await removeDomainFromVercelProject(
                        organization.customDomain
                    )

                    /* Optional: remove domain from Vercel team

                    // first, we need to check if the apex domain is being used by other organization
                    const apexDomain = getApexDomain(`https://${organization.customDomain}`);
                    const domainCount = await prisma.organization.count({
                      where: {
                        OR: [
                          {
                            customDomain: apexDomain,
                          },
                          {
                            customDomain: {
                              endsWith: `.${apexDomain}`,
                            },
                          },
                        ],
                      },
                    });

                    // if the apex domain is being used by other organization
                    // we should only remove it from our Vercel project
                    if (domainCount >= 1) {
                      await removeDomainFromVercelProject(organization.customDomain);
                    } else {
                      // this is the only organization using this apex domain
                      // so we can remove it entirely from our Vercel team
                      await removeDomainFromVercelTeam(
                        organization.customDomain
                      );
                    }

                    */
                }
            } else if (key === "image" || key === "logo") {
                if (!process.env.BLOB_READ_WRITE_TOKEN) {
                    return {
                        error: "Missing BLOB_READ_WRITE_TOKEN token. Note: Vercel Blob is currently in beta – please fill out this form for access: https://tally.so/r/nPDMNd"
                    }
                }

                const file = formData.get(key) as File
                const filename = `${nanoid()}.${file.type.split("/")[1]}`

                const {url} = await put(filename, file, {
                    access: "public"
                })

                const blurhash =
                    key === "image" ? await getBlurDataURL(url) : null

                response = await prisma.organization.update({
                    where: {
                        id: organization.id
                    },
                    data: {
                        [key]: url,
                        ...(blurhash && {imageBlurhash: blurhash})
                    }
                })
            }

            // console.log(
            //     "Updated organization data! Revalidating tags: ",
            //     `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
            //     `${organization.customDomain}-metadata`
            // )
            await revalidateTag(
                `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
            )
            organization.customDomain &&
            (await revalidateTag(`${organization.customDomain}-metadata`))

            return response
        } catch (error: any) {
            if (error.code === "P2002") {
                return {
                    error: `This ${key} is already taken`
                }
            } else {
                return {
                    error: error.message
                }
            }
        }
    }
)

export const deleteOrganization = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const deleteOrganization = prisma.organization.delete({
                where: {id: organization.id},
            });

            // For now, delete the condition too when organization is deleted
            const deleteConditions = prisma.condition.deleteMany({
                where: {
                    organizations: {
                        some: {
                            id: organization.id
                        }
                    }
                }
            });

            const deleteTypeSense = deleteTypeSenseDocument(
                `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                (
                    process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                        ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                        : process.env.TYPESENSE_ADMIN_API_KEY
                )!,
                organization.id,
                'organizations'
            );

            // Run both deletions concurrently
            const [response] = await Promise.all([deleteOrganization, deleteConditions, deleteTypeSense])

            await revalidateTag(
                `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
            )
            response.customDomain &&
            (await revalidateTag(`${organization.customDomain}-metadata`))

            if (!response) {
                console.error("Error deleting organization.")
                return {success: false, error: "Database error. please try again later."}
            }

            return {success: true, data: response}
        } catch (error: any) {
            console.error("Error deleting organization:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    },
    ['owner']
)

// creating a separate function for this because we're not using FormData
export const updateRoadmap = withOrganizationAuth(
    async (organizationId: string, data: Partial<Roadmap>) => {
        const session = await getSession()
        if (!session?.user.id) {
            return {
                error: "Not authenticated"
            }
        }
        const roadmap = await prisma.roadmap.findUnique({
            where: {
                id: data.id
            },
            include: {
                nodes: {
                    include: {data: true},
                    orderBy: [{createdAt: "desc"}]
                },
                milestones: {
                    include: {
                        node: true,
                        contacts: true,
                        attachments: true,
                        types: {include: {milestoneType: true}},
                        tools: {include: {tool: true}},
                        rfps: {include: {rfp: true}}
                    },
                    orderBy: [{createdAt: "desc"}]
                },
                edges: true,
                organization: true
            }
        })

        if (!roadmap) return {error: "Roadmap not found"}

        try {
            const response = await prisma.roadmap.update({
                where: {
                    id: data.id
                },
                data: {
                    title: data.title,
                    description: data.description,
                    content: data.content,
                    modalities: data.modalities,
                    ...(data.metadata ? {metadata: data.metadata} : undefined)
                }
            })

            await revalidateTag(
                `${roadmap.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-roadmap`
            )
            await revalidateTag(
                `${roadmap.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${roadmap.slug}`
            )

            // if the organization has a custom domain, we need to revalidate those tags too
            roadmap.organization?.customDomain &&
            (await revalidateTag(
                `${roadmap.organization?.customDomain}-roadmaps`
            ),
                await revalidateTag(
                    `${roadmap.organization?.customDomain}-${roadmap.slug}`
                ))

            return response
        } catch (error: any) {
            return {
                error: error.message
            }
        }
    }
)

export const updateRoadmapMetadata = withOrganizationAuth(
    async (
        _: Organization,
        formData: FormData,
        roadmap: Roadmap & {
            organization: Organization
        },
        key: string
    ) => {
        const value = formData.get(key) as string

        try {
            let response
            if (key === "image") {
                const file = formData.get("image") as File
                const filename = `${nanoid()}.${file.type.split("/")[1]}`

                const {url} = await put(filename, file, {
                    access: "public"
                })

                const blurhash = await getBlurDataURL(url)

                response = await prisma.roadmap.update({
                    where: {
                        id: roadmap.id
                    },
                    data: {
                        image: url,
                        // imageBlurhash: blurhash
                    }
                })
            } else {
                response = await prisma.roadmap.update({
                    where: {
                        id: roadmap.id
                    },
                    data: {
                        [key]: key === "published" ? value === "true" : value
                    }
                })
            }

            await revalidateTag(
                `${roadmap.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-roadmaps`
            )
            await revalidateTag(
                `${roadmap.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${roadmap.slug}`
            )

            // if the organization has a custom domain, we need to revalidate those tags too
            roadmap.organization?.customDomain &&
            (await revalidateTag(
                `${roadmap.organization?.customDomain}-roadmaps`
            ),
                await revalidateTag(
                    `${roadmap.organization?.customDomain}-${roadmap.slug}`
                ))

            return response
        } catch (error: any) {
            if (error.code === "P2002") {
                return {
                    error: `This slug is already in use`
                }
            } else {
                return {
                    error: error.message
                }
            }
        }
    }
)

export const deleteRoadmap = withOrganizationAuth(
    async (_: Organization, roadmap: Roadmap) => {
        try {
            const response = await prisma.roadmap.delete({
                where: {
                    id: roadmap.id
                },
                select: {
                    organizationId: true
                }
            })
            return response
        } catch (error: any) {
            return {
                error: error.message
            }
        }
    },
    ['owner']
)

export const editUser = withAuth(
    async (_id: unknown, data: { [key: string]: unknown }) => {
        const session = await getSession();
        if (!session?.user.id) {
            return {
                error: "Not authenticated"
            };
        }

        try {
            const response = await prisma.user.update({
                where: {
                    id: session.user.id
                },
                data: data, // Pass the data object directly
            });
            return response;
        } catch (error: any) {
            if (error.code === "P2002") {
                const field = Object.keys(data)[0]; // Identify which field caused the conflict
                return {
                    error: `This ${field} is already in use`
                };
            } else {
                return {
                    error: error.message
                };
            }
        }
    }
)

// Invite user function with updated Organization model
export const inviteUser = withOrganizationAuth(
    async (
        organization: Organization,
        session: Session | null,
        email: string = "therealflawnsontong@gmail.com",
        role: string = "member",
        ip: string,
    ): Promise<ApiResponse<any>> => {
        try {
            if (!session) {
                throw new Error("You must be signed in to perform this action")
            }

            if (email === session.user.email) {
                return {success: false, error: "Cannot send invitation to yourself."}
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

            let invitationId: string | undefined
            const invitation = await prisma.invitation.create({
                data: {
                    email: lowerCaseEmail,
                    role: role,
                    organizationId: organization.id
                }
            }).then((res) => {

                return res
            })
            invitationId = invitation.id

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
                    inviteLink: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login?invitationId=${invitationId}`
                }
            ).then(() => {
                console.log("email sent")
            })

            if (!invitation) {
                console.error("Error inviting user.")
                return {success: false, error: "Database error. please try again later."}
            }

            revalidatePath("/app/analytics")

            return {success: true, data: invitation}
        } catch (error: any) {
            console.error("Error inviting user:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    },
    ['owner'] // this function is only available to owners of this organization
)

export const approveMemberRequestAndCreateMember = withOrganizationAuth(
    async (organization: Organization, memberRequest: MemberRequestWithUser): Promise<ApiResponse<any>> => {
        if (!memberRequest) {
            throw new Error("Invalid member request");
        }

        try {
            const member = await prisma.member.findUnique({
                where: {
                    userId_organizationId: {
                        userId: memberRequest.userId,
                        organizationId: memberRequest.organizationId
                    }
                },
                include: {
                    user: true
                }
            })

            revalidatePath("/app/analytics")
            revalidatePath("/app/profile")

            if (member) {
                return {success: false, error: "This member already exists in your organization."}
            }
        } catch (error) {
            console.error("Error checking if member already exists:", error);
            throw new Error("Failed to check if member already exists.");
        }

        try {

            const [, createdMember] = await Promise.all([
                // prisma.memberRequest.delete({
                //     where: {
                //         id: memberRequest.id,
                //     },
                // }),
                prisma.memberRequest.update({
                    where: {
                        id: memberRequest.id,
                    },
                    data: {
                        approved: true
                    }
                }),
                prisma.member.create({
                    data: {
                        email: memberRequest.email,
                        organizationId: memberRequest.organizationId,
                        role: "member",
                        userId: memberRequest.userId,
                    },
                    include: {
                        user: true
                    }
                }),
            ]);

            if (!createdMember) {
                console.error("Error approving member request.")
                return {success: false, error: "Database error. please try again later."}
            }

            if (createdMember && organization) {
                await sendMemberRequestApprovedEmail(
                    {
                        name: memberRequest.user.name,
                        email: memberRequest.email,
                        image: memberRequest.user.image,
                        organizationName: organization.name || "",
                        organizationImage: organization.image || "",
                    }
                ).then(() => {
                    console.log("email sent")
                })
            }

            // Return the result of prisma.member.create
            return {success: true, data: createdMember}
        } catch (error) {
            console.error("Error approving member request:", error);
            throw new Error("Failed to add member to organization.");
        }
    },
    ['owner']
)

export const deleteMemberRequest = withUserAuth(
    async (user: User, memberRequest: MemberRequestWithUser) => {
        if (!memberRequest) {
            throw new Error("Invalid member request");
        }
        try {
            // Ensure the composite key is valid or fallback to another unique identifier like `id`
            const deletedMemberRequest = await prisma.memberRequest.delete({
                where: {
                    id: memberRequest.id
                },
            });

            if (!deletedMemberRequest) {
                return {success: false, error: "Failed to delete member request. Request not found."};
            }

            return {success: true, data: deletedMemberRequest};

        } catch (error) {
            console.error("Error deleting member request:", error);
            return {success: false, error: "Failed to delete member request."};
        }
    },
)

export const denyMemberRequest = withOrganizationAuth(
    async (organization: Organization, memberRequest: MemberRequestWithUser): Promise<ApiResponse<any>> => {
        if (!memberRequest) {
            throw new Error("Invalid member request");
        }

        try {
            // Ensure the composite key is valid or fallback to another unique identifier like `id`
            const deletedMemberRequest = await prisma.memberRequest.delete({
                where: {
                    id: memberRequest.id
                },
            });

            if (!deletedMemberRequest) {
                return {success: false, error: "Failed to delete member request. Request not found."};
            }

            if (!organization) {
                return {success: false, error: "Organization not found."};
            }

            // Send denial email
            try {
                await sendMemberRequestDeniedEmail({
                    name: memberRequest.user.name,
                    email: memberRequest.email,
                    image: memberRequest.user.image,
                    organizationName: organization.name || "",
                    organizationImage: organization.image || "",
                });
                console.log("Email sent successfully.");
            } catch (emailError) {
                console.error("Error sending denial email:", emailError);
                return {success: false, error: "Failed to send denial email."};
            }

            revalidatePath("/app/analytics")

            return {success: true, data: deletedMemberRequest};

        } catch (error) {
            console.error("Error deleting member request:", error);
            return {success: false, error: "Failed to delete member request."};
        }
    },
    ['owner']
)

export const deleteInvitation = withOrganizationAuth(
    async (_: Organization, invitation: Invitation): Promise<ApiResponse<any>> => {
        if (!invitation) {
            throw new Error("Invalid invitation");
        }

        try {
            // Ensure the composite key is valid or fallback to another unique identifier like `id`
            const deletedInvitation = await prisma.invitation.delete({
                where: {
                    id: invitation.id
                },
            });

            if (!deletedInvitation) {
                return {success: false, error: "Failed to delete invitation. Request not found."};
            }

            revalidatePath("/app/settings")

            return {success: true, data: deletedInvitation};

        } catch (error) {
            console.error("Error deleting invitation:", error);
            return {success: false, error: "Failed to delete invitation."};
        }
    },
    ['owner']
)

export const declineAndDeleteInvitation = async (invitation: Invitation): Promise<ApiResponse<any>> => {
    if (!invitation) {
        throw new Error("Invalid invitation");
    }

    const session = await getSession();
    if (session?.user.email !== invitation.email) {
        throw new Error("Current user email doesn't match the invite email.")
    }

    try {
        // Ensure the composite key is valid or fallback to another unique identifier like `id`
        const deletedInvitation = await prisma.invitation.delete({
            where: {
                id: invitation.id
            },
        });

        if (!deletedInvitation) {
            return {success: false, error: "Failed to delete invitation. Request not found."};
        }

        revalidatePath("/app/settings")

        return {success: true, data: deletedInvitation};

    } catch (error) {
        console.error("Error deleting invitation:", error);
        return {success: false, error: "Failed to delete invitation."};
    }
}

// Invite user function with updated Organization model
export const leaveOrganization = withOrganizationAuth(
    async (organization: Organization, session: Session | null) => {
        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            // Check if the user is an owner
            const currentMember = await prisma.member.findUnique({
                where: {
                    userId_organizationId: {
                        userId: session.user.id,
                        organizationId: organization.id,
                    }
                }
            });

            if (!currentMember) {
                return {success: false, error: "Membership not found."};
            }

            if (currentMember.role === "owner") {
                const ownerCount = await prisma.member.count({
                    where: {
                        organizationId: organization.id,
                        role: "owner"
                    }
                });

                if (ownerCount <= 1) {
                    return {
                        success: false,
                        error: "You are the last owner and cannot leave the organization. Assign another owner first."
                    };
                }
            }

            const member = await prisma.member.delete({
                where: {
                    userId_organizationId: {
                        userId: session.user.id,
                        organizationId: organization.id,
                    }
                }
            });

            return {success: true, data: member};
        } catch (error: any) {
            logError("Error leaving organization", error);
            return {success: false, error: "Internal server error"};
        }
    }
);

export const updateMember = withOrganizationAuth(
    async (
        organization: Organization,
        membershipId: string,
        data: Prisma.MemberUpdateInput
    ) => {
        const session = await getSession();

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            const targetMember = await prisma.member.findUnique({
                where: {id: membershipId},
            });

            if (!targetMember) {
                return {success: false, error: "Membership not found."};
            }

            // Prevent demoting the last owner to member
            if (
                targetMember.role === "owner" &&
                data.role === "member"
            ) {
                const ownerCount = await prisma.member.count({
                    where: {
                        organizationId: organization.id,
                        role: "owner"
                    }
                });

                if (ownerCount <= 1) {
                    return {
                        success: false,
                        error: "You are the last owner. Assign another owner before changing your role."
                    };
                }
            }

            const updatedMember = await prisma.member.update({
                where: {id: membershipId},
                include: {user: true},
                data
            });

            revalidatePath("/app/analytics");
            revalidatePath("/app/profile");

            return {success: true, data: updatedMember};
        } catch (error: any) {
            logError("Error updating membership", error);
            return {success: false, error: "Internal server error"};
        }
    },
    ["owner"]
);

// Invite user function with updated Organization model
export const deleteMember = withOrganizationAuth(
    async (
        _: Organization,
        membershipId: string
    ) => {
        const session = await getSession()

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            const member = await prisma.member.delete({
                where: {
                    id: membershipId
                },
                include: {
                    user: true,
                    organization: true,
                }
            })

            if (!member) {
                return {success: false, error: "Membership not found"};
            }

            if (member) {
                await sendMemberDeletedEmail(
                    {
                        name: member.user.name,
                        email: member.email,
                        organizationName: member.organization.name || "",
                        organizationImage: member.organization.image || "",
                    }
                ).then(() => {
                    console.log("email sent")
                })
            }

            revalidatePath("/app/analytics")

            return {success: true, data: member};
        } catch (error: any) {
            logError("Error deleting membership", error);
            return {success: false, error: "Internal server error"};
        }
    },
    ['owner']
)


// Invite user function with updated Organization model
export const deleteUser = withAuth(
    async (session: Session | null) => {
        try {
            if (!session) {
                return {success: false, error: "Internal server error"};
            }

            const user = await prisma.user.delete({
                where: {
                    id: session.user.id,
                }
            })

            if (!user) {
                return {success: false, error: "user not found"};
            }

            return {success: true, data: user};
        } catch (error: any) {
            logError("Error fetching user data", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const createPost = withAuth(
    async (formData: FormData) => {
        const session = await getSession()

        const text = formData.get("text") as string

        try {
            const post = prisma.post.create({
                data: {
                    text: text,
                    author: {
                        connect: {
                            id: session?.user.id
                        }
                    }
                }
            })

            if (!post) {
                return {success: false, error: "failed to create post"};
            }

            return {success: true, data: post};
        } catch (error: any) {
            logError("Error creating post", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const deletePost = withAuth(
    async (postId: string) => {
        try {
            const session = await getSession()
            const post = await prisma.post.delete({
                where: {
                    id: postId
                }
            })

            if (!post) {
                return {success: false, error: "failed to delete post"};
            }

            // extra auth logic
            if (post.authorId !== session?.user?.id) {
                return {success: false, error: "Not authorized: only the user who created this post can delete it."}
            }

            return {success: true, data: post};
        } catch (error: any) {
            logError("Error deleting post", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const createComment = withAuth(
    async (postId: string | null, text: string) => {
        const session = await getSession()

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            if (!postId) {
                return {success: false, error: "Post ID not provided."};
            }

            const comment = prisma.comment.create({
                data: {
                    post: {
                        connect: {
                            id: postId
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

export const createFollow = withAuth(
    async (organizationId: string | null) => {
        const session = await getSession()

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            if (!organizationId) {
                return {success: false, error: "Organization ID not provided."};
            }

            const follow = prisma.follow.create({
                data: {
                    user: {
                        connect: {
                            id: session.user.id
                        }
                    },
                    followedId: organizationId,
                    followedType: "ORGANIZATION",
                }
            })

            if (!follow) {
                return {success: false, error: "failed to follow organization"};
            }

            return {success: true, data: follow};
        } catch (error: any) {
            logError("Error following organization", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const acceptInvitation = withAuth(
    async (invitationId: string) => {
        try {
            const session = await getSession();
            if (!session?.user?.id) {
                throw new Error("You must be signed in to perform this action");
            }

            // Check if the invitation exists and is not already accepted
            const invitation = await prisma.invitation.findUnique({
                where: {
                    id: invitationId,
                },
            });

            // extra auth logic
            if (invitation?.email !== session.user.email) {
                return {
                    success: false,
                    error: "Error accepting invitation: active user email does not match the invite email."
                }
            }

            if (!invitation || invitation.accepted) {
                console.log("No valid invitation found or it has already been accepted.");
                return {success: false, error: "failed to follow organization"};
            }

            // Process invitation: create membership and delete memebership (mark invitation as accepted)
            await prisma.$transaction([
                prisma.member.create({
                    data: {
                        email: invitation.email,
                        organizationId: invitation.organizationId,
                        role: invitation.role || "member",
                        userId: session.user.id,
                    },
                }),
                prisma.invitation.delete({
                    where: {
                        id: invitationId,
                    },
                }),
                // prisma.invitation.update({
                //     where: {
                //         id: invitationId,
                //     },
                //     data: {
                //         accepted: true,
                //     },
                // }),
            ]);

            revalidatePath("/app/profile")

            return {success: true, data: invitation};
        } catch (error) {
            console.error();
            logError("Error accepting invitation:", error);
            return {success: false, error: "Failed to accept invitation. Please try again."};
        }
    }
)

export const updateCondition = withOrganizationAuth(
    async (organization: Organization, formData: FormData) => {
        try {
            // Convert FormData to a plain object
            const data: Record<string, any> = {};
            formData.forEach((value, key) => {
                if (key === "metadata") {
                    data[key] = JSON.parse(value.toString()) as JsonValue
                    return;
                }

                if (!isNaN(Number(value)) && value !== "") {
                    data[key] = Number(value);
                } else if (typeof value === "string" && value.startsWith("[")) {
                    try {
                        data[key] = JSON.parse(value);
                    } catch {
                        data[key] = value;
                    }
                } else {
                    data[key] = value;
                }
            });

            // Find the first condition associated with the organization
            const conditions = await prisma.conditionToOrganization.findMany({
                where: {organizationId: organization.id},
                include: {condition: true},
            });

            if (!conditions || conditions.length === 0) {
                throw new Error("No associated condition found for the organization.");
            }

            // Update the condition in Prisma
            if (conditions[0].conditionId) {
                const updatedCondition = await prisma.condition.update({
                    where: {id: conditions[0].conditionId},
                    data,
                });
                return {success: true, data: updatedCondition};
            }

            return {success: false, error: "No condition id found"};

        } catch (error: any) {
            console.error("Error updating condition:", error);
            return {success: false, error: error.message || "Failed to update condition."};
        }
    }
)

export const deleteAsset = withOrganizationAuth(
    async (_: Organization, toolId: string) => {
        try {
            const response = await prisma.tool.delete({
                where: {id: toolId},
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: {
                                include: {types: {include: {milestoneType: true}}}
                            }
                        }
                    }
                },
            })

            return response
        } catch (error: any) {
            console.error("Error deleting tool:", error.message);
            throw new Error(error.message || "Failed to delete tool.");
        }
    }
)

export const createOrUpdateAsset = withOrganizationAuth(
    async (organization: Organization, toolData: Partial<Asset>) => {
        try {
            if (!organization.id) {
                throw new Error("No organization id provided.")
            }

            const response = await prisma.tool.upsert({
                where: {
                    id: toolData.id || nanoid()
                },
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: {
                                include: {types: {include: {milestoneType: true}}}
                            }
                        }
                    }
                },
                update: {
                    title: toolData.title,
                    description: toolData.description,
                    attachments: {
                        deleteMany: {}, // clear all existing attachments
                        createMany: {
                            data: (toolData?.attachments || []).map((attachment: any) => ({
                                link: attachment.link,
                                ...(attachment.name ? {name: attachment.name} : undefined)
                            }))
                        }
                    },
                    contacts: {
                        deleteMany: {},
                        createMany: {
                            data: (toolData?.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                email: contact.email,
                                ...(contact.role ? {role: contact.role} : undefined),
                                ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                            }))
                        }
                    },
                    milestones: {
                        deleteMany: {},
                        create: (toolData.milestones || []).map((milestone: any) => ({
                            milestone: {
                                connect: {id: milestone.milestoneId}
                            }
                        }))
                    },
                    private: toolData.private || false,
                    pinned: toolData.pinned || false,
                },
                create: {
                    // create with the given id if it's available. This is useful for situations like 'undo'
                    // where we're re-creating a pre-existing tool, and the id should match the id in our zustand state
                    ...(toolData.id ? {id: toolData.id} : undefined),
                    title: toolData.title || "",
                    description: toolData.description,
                    attachments: {
                        createMany: {
                            data: (toolData?.attachments || []).map((attachment: any) => ({
                                link: attachment.link,
                                ...(attachment.name ? {name: attachment.name} : undefined)
                            }))
                        }
                    },
                    contacts: {
                        createMany: {
                            data: (toolData?.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                email: contact.email,
                                ...(contact.role ? {role: contact.role} : undefined),
                                ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                            }))
                        }
                    },
                    milestones: {
                        create: (toolData.milestones || []).map((milestone: any) => ({
                            milestone: {
                                connect: {id: milestone.milestoneId}
                            }
                        }))
                    },
                    private: toolData.private || false,
                    pinned: toolData.pinned || false,
                    organization: {connect: {id: organization.id}}
                },
            })

            return response
        } catch (error: any) {
            console.error("Error creating or updating tool:", error.message);
            throw new Error(error.message || "Failed to create or update tool.");
        }
    }
)

export const deleteRFP = withOrganizationAuth(
    async (_: Organization, rfpId: string) => {
        try {
            const response = await prisma.rFP.delete({
                where: {id: rfpId},
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: {
                                include: {types: {include: {milestoneType: true}}}
                            }
                        }
                    }
                },
            })

            return response
        } catch (error: any) {
            console.error("Error deleting RFP:", error.message);
            throw new Error(error.message || "Failed to delete RFP.");
        }
    }
)

export const createOrUpdateRFP = withOrganizationAuth(
    async (organization: Organization, rfpData: Partial<RFP>) => {
        try {
            if (!organization.id) {
                throw new Error("No organization id provided.")
            }

            const response = await prisma.rFP.upsert({
                where: {
                    id: rfpData.id || nanoid()
                },
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: {
                                include: {types: {include: {milestoneType: true}}}
                            }
                        }
                    }
                },
                update: {
                    headerImage: rfpData.headerImage,
                    title: rfpData.title,
                    description: rfpData.description,
                    attachments: {
                        deleteMany: {}, // clear all existing attachments
                        createMany: {
                            data: (rfpData?.attachments || []).map((attachment: any) => ({
                                link: attachment.link,
                                ...(attachment.name ? {name: attachment.name} : undefined)
                            }))
                        }
                    },
                    contacts: {
                        deleteMany: {},
                        createMany: {
                            data: (rfpData?.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                email: contact.email,
                                ...(contact.role ? {role: contact.role} : undefined),
                                ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                            }))
                        }
                    },
                    private: rfpData.private || false,
                    pinned: rfpData.pinned || false,
                    openTo: rfpData.openTo || [],
                    startDate: rfpData.startDate,
                    endDate: rfpData.endDate,
                    milestones: {
                        deleteMany: {},
                        create: (rfpData.milestones || []).map((milestone: any) => ({
                            milestone: {
                                connect: {id: milestone.milestoneId}
                            }
                        }))
                    },
                    budget: rfpData.budget
                },
                create: {
                    // create with the given id if it's available. This is useful for situations like 'undo'
                    // where we're re-creating a pre-existing rfp, and the id should match the id in our zustand state
                    ...(rfpData.id ? {id: rfpData.id} : undefined),
                    headerImage: rfpData.headerImage,
                    title: rfpData.title || "",
                    description: rfpData.description,
                    attachments: {
                        createMany: {
                            data: (rfpData?.attachments || []).map((attachment: any) => ({
                                link: attachment.link,
                                ...(attachment.name ? {name: attachment.name} : undefined)
                            }))
                        }
                    },
                    contacts: {
                        createMany: {
                            data: (rfpData?.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                email: contact.email,
                                ...(contact.role ? {role: contact.role} : undefined),
                                ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                            }))
                        }
                    },
                    private: rfpData.private || false,
                    pinned: rfpData.pinned || false,
                    openTo: rfpData.openTo || [],
                    startDate: rfpData.startDate,
                    endDate: rfpData.endDate,
                    milestones: {
                        create: (rfpData.milestones || []).map((milestone: any) => ({
                            milestone: {
                                connect: {id: milestone.milestoneId}
                            }
                        }))
                    },
                    organization: {connect: {id: organization.id}},
                    budget: rfpData.budget
                },
            })

            return response
        } catch (error: any) {
            console.error("Error creating or updating RFP:", error.message);
            throw new Error(error.message || "Failed to create or update RFP.");
        }
    }
)

/* MILESTONE AND ROADMAP UPDATES ----------------------------------------------------------------------------------------- */
export const createRoadmap = withOrganizationAuth(
    async (organization: Organization, roadmapTemplate?: typeof templateResearchPlans[0] & {metadata: JsonObject} | undefined) => {
        const roadmap = await prisma.roadmap.create({
            data: {
                title: roadmapTemplate?.title,
                description: roadmapTemplate?.description,
                organization: {
                    connect: {id: organization.id}
                },
                modalities: roadmapTemplate?.modalities,
                ...(roadmapTemplate?.metadata ? {metadata: roadmapTemplate.metadata} : undefined)
            }
        })

        // if a roadmap template was provided, create the relevant nodes, milestones, and edges
        if (roadmapTemplate?.milestones) {
            await createNodesAndEdgesFromTemplate(organization.id, roadmap.id, roadmapTemplate)
        }

        const finalRoadmap = prisma.roadmap.findUnique({
            where: {id: roadmap.id},
            include: {
                milestones: {
                    include: {
                        node: true,
                        contacts: true,
                        attachments: true,
                        types: {include: {milestoneType: true}},
                        tools: {include: {tool: true}},
                        rfps: {include: {rfp: true}}
                    }
                },
                nodes: true,
                edges: true,
                organization: true
            }
        })

        return finalRoadmap
    }
)

export const createNodesAndEdgesFromTemplate = withOrganizationAuth(
    async (organization: Organization, roadmapId: string, roadmapTemplate: typeof templateResearchPlans[0] & {metadata: JsonObject}) => {
        // maps the original node id (from the template) to the new node ID that's stored in the DB
        const nodeIDMap: { [originalNodeId: string]: string } = {}

        // if a roadmap template was provided, create the relevant nodes, milestones, and edges
        if (roadmapTemplate?.milestones) {
            const milestones = roadmapTemplate.milestones

            const nodes = await Promise.all(
                milestones.map(async (milestone: any, index: number) => {
                    // find the node associated with the milestone, used to fetch position information
                    const templateNode = roadmapTemplate.nodes.find(n => n.id === milestone.nodeId)

                    // create Node & associated Milestone
                    const node = await prisma.node.create({
                        data: {
                            roadmapId: roadmapId,
                            positionX: templateNode ? templateNode.positionX : index * 500,
                            positionY: templateNode ? templateNode.positionY : 0,
                            data: {
                                create: {
                                    roadmapId: roadmapId,
                                    organizationId: organization.id,
                                    status: milestone.status || "PLANNED",
                                    title: milestone.title,
                                    ...(milestone.description ? {description: milestone.description} : undefined),
                                    ...(milestone.startDate ? {startDate: milestone.startDate} : undefined),
                                    ...(milestone.endDate ? {endDate: milestone.endDate} : undefined),
                                    ...(milestone.budget ? {budget: milestone.budget} : undefined),
                                    private: milestone.private || true,
                                    types: {
                                        create: (milestone.types || []).map((type: any) => ({
                                            milestoneType: {
                                                connect: {id: type.milestoneTypeId}
                                            }
                                        }))
                                    },
                                }
                            }
                        }
                    })

                    // append to node ID map, this is used to create edges so we can map the template node ID to the
                    // new node ID that will be used in the database
                    if (templateNode) nodeIDMap[templateNode.id] = node.id

                    // grab milestone so we can add tasks
                    // createMany doesn't support nested creates - we must add tasks after creating the Milestone object
                    // const newMilestone = await prisma.milestone.findUnique({
                    //     where: {nodeId: node.id},
                    //     include: {
                    //         attachments: true,
                    //         contacts: true,
                    //         node: true
                    //     }
                    // })

                    // create tasks for relevant milestone
                    // if (newMilestone) {
                    //     await Promise.all((milestone.tasks || []).map(async (task: any, index: number) => (
                    //         await prisma.task.create({
                    //             data: {
                    //                 milestoneId: newMilestone?.id,
                    //                 status: task.status || "PLANNED",
                    //                 name: task.name,
                    //                 orderPosition: index,
                    //                 kanbanPosition: index,
                    //                 checklist: {
                    //                     createMany: {
                    //                         data: (task.checklist || []).map((item: any, index: number) => ({
                    //                             name: item.name,
                    //                             complete: item.complete || false,
                    //                             orderPosition: index
                    //                         }))
                    //                     }
                    //                 }
                    //             }
                    //         })
                    //     )))
                    // }

                    return node
                })
            )

            // create any edges that are connecting nodes
            if (roadmapTemplate.edges) {
                const edges = await Promise.all(
                    roadmapTemplate.edges.map(async (edge: Edge, index: number) => {
                        const newEdge = await prisma.edge.create({
                            data: {
                                roadmap: {connect: {id: roadmapId}},
                                source: nodeIDMap[edge.source] || edge.source,
                                target: nodeIDMap[edge.target] || edge.target,
                            }
                        })
                    })
                )
            } else {
                // template doesn't have any defined edges, use default edge generation
                for (let i = 0; i < nodes.length - 1; i++) {
                    await prisma.edge.create({
                        data: {
                            roadmap: {connect: {id: roadmapId}},
                            source: nodes[i]?.id,
                            target: nodes[i + 1]?.id
                        }
                    })
                }
            }
        }

        const finalRoadmap = await prisma.roadmap.findUnique({
            where: {id: roadmapId},
            include: {
                milestones: {
                    include: {
                        node: true,
                        contacts: true,
                        attachments: true,
                        types: {include: {milestoneType: true}},
                        tools: {include: {tool: true}},
                        rfps: {include: {rfp: true}}
                    }
                },
                nodes: true,
                edges: true,
                organization: true
            }
        })

        return {success: true, data: finalRoadmap}
    }
)

/* HANDLE UPDATING FLOW NODES - roadmap nodes positions, nothing in here is needed for typesense ------------------------- */
export const updateDBFlow = withOrganizationAuth(
    async (organization: Organization, {roadmapId, nodes, edges}: {
        roadmapId: string | null,
        nodes: any[],
        edges: any[]
    }) => {
        try {
            if (!roadmapId) throw new Error('No roadmapId provided.')
            // console.log(`nodes:`, nodes)
            // console.log(`milestones:`, milestones)
            // console.log(`edges:`, edges)

            // const organizations = await prisma.organization.findMany({
            //     include: {
            //         roadmaps: true
            //     }
            // })
            // const organization = organizations.find(org => org.roadmaps.map(r => r.id).includes(roadmapId))

            // if (!organization) throw new Error(`Could not find organization with roadmap id: ${roadmapId}`)
            // const organizationId: string = organization.id

            // Delete any nodes that are not in the request
            // node ids in this request
            const nodeIds = nodes.map((node: any) => node.id)
            // nodes in this roadmap
            const nodesInDB = await prisma.node.findMany({
                select: {id: true},
                where: {roadmapId}
            })
            const nodeIdsInDB = (nodesInDB || []).map((node: any) => node.id)
            const nodesToDelete = nodeIdsInDB.filter(
                (id: string) => !nodeIds.includes(id)
            )

            await prisma.node.deleteMany({
                where: {
                    id: {in: nodesToDelete},
                    roadmapId: roadmapId
                }
            })

            // await prisma.edge.deleteMany()

            // Save or update nodes
            await Promise.all(
                nodes.map(async (node: any) => {
                    const n = await prisma.node.upsert({
                        include: {data: true},
                        where: {id: node.id},
                        update: {
                            positionX: node.position?.x,
                            positionY: node.position?.y,
                            origin: node.origin
                        },
                        create: {
                            id: node.id,
                            roadmap: {
                                connect: {id: roadmapId}
                            },
                            positionX: node.position?.x,
                            positionY: node.position?.y,
                            origin: node.origin,
                            data: {
                                create: {
                                    id: node.data?.id,
                                    roadmap: {
                                        connect: {id: roadmapId}
                                    },
                                    organization: {
                                        connect: {id: organization.id}
                                    },
                                    title: node.data?.title || "New Milestone",
                                    // types: node.data?.types || [],
                                    description: node.data?.description,
                                    startDate: node.data?.startDate,
                                    endDate: node.data?.endDate,
                                    budget: node.data?.budget,
                                    attachments: {
                                        createMany: {
                                            data: (node.data?.attachments || []).map((attachment: any) => ({
                                                link: attachment.link,
                                                ...(attachment.name ? {name: attachment.name} : undefined)
                                            }))
                                        }
                                    },
                                    status: node.data?.status || "PLANNED",
                                    private: node.data?.private || false,
                                }
                            }
                        }
                    })
                })
            )

            // Save or update edges
            await Promise.all(
                edges.map(async (edge: any) => {
                    await prisma.edge.upsert({
                        where: {id: edge.id},
                        update: {
                            source: edge.source,
                            target: edge.target
                        },
                        create: {
                            id: edge.id,
                            roadmap: {
                                connect: {id: roadmapId}
                            },
                            source: edge.source,
                            target: edge.target,
                        }
                    })
                })
            )

            const updatedNodes = await prisma.node.findMany({
                where: {roadmapId}
            })
            const updatedMilestones = await prisma.milestone.findMany({
                include: {
                    node: true,
                    contacts: true,
                    attachments: true,
                    types: {include: {milestoneType: true}},
                    tools: {include: {tool: true}},
                    rfps: {include: {rfp: true}}
                },
                where: {roadmapId}
            })
            const updatedEdges = await prisma.edge.findMany({
                where: {roadmapId}
            })

            console.log(`Successfully updated Flow`)
            return {success: true, data: {nodes: updatedNodes, milestones: updatedMilestones, edges: updatedEdges}}
        } catch (error) {
            console.error(`Error updating Flow: `, error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const createMilestones = withOrganizationAuth(
    async (_: Organization, {roadmapId, milestones}: { roadmapId: string | null, milestones: Milestone[] }) => {
        try {
            const updatedMilestones: Milestone[] = []

            if (!roadmapId) throw new Error('No roadmapId provided.')

            const organizations = await prisma.organization.findMany({
                include: {
                    roadmaps: true
                }
            })
            const organization = organizations.find(org => org.roadmaps.map(r => r.id).includes(roadmapId))

            if (!organization) throw new Error(`Could not find organization with roadmap id: ${roadmapId}`)
            const organizationId: string = organization.id

            await Promise.all(
                milestones.map(async (milestone: Milestone, index: number) => {
                    const m: Milestone = await prisma.milestone.create({
                        include: {
                            node: true,
                            contacts: true,
                            attachments: true,
                            roadmap: true,
                            types: {include: {milestoneType: true}},
                            tools: {include: {tool: true}},
                            rfps: {include: {rfp: true}}
                        },
                        data: {
                            id: milestone?.id,
                            roadmap: {
                                connect: {id: roadmapId}
                            },
                            organization: {
                                connect: {id: organizationId}
                            },
                            title: milestone?.title || "New Milestone",
                            types: {
                                create: (milestone?.types || []).map((type: any) => ({
                                    milestoneType: {
                                        connect: {id: type.milestoneTypeId}
                                    }
                                }))
                            },
                            tools: {
                                create: (milestone?.tools || []).map((tool: any) => ({
                                    tool: {
                                        connect: {id: tool.toolId}
                                    }
                                }))
                            },
                            rfps: {
                                create: (milestone?.rfps || []).map((rfp: any) => ({
                                    rfp: {
                                        connect: {id: rfp.rfpId}
                                    }
                                }))
                            },
                            timelineOrder: milestone?.timelineOrder,
                            description: milestone?.description,
                            startDate: milestone?.startDate,
                            endDate: milestone?.endDate,
                            budget: milestone?.budget,
                            attachments: {
                                createMany: {
                                    data: (milestone?.attachments || []).map((attachment: any) => ({
                                        link: attachment.link,
                                        ...(attachment.name ? {name: attachment.name} : undefined)
                                    }))
                                }
                            },
                            status: milestone?.status || "PLANNED",
                            private: milestone?.private || true,
                            nodeType: milestone?.nodeType || "PROJECT"

                            // create associated node
                            // node: {
                            //     create: {
                            //         id: node.id,
                            //         roadmap: {
                            //             connect: {id: roadmapId}
                            //         },
                            //         type: node.type,
                            //         positionX: node.position?.x,
                            //         positionY: node.position?.y,
                            //         origin: node.origin,
                            //     }
                            // }
                        }
                    })

                    updatedMilestones.push(m)
                })
            )

            return {success: true, data: {milestones: updatedMilestones}}
        } catch (error) {
            logError("Could not create milestones", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const createNodes = withOrganizationAuth(
    async (_: Organization, {roadmapId, nodes}: { roadmapId: string | null, nodes: any[] }) => {
        try {
            const updatedNodes: any[] = []

            if (!roadmapId) throw new Error('No roadmapId provided.')

            const organizations = await prisma.organization.findMany({
                include: {
                    roadmaps: true
                }
            })
            const organization = organizations.find(org => org.roadmaps.map(r => r.id).includes(roadmapId))

            if (!organization) throw new Error(`Could not find organization with roadmap id: ${roadmapId}`)
            const organizationId: string = organization.id

            await Promise.all(
                nodes.map(async (node: any, index: number) => {
                    const n = await prisma.node.create({
                        include: {data: true},
                        // where: {id: node.id},
                        // update: {
                        //     positionX: node.position?.x,
                        //     positionY: node.position?.y,
                        //     origin: node.origin,
                        // },
                        data: {
                            id: node.id,
                            roadmap: {
                                connect: {id: roadmapId}
                            },
                            positionX: node.position?.x,
                            positionY: node.position?.y,
                            origin: node.origin,
                            data: {
                                create: {
                                    id: node.data?.id,
                                    roadmap: {
                                        connect: {id: roadmapId}
                                    },
                                    organization: {
                                        connect: {id: organizationId}
                                    },
                                    title: node.data?.title || "New Milestone",
                                    types: {
                                        create: (node.data?.types || []).map((type: any) => ({
                                            milestoneType: {
                                                connect: {id: type.milestoneTypeId}
                                            }
                                        }))
                                    },
                                    timelineOrder: node.data?.timelineOrder,
                                    description: node.data?.description,
                                    startDate: node.data?.startDate,
                                    endDate: node.data?.endDate,
                                    budget: node.data?.budget,
                                    attachments: {
                                        createMany: {
                                            data: (node.data?.attachments || []).map((attachment: any) => ({
                                                link: attachment.link,
                                                ...(attachment.name ? {name: attachment.name} : undefined)
                                            }))
                                        }
                                    },
                                    status: node.data?.status || "PLANNED",
                                    private: node.data?.private || true,
                                    nodeType: node.data?.nodeType || "PROJECT"
                                }
                            }
                        }
                    })

                    updatedNodes.push(n)
                })
            )

            const nodeIds = updatedNodes.map(node => node.id)
            let updatedMilestones = await prisma.milestone.findMany({
                include: {
                    node: true,
                    contacts: true,
                    attachments: true,
                    types: {include: {milestoneType: true}},
                    tools: {include: {tool: true}},
                    rfps: {include: {rfp: true}}
                },
                where: {roadmapId}
            })

            updatedMilestones = updatedMilestones.filter(milestone => nodeIds.includes(milestone.nodeId))

            // Typesense - create typesense milestone documents here...
            // Promise.all(
            //     updatedMilestones.map(async (response: any) => {
            //         const document = response.map((r: any) => ({
            //             ...r,
            //             RFPId_exists: response.RFP ? true : false,
            //             toolId_exists: response.tool ? true : false
            //         }))
            //         console.log(`Add typesense document`, document)
            //         await addTypeSenseDocument(
            //              `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`, 
            //              (
            //                 process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
            //                     ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
            //                     : process.env.TYPESENSE_ADMIN_API_KEY
            //             )!, 
            //              document, 
            //              'milestones'
            //         )
            //     })
            // )

            return {success: true, data: {nodes: updatedNodes, milestones: updatedMilestones}}
        } catch (error: any) {
            logError("Could not create nodes", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const deleteNode = withOrganizationAuth(
    async (_: Organization, nodeId: string | undefined) => {
        try {
            if (!nodeId) return {success: false, error: "No nodeId provided"}

            // cascading delete will also delete milestone
            const deletedNode = await prisma.node.delete({
                where: {id: nodeId},
                include: {data: true}
            })

            if (!deletedNode || !deletedNode.data?.id) {
                return {success: false, error: "failed to delete node"};
            }

            // Typesense - delete milestone documents here...
            // console.log(`Delete typesense document`, deletedNode.data.id)
            // await deleteTypeSenseDocument(
            //     `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`, 
            //     (
            //         process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
            //             ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
            //             : process.env.TYPESENSE_ADMIN_API_KEY
            //     )!, 
            //     deletedNode.data.id, 
            //     'milestones'
            // )

            return {success: true, data: deletedNode}
        } catch (error: any) {
            logError("Could not delete node", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const updateEdges = withOrganizationAuth(
    async (_: Organization, {roadmapId, edges}: { roadmapId: string | null, edges: any[] }) => {
        try {
            if (!roadmapId) throw new Error('No roadmapId provided.')

            await prisma.edge.deleteMany({
                where: {roadmapId}
            })

            // Save or update edges
            await Promise.all(
                edges.map(async (edge: any) => {
                    await prisma.edge.upsert({
                        where: {id: edge.id},
                        update: {
                            source: edge.source,
                            target: edge.target
                        },
                        create: {
                            id: edge.id,
                            roadmap: {
                                connect: {id: roadmapId}
                            },
                            source: edge.source,
                            target: edge.target,
                        }
                    })
                })
            )

            const updatedEdges: Edge[] = await prisma.edge.findMany({
                where: {roadmapId}
            })

            console.log(`Successfully updated Flow Edges`)
            return {success: true, data: updatedEdges}
        } catch (error) {
            console.error(`Error updating Flow Edges`, error)
            return {success: false, error: "Internal server error"}
        }
    }
)

/* HANDLE MILESTONES, ASSETS & RFPS - create, update, delete ------------------------------------------------------------- */
export const syncDBAssets = withOrganizationAuth(
    async (_: Organization, {tools}: { tools: Asset[] }) => {
        try {
            let updateAssets: Asset[] = []
            const session = await getSession()

            if (!session?.user.organizationId) throw new Error("No session available")

            await Promise.all(
                tools.map(async (tool: Asset) => {
                    const previousAsset: Asset | null = await prisma.tool.findUnique({
                        where: {id: tool.id},
                        include: {
                            contacts: true,
                            attachments: true,
                            milestones: {
                                include: {
                                    milestone: true
                                }
                            }
                        }
                    })

                    if (!previousAsset) {
                        // if the tool does not exist, re-create it
                        const a = await createOrUpdateAsset(session.user.organizationId, tool)
                        updateAssets = [...updateAssets, a]
                    } else {
                        // if the tool does exist, update it's properties
                        updateAssets = [...updateAssets, previousAsset]
                    }
                })
            )

            // delete any tools that no longer exist
            // const dbAssetIds = await prisma.tool.findMany({
            //     where: {organizationId: session.user.organizationId}
            // }).map(tool => )

            return {success: true, data: updateAssets}
        } catch (e) {
            return {success: false, error: e}
        }
    }
)

export const syncDBRFPs = withOrganizationAuth(
    async (_: Organization, {rfps}: { rfps: RFP[] }) => {
        try {
            let updateRfps: RFP[] = []
            const session = await getSession()

            if (!session?.user.organizationId) throw new Error("No session available")

            await Promise.all(
                rfps.map(async (rfp: RFP) => {
                    const previousRfp: RFP | null = await prisma.rFP.findUnique({
                        where: {id: rfp.id},
                        include: {
                            contacts: true,
                            attachments: true,
                            milestones: {
                                include: {
                                    milestone: true
                                }
                            }
                        },
                    })

                    if (!previousRfp) {
                        // if the RFP does not exist, re-create it
                        const r = await createOrUpdateRFP(session.user.organizationId, rfp)
                        updateRfps = [...updateRfps, r]
                    } else {
                        // if the tool does exist, update it's properties
                        updateRfps = [...updateRfps, previousRfp]
                    }
                })
            )

            // delete any RFPs that no longer exist
            // const dbRfpIds = await prisma.rfp.findMany({
            //     where: {organizationId: session.user.organizationId}
            // }).map(rfp => )

            return {success: true, data: updateRfps}
        } catch (e) {
            return {success: false, error: e}
        }
    }
)

export const updateMilestones = withOrganizationAuth(
    async (_: Organization, {milestones}: { milestones: Milestone[] }) => {
        try {
            let updatedMilestones: Milestone[] = []

            console.log(`milestone types`, milestones.flatMap(milestone => milestone.types))

            await Promise.all(
                milestones.map(async (milestone: any) => {
                    const previousMilestone = await prisma.milestone.findUnique({
                        where: {nodeId: milestone.nodeId},
                        // where: {id: milestone.id},
                        include: {
                            node: true,
                            contacts: true,
                            attachments: true,
                            types: {include: {milestoneType: true}},
                            tools: {include: {tool: true}},
                            rfps: {include: {rfp: true}}
                        }
                    })

                    if (!previousMilestone) {
                        // milestone doesn't exist, throw error
                        throw new Error(`Milestone (${milestone.title}) with ID ${milestone.id} does not exist.`)
                    }

                    let m: Milestone = await prisma.milestone.update({
                        where: {nodeId: milestone.nodeId},
                        // where: {id: milestone.id},
                        include: {
                            node: true,
                            contacts: true,
                            attachments: true,
                            roadmap: true,
                            types: {include: {milestoneType: true}},
                            tools: {include: {tool: true}},
                            rfps: {include: {rfp: true}}
                        },
                        data: {
                            title: milestone.title,
                            types: {
                                deleteMany: {},
                                create: (milestone.types || []).map((type: any) => ({
                                    milestoneType: {
                                        connect: {id: type.milestoneTypeId || type.milestoneType.id}
                                    }
                                }))
                            },
                            tools: {
                                deleteMany: {},
                                create: (milestone.tools || []).map((tool: any) => ({
                                    tool: {
                                        connect: {id: tool.toolId || tool.tool.id}
                                    }
                                }))
                            },
                            rfps: {
                                deleteMany: {},
                                create: (milestone.rfps || []).map((rfp: any) => ({
                                    rfp: {
                                        connect: {id: rfp.rfpId || rfp.rfp.id}
                                    }
                                }))
                            },
                            timelineOrder: milestone.timelineOrder,
                            otherTypeDetails: milestone.otherTypeDetails,
                            description: milestone.description,
                            startDate: milestone.startDate,
                            endDate: milestone.endDate,
                            budget: milestone.budget,
                            attachments: {
                                deleteMany: {}, // clear all existing attachments
                                createMany: {
                                    data: (milestone?.attachments || []).map((attachment: any) => ({
                                        link: attachment.link,
                                        ...(attachment.name ? {name: attachment.name} : undefined)
                                    }))
                                }
                            },
                            contacts: {
                                deleteMany: {},
                                createMany: {
                                    data: (milestone?.contacts || []).map((contact: any) => ({
                                        name: contact.name,
                                        email: contact.email,
                                        ...(contact.role ? {role: contact.role} : undefined),
                                        ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                                    }))
                                }
                            },
                            openTo: milestone.openTo || [],
                            status: milestone.status || "PLANNED",
                            private: milestone.private || false,
                            notes: milestone.notes,
                            nodeType: milestone.nodeType || "PROJECT",
                            ...(milestone.metadata ? {metadata: milestone.metadata} : undefined)
                        }
                    })

                    console.log(`updated milestone`, m)

                    updatedMilestones = [...updatedMilestones, m]
                })
            )

            // Typesense - update milestone documents here...
            // Promise.all(
            //     updatedMilestones.map(async (response: any) => {
            //         const document = response.map((r: any) => ({
            //             ...r,
            //             RFPId_exists: response.RFP ? true : false,
            //             toolId_exists: response.tool ? true : false
            //         }))
            //         console.log(`Update typesense document`, document)
            //         await updateTypeSenseDocument(
            //             `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`, 
            //             (
            //                 process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
            //                     ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
            //                     : process.env.TYPESENSE_ADMIN_API_KEY
            //             )!,
            //             document, 
            //             'milestones'
            //         )
            //     })
            // )

            console.log(`Successfully updated Milestone`)
            return {success: true, data: updatedMilestones}
        } catch (error: any) {
            logError(`Error updating Milestone: `, error)
            return {success: false, error: "Internal server error"}
        }
    }
)

/* HANDLE KANBAN - create ------------------------------------------------------------------------------------------------ */
export const createKanban = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const newKanban = await prisma.kanban.create({
                include: {columns: true},
                data: {
                    organization: {connect: {id: organization.id}},
                    columns: {
                        create: DEFAULT_KANBAN_COLUMNS
                    }
                }
            })

            return {success: true, data: newKanban}
        } catch (error: any) {
            logError(`Error creating task for ${organization.id}`, error)
            return {success: false, error: "Internal server error"}
        }
    }
)

/* HANDLE KANBAN COLUMNS - create, update, delete ------------------------------------------------------------------------ */
export const kanbanSync = withOrganizationAuth(
    async (_: Organization, {kanbanId, columns, tasks}: {
        kanbanId: string | undefined,
        columns: Column[],
        tasks: Task[]
    }) => {
        try {
            if (!kanbanId) return

            console.log(`kanban id`, kanbanId)
            // return

            await prisma.column.deleteMany({
                where: {kanbanId}
            })

            // Save or update nodes
            await Promise.all(
                columns.map(async (column: Column) => {
                    const c = await prisma.column.create({
                        // here we have to re-connect all the previously created connections
                        data: {
                            ...column,
                            kanbanId,
                            metadata: undefined,
                            tasks: {
                                create: tasks.filter(t => t.columnId === column.id).map(task => ({
                                    ...task,
                                    metadata: undefined,
                                    columnId: undefined,
                                    column: undefined,
                                    checklist: {
                                        create: (task.checklist || []).map((item: any) => ({
                                            ...item,
                                            taskId: undefined
                                        }))
                                    },
                                    milestoneId: task.milestoneId,
                                    milestone: undefined,
                                    stakeholders: {
                                        create: (task.stakeholders || []).map((stakeholder: any) => ({
                                            userId: stakeholder?.user?.id || stakeholder?.userId,
                                        }))
                                    },
                                }))
                            }
                        }
                    })
                })
            )

        } catch (error: any) {
            logError("Error syncing kanban", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const createColumn = withOrganizationAuth(
    async (organization: Organization, column: Partial<Column>) => {
        try {
            const {data: kanban} = await getKanbanFromOrganizationId(organization.id, {
                id: true,
                createdAt: true,
                updatedAt: true,
                columns: true,
                organization: true
            })
            if (!kanban) return {success: false, error: "failed to find associated task board"}

            const newColumn = await prisma.column.create({
                data: {
                    name: column.name || 'New column',
                    id: nanoid(),
                    kanban: {
                        connect: {id: kanban.id}
                    },
                    kanbanPosition: column.kanbanPosition || 0
                }
            })

            if (!newColumn) {
                return {success: false, error: "failed to create column"};
            }

            // Typesense - if updating typesense, update here...

            return {success: true, data: newColumn};
        } catch (error: any) {
            logError("Error creating column", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const updateColumns = withOrganizationAuth(
    async (_: Organization, {columns}: { columns: Column[] }) => {
        try {
            let updatedColumns: Column[] = []

            await Promise.all(
                columns.map(async (column: any) => {
                    let c = await prisma.column.update({
                        where: {id: column?.id},
                        data: {
                            name: column.name,
                            kanbanPosition: column.kanbanPosition
                        }
                    })

                    if (!c) {
                        logError("Could not update column", column)
                    } else {
                        updatedColumns.push(c)
                    }
                })
            )

            // Typesense - if updating typesense, update here...

            return {success: true, data: updatedColumns}
        } catch (error) {
            logError("Could not update column", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const deleteColumn = withOrganizationAuth(
    async (_: Organization, columnId: string) => {
        try {
            const deletedColumn = await prisma.column.delete({
                where: {
                    id: columnId
                }
            })

            if (!deletedColumn) {
                return {success: false, error: "failed to delete column"};
            }

            // Typesense - if updating typesense, update here...

            return {success: true, data: deletedColumn};
        } catch (error: any) {
            logError("Error deleting column", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

/* HANDLE KANBAN TASKS - create, update, delete -------------------------------------------------------------------------- */
export const createTask = withOrganizationAuth(
    async (_: Organization, columnId: string, properties?: any) => {
        try {
            const newTask: Task = await prisma.task.create({
                include: {checklist: true, stakeholders: {include: {user: true}}},
                data: {
                    name: 'New Task',
                    id: nanoid(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    kanbanPosition: 0,
                    // status: null,
                    // description: null,
                    // milestoneId: null,
                    orderPosition: 0,
                    columnId,
                    // date: null,
                    // endDate: null,
                    // priority: null,
                    private: true,
                    // startDate: null,
                    // checklist: []
                    ...(properties?.stakeholders ? {
                        stakeholders: {
                            createMany: {
                                data: (properties.stakeholders || []).map((stakeholder: any) => ({
                                    userId: stakeholder?.user?.id || stakeholder?.userId,
                                    // user: { connect: { id: stakeholder.id }},
                                }))
                            }
                        }
                    } : undefined)
                }
            })

            // const organizations = await prisma.organization.findMany({
            //     where: {Kanban: {columns: {some: {id: columnId}}}},
            //     select: { id: true },
            // });

            // // create notifications for assigned stakeholders
            // if (properties.stakeholders && organizations.length == 1) {
            //     await Promise.all(
            //         properties.stakeholders.map(async (stakeholder: any) => {
            //             if (!stakeholder) return

            //             let n = await prisma.platformNotification.create({
            //                 data: {
            //                     type: "TASK_ASSIGN",
            //                     title: "You've been assigned a task.",
            //                     user: { connect: {id: stakeholder.userId} },
            //                     organization: { connect: {id: organizations[0].id}}
            //                 }
            //             })
            //         })
            //     )
            // }

            if (!newTask) {
                return {success: false, error: "Could not create task"}
            }

            // Typesense - if updating typesense, update here...

            return {success: true, data: newTask}
        } catch (error: any) {
            logError("Could not create task", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const notificationsViewed = withAuth(
    async ({notifications}: { notifications: PlatformNotification[] }) => {
        try {
            const updatedNotifications: PlatformNotification[] = []

            await Promise.all(
                notifications.map(async (notification: PlatformNotification) => {
                    if (!notification) return
                    let updatedNotification = await prisma.platformNotification.update({
                        where: {id: notification.id},
                        data: {
                            lastViewedAt: new Date()
                        }
                    })

                    updatedNotifications.push(updatedNotification)
                })
            )
            console.log(`Successfully updated notifications`)
            return {success: true, data: updatedNotifications}
        } catch (error) {
            logError("Could not update notifications", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const createNotification = withAuth(
    async ({notificationData}: { notificationData: any }) => {
        try {
            const session = await getSession()
            if (!session) throw new Error("No session data")

            const notification = await prisma.platformNotification.create({
                data: {
                    ...notificationData,
                    user: {connect: {id: session?.user.id}},
                    organization: {connect: {id: session.user.organizationId}},
                }
            })

            return {success: true, data: notification}
        } catch (error) {
            logError("Could not create notification", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const createNotifications = withAuth(
    async ({notificationsList}: { notificationsList: any[] }) => {
        try {
            const session = await getSession()
            if (!session) throw new Error("No session data")

            await prisma.platformNotification.createMany({
                data: notificationsList.map(notification => ({
                    ...notification,
                    userId: session?.user.id,
                    organizationId: session.user.organizationId
                }))
            })

            // Fetch the inserted notifications
            const notifications = await prisma.platformNotification.findMany({
                where: {
                    userId: session?.user.id,
                    organizationId: session.user.organizationId
                },
            })

            return {success: true, data: notifications}
        } catch (error) {
            logError("Could not create notifications", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const updateTasks = withOrganizationAuth(
    async (_: Organization, {tasks}: { tasks: Task[] }) => {
        try {
            let updatedTasks: Task[] = []

            await Promise.all(
                tasks.map(async (task: any) => {
                    if (!task) return
                    let prevTask = await prisma.task.findUnique({
                        where: {id: task.id},
                        include: {stakeholders: {include: {user: true}}}
                    })

                    let newTask = await prisma.task.update({
                        where: {id: task?.id},
                        include: {milestone: true, checklist: true, stakeholders: {include: {user: true}}},
                        data: {
                            name: task.name,
                            // status: task.status,
                            description: task.description,
                            orderPosition: task.orderPosition,
                            kanbanPosition: task.kanbanPosition,
                            checklist: {
                                deleteMany: {},
                                createMany: {
                                    data: (task.checklist || []).map((item: any) => ({
                                        name: item?.name || "New Item",
                                        complete: item?.complete || false,
                                        orderPosition: item?.orderPosition
                                    }))
                                }
                            },
                            stakeholders: {
                                deleteMany: {},
                                createMany: {
                                    data: (task.stakeholders || []).map((stakeholder: any) => ({
                                        userId: stakeholder?.user?.id || stakeholder?.userId,
                                        // user: { connect: { id: stakeholder.id }},
                                    }))
                                }
                            },
                            milestone: task.milestoneId
                                ? {connect: {id: task.milestoneId}} // Connect if milestoneId exists
                                : {disconnect: true}, // Disconnect if milestoneId is undefined
                            endDate: task.endDate,
                            priority: task.priority,
                            private: task.private,
                            column: {
                                connect: {id: task.columnId}
                            }
                        }
                    })

                    const organizations = await prisma.organization.findMany({
                        where: {kanban: {columns: {some: {tasks: {some: {id: newTask.id}}}}}},
                        select: {id: true},
                    });

                    const session = await getSession()
                    const prevStakeholderUserIds = prevTask?.stakeholders.map(stakeholder => stakeholder.user.id)
                    const notifications = newTask.stakeholders
                        .filter(newStakeholder => !prevStakeholderUserIds?.includes(newStakeholder.user.id))

                    // if a new stakeholder has been added to this task, we create a notification for them
                    if (organizations.length === 1 && notifications.length > 0) {
                        await Promise.all(
                            notifications.map(async (stakeholder: any) => {
                                if (!stakeholder) return
                                // don't create a notification for the user creating the task
                                if (stakeholder.userId === session?.user.id) return

                                let n = await createNotification({
                                    notificationData: {
                                        type: "NEW_TASK",
                                        title: "New task assigned",
                                        message: `${newTask.name} was assigned to you.`,
                                        metadata: {taskId: stakeholder.taskId, stakeholderId: stakeholder.id}
                                    }
                                })
                            })
                        )
                    }

                    if (!newTask) {
                        logError("Could not update task", task)
                    } else {
                        updatedTasks.push(newTask)
                    }
                })
            )

            // Typesense - if updating typesense, update here...

            console.log(`Successfully updated tasks`)
            return {success: true, data: updatedTasks}
        } catch (error) {
            logError("Could not update task", error)
            return {success: false, error: "Internal server error"}
        }
    }
)

export const deleteTask = withOrganizationAuth(
    async (_: Organization, taskId: string) => {
        try {
            const deletedTask = await prisma.task.delete({
                include: {checklist: true, stakeholders: {include: {user: true}}},
                where: {
                    id: taskId
                }
            })

            if (!deletedTask) {
                return {success: false, error: "failed to delete task"};
            }

            // Typesense - if updating typesense, update here...

            return {success: true, data: deletedTask};
        } catch (error: any) {
            logError("Error deleting task", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const createReview = withAuth(
    async (companyId: string, formData: FormData): Promise<ApiResponse<any>> => {
        const session = await getSession();
        if (!session?.user.id) {
            throw new Error("You must be signed in to perform this action");
        }

        try {
            // Check if a review already exists
            const existingReview = await prisma.review.findUnique({
                where: {
                    authorId_companyId_organizationId: {
                        authorId: session.user.id,
                        companyId: companyId,
                        organizationId: session.user.organizationId,
                    },
                },
            });

            if (existingReview) {
                return {success: false, error: "You have already created a review for this company."};
            }

            const title = formData.get("title") as string;
            const body = formData.get("body") as string;
            const rating = parseInt(formData.get("rating") as string);

            // Use a transaction to create the review and update avgRating atomically
            const result = await prisma.$transaction(async (tx) => {
                // Create the review
                const review = await tx.review.create({
                    include: {
                        milestones: {
                            include: {
                                milestone: {
                                    include: {types: true}
                                }
                            }
                        }
                    },
                    data: {
                        title,
                        body,
                        rating,
                        author: {connect: {id: session.user.id}},
                        company: {connect: {id: companyId}},
                        organization: {connect: {id: session.user.organizationId}},
                    },
                });

                // Calculate new avgRating
                const aggregated = await tx.review.aggregate({
                    where: {companyId},
                    _avg: {rating: true},
                });

                const newAvgRating = aggregated._avg.rating ?? 0;

                // Update the company's avgRating
                const updatedCompany = await tx.company.update({
                    where: {id: companyId},
                    data: {avgRating: newAvgRating},
                });

                if (review && updatedCompany) {
                    await updateTypeSenseDocument(
                        `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                        (
                            process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                                ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                                : process.env.TYPESENSE_ADMIN_API_KEY
                        )!,
                        updatedCompany,
                        'companies'
                    );
                }

                return review;
            });

            revalidatePath("app/service-providers/");

            return {success: true, data: result};
        } catch (error: any) {
            console.error("Error creating review:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)

export const editReview = withAuth(
    async (companyId: string, formData: FormData): Promise<ApiResponse<any>> => {
        const session = await getSession();
        if (!session?.user.id) {
            throw new Error("You must be signed in to perform this action");
        }

        try {
            // Check if a review already exists
            const existingReview = await prisma.review.findUnique({
                where: {
                    authorId_companyId_organizationId: {
                        authorId: session.user.id,
                        companyId: companyId,
                        organizationId: session.user.organizationId,
                    },
                },
            });

            if (!existingReview) {
                return {success: false, error: "No existing review found to update."};
            }

            // extra auth logic here
            if (existingReview.authorId !== session.user.id) {
                return {success: false, error: "Not authorized: only the user who created this review can edit it."}
            }

            const title = formData.get("title") as string;
            const body = formData.get("body") as string;
            const rating = parseInt(formData.get("rating") as string);
            const milestoneId = formData.get("milestone") as string || null;

            // Use a transaction to update the review and recalculate avgRating atomically
            const result = await prisma.$transaction(async (tx) => {
                // Update the review
                const updatedReview = await tx.review.update({
                    where: {id: existingReview.id},
                    data: {
                        title,
                        body,
                        rating,
                        milestones: milestoneId ? {connect: {id: milestoneId}} : undefined,
                    },
                });

                // Calculate new avgRating
                const aggregated = await tx.review.aggregate({
                    where: {companyId},
                    _avg: {rating: true},
                });

                const newAvgRating = aggregated._avg.rating ?? 0;

                // Update the company's avgRating
                const updatedCompany = await tx.company.update({
                    where: {id: companyId},
                    data: {avgRating: newAvgRating},
                });

                if (updatedReview && updatedCompany) {
                    await updateTypeSenseDocument(
                        `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                        (
                            process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                                ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                                : process.env.TYPESENSE_ADMIN_API_KEY
                        )!,
                        updatedCompany,
                        'companies'
                    );
                }

                return updatedReview;
            });

            revalidatePath("app/service-providers/");

            return {success: true, data: result};
        } catch (error: any) {
            console.error("Error updating review:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)

export const deleteReview = withOrganizationAuth(
    async (_: Organization, review: Review) => {
        try {
            const session = await getSession()
            const response = await prisma.review.delete({
                where: {id: review.id},
            });

            // extra auth logic
            if (response.authorId !== session?.user.id) {
                return {success: false, error: "Not authorized: only the user who created this review can delete it."}
            }

            if (!response) {
                console.error("Error deleting review.")
                return {success: false, error: "Database error. please try again later."}
            }

            return {success: true, data: response}
        } catch (error: any) {
            console.error("Error deleting review:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const saveCRO = withOrganizationAuth(
    async (organization: Organization, croId: string, milestoneId: string) => {
        try {
            const response = await prisma.savedCompany.create({
                include: {
                    company: true,
                    milestone: {include: {types: true}}
                },
                data: {
                    company: {
                        connect: {
                            id: croId
                        }
                    },
                    organization: {
                        connect: {
                            id: organization.id
                        }
                    },
                    milestone: {
                        connect: {
                            id: milestoneId
                        }
                    },
                    // engagement: engagement as OrganizationToCompanyEngagement
                }
            });

            if (!response) {
                console.error("Error saving company.")
                return {success: false, error: "Database error. please try again later."}
            }

            console.log(`response`, response)

            return {success: true, data: response}
        } catch (error: any) {
            console.error("Error saving company:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const editSavedCRO = withOrganizationAuth(
    async (_: Organization, savedCROId: string, milestoneId: string) => {
        try {
            const response = await prisma.savedCompany.update({
                where: {
                    id: savedCROId // Make sure to specify the ID of the saved company you want to update
                },
                include: {
                    company: true,
                    milestone: {include: {types: true}}
                },
                data: {
                    milestone: {
                        connect: {
                            id: milestoneId
                        }
                    },
                    // engagement: engagement as OrganizationToCompanyEngagement
                }
            });

            if (!response) {
                console.error("Error saving edits to saved company.")
                return {success: false, error: "Database error. Please try again later."}
            }

            return {success: true, data: response}
        } catch (error: any) {
            console.error("Error editing saved company:", error)
            return {success: false, error: "Database error. Please try again later."}
        }
    }
)

export const unsaveCRO = withOrganizationAuth(
    async (_: Organization, savedCompanyId: string) => {
        try {
            const response = await prisma.savedCompany.delete({
                where: {id: savedCompanyId},
                include: {
                    company: true,
                    milestone: {include: {types: true}}
                },
            });

            if (!response) {
                console.error("Error unsaving company.")
                return {success: false, error: "Database error. please try again later."}
            }

            return {success: true, data: response}
        } catch (error: any) {
            console.error("Error unsaving company:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const submitFeedback = withAuth(
    async (reviewId: string, userId: string, isHelpful: boolean) => {
        try {
            // Check if the user has already provided feedback for this review
            const existingFeedback = await prisma.reviewFeedback.findUnique({
                where: {
                    reviewId_userId: {
                        reviewId,
                        userId,
                    },
                },
            });

            if (existingFeedback) {
                // If feedback exists, update it
                const response = await prisma.reviewFeedback.update({
                    where: {
                        id: existingFeedback.id,
                    },
                    data: {
                        helpful: isHelpful,
                    },
                });

                return {success: true, data: response};
            } else {
                // Otherwise, create new feedback
                const response = await prisma.reviewFeedback.create({
                    data: {
                        reviewId,
                        userId,
                        helpful: isHelpful,
                    },
                });

                return {success: true, data: response};
            }
        } catch (error: any) {
            console.error("Error submitting feedback:", error);
            return {success: false, error: "Database error. Please try again later."};
        }
    }
)

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

        const parsedServices = servicesRaw
            ? servicesRaw.split(",").map((name) => name.trim())
            : []
        const parsedCertifications = certificationsRaw
            ? certificationsRaw.split(",").map((name) => name.trim())
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
;

export const deleteCompany = withAdminAuth(
    async (company: Company) => {
        try {
            const deleteCompany = prisma.company.delete({
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
            const [response] = await Promise.all([deleteCompany, deleteTypeSense])

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

export const createPharmaProject = withAuth(
    async (formData: FormData) => {
        const name = formData.get("name") as string;

        try {
            const pharmaProject = await prisma.pharmaProject.create({
                data: {
                    name,
                },
            });

            revalidatePath("/(platform)/pharma/project/[id]")

            return {success: true, data: pharmaProject}
        } catch (error: any) {
            console.error("Error creating pharma project:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const deletePharmaProject = withAuth(
    async (pharmaProjectId: string | undefined) => {
        try {
            const response = prisma.pharmaProject.delete({
                where: {id: pharmaProjectId},
            });

            if (!response) {
                console.error("Error deleting pharma project.")
                return {success: false, error: "Database error. please try again later."}
            }

            revalidatePath("/(platform)/pharma")

            return {success: true, data: response}
        } catch (error: any) {
            console.error("Error deleting pharma project:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

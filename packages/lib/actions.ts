"use server"

import prisma from "./prisma"
import type {
    Roadmap,
    Organization,
    User,
    Invitation,
    PlatformNotification,
    Review,
    Institution, Condition,
    Biosample,
    DiseaseModel,
    Tool,
} from "@prisma/client"
import {Prisma} from "@prisma/client"
import {revalidatePath, revalidateTag} from "next/cache"
import {authOptions, withAuth, withOrganizationAuth, withResearcherAuth, withUserAuth} from "./auth"
import {getSession} from "./auth"
import {put} from "@vercel/blob";
import {customAlphabet} from "nanoid";
import {
    addTypeSenseDocument,
    deleteTypeSenseDocument,
    getBlurDataURL,
    logError, runInProduction,
    toKebabCase,
    updateTypeSenseDocument
} from "./utils";
import {validateEmailDomain} from "./server-utils";
import {getServerSession, Session} from "next-auth";
import {
    sendInviteEmail,
    sendMemberRequestCreatedEmail,
    sendMemberRequestApprovedEmail,
    sendNewOrganizationEmail,
    sendMemberRequestDeniedEmail,
    sendMemberDeletedEmail, sendProviderContactRequestEmail,
} from "./emails";
import {getKanbanFromOrganizationId} from "./fetchers"
import {
    Actor,
    ApiResponse,
    Asset,
    DEFAULT_KANBAN_COLUMNS,
    editBiosampleForm,
    editDataToolForm,
    editDiseaseModelForm,
    MemberRequestWithUserAndOrganization,
    Milestone,
    Option,
    optionSchema,
    RFP
} from "./types";
import {templateResearchPlans} from "./templates"
import {InputJsonObject, JsonObject, JsonValue} from "@prisma/client/runtime/library"
import z from "zod"
import {writeRawEvent} from "./raw-events";
import crypto from "node:crypto";
import {customerIOTrack} from "./customer-io-track";
import {cioDeleteUser} from "./customer-io";

const PATHS = [
    "/app",
    "/app/profile",
    "/app/dashboard",
    "/app/notifications",
    "/app/team",
    "/app/settings",
    "/app/tools/biosample",
    "/app/tools/disease-models",
    "/app/tools/data",
    "/app/rfps",
    "/app/requests",
    "/app/research-plan",
]

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
        const metadataValue: FormDataEntryValue | null = formData.get("metadata")
        const metadata: JsonObject = metadataValue
            ? JSON.parse(metadataValue.toString()) as JsonObject
            : {}

        // If it doesn't exist, create it
        try {
            const condition = await prisma.condition.upsert({
                where: {
                    slug,
                },
                update: {
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
                },
                create: {
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

            try {
// 1) Parse names from the payload
                const rawAssociated = (formData.get("associatedConditions") as string | null)?.split(",") ?? [];

// 2) Normalize to slugs, drop self and dupes
                const targetNames = rawAssociated.map(s => (s || "").trim()).filter(Boolean);
                const targetSlugs = Array.from(new Set(targetNames.map(n => toKebabCase(n)).filter(s => s !== slug)));

                if (targetSlugs.length) {
                    // 3) Find existing by slug
                    const existing = await prisma.condition.findMany({
                        where: {slug: {in: targetSlugs}},
                        select: {id: true, slug: true}
                    });
                    const existingBySlug = new Map(existing.map(e => [e.slug, e.id]));

                    // 4) Upsert any missing
                    const missing = targetSlugs.filter(s => !existingBySlug.has(s));
                    if (missing.length) {
                        const created = await Promise.all(
                            missing.map(async (s) => {
                                const name = targetNames.find(n => toKebabCase(n) === s) || s;
                                const c = await prisma.condition.upsert({
                                    where: {slug: s},
                                    update: {name, slug: s},
                                    create: {name, slug: s}
                                });
                                return c;
                            })
                        );
                        created.forEach(c => existingBySlug.set(c.slug, c.id));
                    }

                    // 5) Connect all
                    await prisma.condition.update({
                        where: {id: condition.id},
                        data: {
                            associatedConditions: {
                                set: [],
                                connect: targetSlugs
                                    .map(s => existingBySlug.get(s))
                                    .filter(Boolean)
                                    .map(id => ({id: id as string}))
                            }
                        }
                    });
                } else {
                    // Clear if none provided
                    await prisma.condition.update({
                        where: {id: condition.id},
                        data: {associatedConditions: {set: []}}
                    });
                }
            } catch (assocErr) {
                console.error("Error syncing associated conditions:", assocErr);
                // Non-fatal: keep creating/updating the condition even if association sync fails.
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
            const result = await prisma.$transaction(async (tx) => {
                // Ensure subdomain unique (CREATE only)
                const exists = await tx.organization.findUnique({where: {subdomain}});
                if (exists) throw Object.assign(new Error("This subdomain is already taken"), {code: "SUBDOMAIN_TAKEN"});

                const organization = await tx.organization.create({
                    data: {
                        name,
                        description,
                        subdomain,
                        yearFounded: founded || undefined,
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
                        verified: true, // beta default
                        metadata,
                        user: {connect: {id: session.user.id}},
                    },
                });

                // If user is a comendcare.com user, set role to support, not owner
                const membership = await tx.member.create({
                    data: {
                        userId: session.user.id,
                        email: session.user.email,
                        role: session.user.email?.toLowerCase().endsWith("@comendcare.com") ? "support" : "owner",
                        title,
                        organizationId: organization.id,
                    },
                });

                await tx.user.update({
                    where: {id: session.user.id},
                    data: {activeOrganizationId: organization.id},
                });

                return {organization, membership};
            });

            if (result.organization.verified && result.organization.published) {
                await addTypeSenseDocument(
                    `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                    (
                        process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                            ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                            : process.env.TYPESENSE_ADMIN_API_KEY
                    )!,
                    result.organization,
                    'organizations'
                );
            }

            await revalidateTag(
                `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
            )

            await runInProduction(() =>
                sendNewOrganizationEmail(
                    {
                        user: {
                            name: session.user.name,
                            email: session.user.email
                        },
                        organization: {
                            name: result.organization.name,
                            subdomain: result.organization.subdomain
                        }
                    }
                ).then(() => {
                    console.log("email sent")
                })
            )

            if (result.organization.verified && result.organization.published) {
                await writeRawEvent({
                    provider: "app",
                    eventType: "pag_profile_created",
                    externalId: result.organization.id,
                    occurredAt: new Date(),
                    payload: {
                        orgId: result.organization.id,
                        orgName: result.organization.name,
                        orgSubdomain: result.organization.subdomain,
                        orgImage: result.organization.image,
                        userId: session.user.id,
                        userName: session.user.name,
                    },
                });
            }

            return {organization: result.organization, membership: result.membership};
        } catch (error: any) {
            if (error.code === "P2002") {
                const target = error.meta?.target?.[0];

                switch (target) {
                    case "subdomain":
                        return {error: "This subdomain is already taken"};
                    case "customDomain":
                        return {error: "This custom domain is already taken"};
                    default:
                        return {error: `Unique constraint failed on ${target}`};
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
            if (key === "yearFounded") {
                data[key] = value.toString();
                return;
            }

            if ((key === "image" || key === "headerImage") && value === "") {
                data[key] = null;
                return;
            }

            if (key === "therapeuticsInDevelopment" || key === "therapeuticsOfInterest") {
                data[key] = value.toString().split(",");
                return;
            }

            if (key === "metadata") {
                data[key] = JSON.parse(value.toString());
                return;
            }

            const n = Number(value);
            data[key] = Number.isNaN(n) ? value : n; // preserves 0
        });

        try {
            // Get previous org for diffing
            const before = await prisma.organization.findUnique({
                where: {id: organization.id},
            });

            const response = await prisma.organization.update({
                where: {id: organization.id},
                data,
            });

            // update search index if needed
            if (response.verified && response.published) {
                await updateTypeSenseDocument(
                    `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                    (
                        process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
                        process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                            ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                            : process.env.TYPESENSE_ADMIN_API_KEY
                    )!,
                    response,
                    "organizations"
                );
            }

            // build diff
            const changedFields: string[] = [];
            const changes: Record<string, { before: unknown; after: unknown }> = {};

            if (before) {
                for (const key of Object.keys(data)) {
                    const beforeVal = (before as any)[key];
                    const afterVal = (response as any)[key];
                    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
                        changedFields.push(key);
                        changes[key] = {before: beforeVal, after: afterVal};
                    }
                }
            }

            const session = await getSession();

            // await writeRawEvent({
            //     provider: "app",
            //     eventType: "org_updated",
            //     externalId: response.id,
            //     occurredAt: new Date(),
            //     payload: {
            //         orgId: response.id,
            //         orgName: response.name ?? undefined,
            //         userId: session?.user.id,
            //         userName: session?.user.name,
            //         changedFields: changedFields.length ? changedFields : undefined,
            //         changes: Object.keys(changes).length ? changes : undefined,
            //     },
            // });

            return response;
        } catch (error: any) {
            console.error("Error updating organization:", error.message);
            throw new Error(error.message || "Failed to update organization.");
        }
    },
    ['owner', 'support']
);

export const deleteOrganization = withOrganizationAuth(
    async (organization: Organization) => {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return {success: false, error: "Not authenticated"};
        }

        const userId = session.user.id;

        // Compute the next active org for THIS user (owner who triggered deletion)
        const remainingMemberships = await prisma.member.findMany({
            where: {
                userId,
                organizationId: {not: organization.id},
            },
            select: {organizationId: true, createdAt: true},
            orderBy: {createdAt: "asc"}, // or "desc" if you prefer “most recent”
        });

        const nextOrgId: string | null =
            remainingMemberships.length > 0 ? remainingMemberships[0].organizationId : null;

        // Prepare side-effects (e.g., Typesense)
        const typeSenseDelete = deleteTypeSenseDocument(
            `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
            (
                process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
                process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                    ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                    : process.env.TYPESENSE_ADMIN_API_KEY
            )!,
            organization.id,
            "organizations"
        );

        // Run everything that touches DB in a single transaction
        const [deletedOrg] = await prisma.$transaction([
            prisma.organization.delete({where: {id: organization.id}}),
            prisma.user.update({
                where: {id: userId},
                data: {activeOrganizationId: nextOrgId},
            }),
        ])
            .then(async ([orgDeleteResult, _userUpdate]) => {
                await Promise.all([
                    typeSenseDelete,
                    prisma.condition.deleteMany({
                        where: {
                            organizations: {some: {id: organization.id}},
                        },
                    }),
                ]);
                return [orgDeleteResult];
            })
            .catch((err) => {
                console.error("Delete transaction failed", err);
                throw err;
            });

        // AFTER deleting the org, before revalidatePath:
        const affectedUsers = await prisma.user.findMany({
            where: {activeOrganizationId: organization.id},
            select: {id: true},
        });

        // For each affected user, pick their next membership (excluding the deleted org)
        await Promise.all(
            affectedUsers.map(async (u) => {
                const next = await prisma.member.findFirst({
                    where: {userId: u.id, organizationId: {not: organization.id}},
                    orderBy: {createdAt: "asc"},
                    select: {organizationId: true},
                });

                await prisma.user.update({
                    where: {id: u.id},
                    data: {activeOrganizationId: next?.organizationId ?? null},
                });
            })
        );

        // Revalidate org-scoped pages
        for (const p of PATHS) {
            revalidatePath(p);
        }

        return {success: true, data: deletedOrg};
    },
    ["owner", 'support']
);

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

        // Utility to compare (handles objects/arrays by JSON stringifying)
        const isEqual = (a: unknown, b: unknown) => {
            const ja = typeof a === "object" ? JSON.stringify(a) : a;
            const jb = typeof b === "object" ? JSON.stringify(b) : b;
            return ja === jb;
        };

        // Only consider fields you allow to be updated here
        const updatableKeys = ["title", "description", "content", "modalities", "metadata"] as const;

        // Compute change set (based on incoming "data" vs current "roadmap")
        const changedFields: string[] = [];
        const changes: Record<string, { before: unknown; after: unknown }> = {};

        for (const key of updatableKeys) {
            if (typeof data[key] !== "undefined") {
                const beforeVal = (roadmap as any)[key];
                const afterVal = (data as any)[key];
                if (!isEqual(beforeVal, afterVal)) {
                    changedFields.push(key);
                    changes[key] = {before: beforeVal, after: afterVal};
                }
            }
        }

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

            // await writeRawEvent({
            //     provider: "app",
            //     eventType: "org_research_plan_updated",
            //     externalId: roadmap.id, // back-reference for idempotency
            //     occurredAt: new Date(),
            //     payload: {
            //         orgId: roadmap.organization?.id ?? organizationId,
            //         orgName: roadmap.organization?.name ?? undefined,
            //         roadmapId: roadmap.id,
            //         title: response.title ?? roadmap.title,
            //         published: response.published, // boolean
            //         // actor
            //         userId: session.user.id,
            //         userName: session.user.name,
            //         // change details
            //         changedFields: changedFields.length ? changedFields : undefined,
            //         changes: Object.keys(changes).length ? changes : undefined,
            //     },
            // });

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
    ['owner', 'support']
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

            for (const p of PATHS) {
                revalidatePath(p);
            }

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
        email: string,
        role: string = "member",
        ip: string,
    ): Promise<ApiResponse<any>> => {
        const session = await getSession();

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

            const invitation = await prisma.invitation.create({
                data: {
                    email: lowerCaseEmail,
                    role: role,
                    organizationId: organization.id
                }
            }).then((res) => {
                return res
            })

            await customerIOTrack({
                userId: session.user.id,
                event: 'organization_invitation_sent',
                timestamp: new Date(),
                // Keep org / invite-specific data on the EVENT, not person traits (users can have multiple invites)
                properties: {
                    invitation_id: invitation.id,
                    organization_id: organization.id,
                    organization_name: organization.name,
                    invitee_email: lowerCaseEmail,
                    role: role,
                    inviter_user_id: session.user.id,
                },
            });

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
    },
    ['owner', 'support'] // this function is only available to owners of this organization
)

export const approveMemberRequestAndCreateMember = withOrganizationAuth(
    async (organization: Organization, memberRequest: MemberRequestWithUserAndOrganization): Promise<ApiResponse<any>> => {
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

            revalidatePath("/app/team")
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
    ['owner', 'support']
)

export const deleteMemberRequest = withUserAuth(
    async (user: User, memberRequest: MemberRequestWithUserAndOrganization) => {
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
    async (organization: Organization, memberRequest: MemberRequestWithUserAndOrganization): Promise<ApiResponse<any>> => {
        if (!memberRequest) {
            throw new Error("Invalid member request");
        }

        try {
            // Ensure the composite key is valid or fallback to another unique identifier like `id`
            const deletedMemberRequest = await prisma.memberRequest.delete({
                where: {
                    id: memberRequest.id
                },
                include: {
                    user: true
                }
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

            revalidatePath("/app/team")
            revalidatePath("/app/profile")

            return {success: true, data: deletedMemberRequest};

        } catch (error) {
            console.error("Error deleting member request:", error);
            return {success: false, error: "Failed to delete member request."};
        }
    },
    ['owner', 'support']
)

export const deleteInvitation = withOrganizationAuth(
    async (_: Organization, invitation: Invitation): Promise<ApiResponse<any>> => {
        const session = await getSession();

        if (!invitation) {
            throw new Error("Invalid invitation");
        }

        try {
            try {
                await customerIOTrack({
                    userId: session?.user.id ? undefined : undefined, // keep person traits clean; attribution is optional here
                    event: 'organization_invitation_revoked',
                    timestamp: new Date(),
                    properties: {
                        invitation_id: invitation.id,           // 🔑 correlate to the sent event
                        organization_id: invitation.organizationId,
                        invitee_email: invitation.email,
                        role: invitation.role,
                        revoked_by_user_id: await session?.user.id, // the admin doing the delete
                        reason: 'org_deleted_invitation',
                    },
                });
            } catch (e) {
                console.error('[CIO] track organization_invitation_revoked failed:', e);
            }

            // Ensure the composite key is valid or fallback to another unique identifier like `id`
            const deletedInvitation = await prisma.invitation.delete({
                where: {
                    id: invitation.id
                },
            });

            if (!deletedInvitation) {
                return {success: false, error: "Failed to delete invitation. Request not found."};
            }

            revalidatePath("/app/team")
            revalidatePath("/app/profile")

            return {success: true, data: deletedInvitation};

        } catch (error) {
            console.error("Error deleting invitation:", error);
            return {success: false, error: "Failed to delete invitation."};
        }
    },
    ['owner', 'support']
)

export const declineAndDeleteInvitation = withAuth(
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

            if (invitation?.email !== session.user.email) {
                return {
                    success: false,
                    error: "Error declining invitation: active user email does not match the invite email."
                }
            }

            try {
                await customerIOTrack({
                    userId: session.user.id, // the person performing the decline
                    event: 'organization_invitation_declined',
                    timestamp: new Date(),
                    properties: {
                        invitation_id: invitation.id,
                        organization_id: invitation.organizationId,
                        invitee_email: invitation.email,
                        role: invitation.role,
                    },
                });
            } catch (e) {
                console.error('[CIO] track organization_invitation_declined failed:', e);
            }

            // Ensure the composite key is valid or fallback to another unique identifier like `id`
            const deletedInvitation = await prisma.invitation.delete({
                where: {
                    id: invitation.id
                },
            });

            if (!deletedInvitation) {
                return {success: false, error: "Failed to delete invitation. Request not found."};
            }

            revalidatePath("/app/team")
            revalidatePath("/app/profile")

            return {success: true, data: deletedInvitation};

        } catch (error) {
            console.error("Error deleting invitation:", error);
            return {success: false, error: "Failed to delete invitation."};
        }
    }
)

// Invite user function with updated Organization model
export const leaveOrganization = withOrganizationAuth(
    async (organization: Organization) => {
        const session = await getSession();
        if (!session?.user?.id) {
            return {success: false, error: "Session not found."};
        }

        const userId = session.user.id;

        try {
            // Fetch the caller's membership + role
            const currentMember = await prisma.member.findUnique({
                where: {
                    userId_organizationId: {userId, organizationId: organization.id},
                },
                select: {id: true, role: true},
            });
            if (!currentMember) {
                return {success: false, error: "Membership not found."};
            }

            // If owner, ensure not the last owner
            if (currentMember.role === "owner" || currentMember.role === "support") {
                const ownerCount = await prisma.member.count({
                    where: {
                        organizationId: organization.id, role: {
                            in: ["owner", "support"]
                        }
                    },
                });
                if (ownerCount <= 1) {
                    return {
                        success: false,
                        error:
                            "You are the last owner and cannot leave the organization. Assign another owner first.",
                    };
                }
            }

            // Get the user's current active org and compute "next" org BEFORE deletion
            const user = await prisma.user.findUnique({
                where: {id: userId},
                select: {activeOrganizationId: true},
            });

            const nextMembership = await prisma.member.findFirst({
                where: {
                    userId,
                    organizationId: {not: organization.id},
                },
                orderBy: {createdAt: "asc"}, // or "desc" for most-recent
                select: {organizationId: true},
            });

            // Delete membership and (conditionally) update active org
            const [deletedMembership] = await prisma.$transaction([
                prisma.member.delete({
                    where: {
                        userId_organizationId: {userId, organizationId: organization.id},
                    },
                }),
                // Update activeOrganizationId only if user was pointing to this org
                ...(user?.activeOrganizationId === organization.id
                    ? [
                        prisma.user.update({
                            where: {id: userId},
                            data: {
                                activeOrganizationId: nextMembership?.organizationId ?? null,
                            },
                        }),
                    ]
                    : []),
            ]);

            // Revalidate org-scoped pages and any UI that reflects org state
            for (const p of PATHS) {
                revalidatePath(p);
            }

            return {success: true, data: deletedMembership};
        } catch (error) {
            // your logger
            logError("Error leaving organization", error);
            return {success: false, error: "Internal server error"};
        }
    }
);

export const updateMemberWithMemberPermission = withOrganizationAuth(
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

            const updatedMember = await prisma.member.update({
                where: {id: membershipId},
                include: {user: true},
                data: {
                    title: data.title // members can only update the title
                }
            });

            revalidatePath("/app/team");
            revalidatePath("/app/profile");

            return {success: true, data: updatedMember};
        } catch (error: any) {
            logError("Error updating membership", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const updateMemberWithOwnerPermission = withOrganizationAuth(
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
                targetMember.role === "owner" || targetMember.role === "support" &&
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

            revalidatePath("/app/team");
            revalidatePath("/app/profile");

            return {success: true, data: updatedMember};
        } catch (error: any) {
            logError("Error updating membership", error);
            return {success: false, error: "Internal server error"};
        }
    },
    ["owner", 'support']
);

// Invite user function with updated Organization model
export const deleteMember = withOrganizationAuth(
    async (_: Organization, membershipId: string) => {
        const session = await getSession();
        if (!session) return {success: false, error: "Session not found."};

        try {
            // 1) Delete the membership and fetch needed fields
            const member = await prisma.member.delete({
                where: {id: membershipId},
                include: {
                    user: {select: {id: true, activeOrganizationId: true, name: true, email: true}},
                    organization: {select: {id: true, name: true, image: true}},
                },
            });

            if (!member) return {success: false, error: "Membership not found"};

            // 2) If the revoked user's active org was this org, pick a new one (or null)
            if (member.user.activeOrganizationId === member.organization.id) {
                const nextMembership = await prisma.member.findFirst({
                    where: {
                        userId: member.user.id,
                        organizationId: {not: member.organization.id},
                    },
                    orderBy: {createdAt: "asc"}, // or "desc" if you prefer most-recent
                    select: {organizationId: true},
                });

                await prisma.user.update({
                    where: {id: member.user.id},
                    data: {activeOrganizationId: nextMembership?.organizationId ?? null},
                });
            }

            // 3) Notify (non-blocking)
            sendMemberDeletedEmail({
                name: member.user.name,
                email: member.email,
                organizationName: member.organization.name || "",
                organizationImage: member.organization.image || "",
            }).catch(() => {
            });

            // 4) Revalidate pages that may depend on org context
            for (const p of PATHS) revalidatePath(p);

            return {success: true, data: member};
        } catch (error: any) {
            logError("Error deleting membership", error);
            return {success: false, error: "Internal server error"};
        }
    },
    ["owner", 'support']
);

// Invite user function with updated Organization model
export const deleteUser = withAuth(
    async () => {
        const session = await getSession();

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

            void cioDeleteUser(user.id, { suppress: true });

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

            revalidatePath("/app/notifications")

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

export const createRequestComment = withAuth(
    async (text: string, requestId: string) => {
        const session = await getSession()

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            const comment = await prisma.requestComment.create({
                include: {
                    materialAndDataAccessRequest: {
                        select: {
                            id: true,
                            title: true,
                            organization: {select: {id: true, name: true, image: true, subdomain: true}},
                        },
                    },
                    author: {select: {id: true, name: true}},
                },
                data: {
                    materialAndDataAccessRequest: {connect: {id: requestId}},
                    author: {connect: {id: session.user.id}},
                    text,
                },
            });

            if (!comment) {
                return {success: false, error: "Failed to create comment."};
            }

            await writeRawEvent({
                provider: "app",
                eventType: "tool_request_comment_created",
                externalId: comment.id,
                occurredAt: new Date(),
                payload: {
                    requestId: comment.materialAndDataAccessRequest.id,
                    commentId: comment.id,
                    orgId: comment.materialAndDataAccessRequest.organization.id,
                    orgName: comment.materialAndDataAccessRequest.organization.name,
                    orgSubdomain: comment.materialAndDataAccessRequest.organization.subdomain,
                    orgImage: comment.materialAndDataAccessRequest.organization.image,
                    userId: comment.author.id,
                    userName: comment.author.name ?? session.user.name,
                    text, // full text; register trims to preview
                },
            });

            revalidatePath("/requests")
            return {success: true, data: comment};
        } catch (error: any) {
            logError("Error creating comment", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const deleteRequestComment = withAuth(
    async (commentId: string) => {
        const session = await getSession()

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            const comment = prisma.requestComment.delete({
                where: {
                    id: commentId
                }
            })

            if (!comment) {
                return {success: false, error: "Failed to delete comment."};
            }

            revalidatePath("/requests")
            return {success: true, data: comment};
        } catch (error: any) {
            logError("Error deleting comment", error);
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
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            subdomain: true,
                        },
                    }
                }
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
                        organizationId: invitation.organization.id,
                        role: invitation.role || "member",
                        userId: session.user.id,
                    },
                }),
                prisma.invitation.delete({
                    where: {
                        id: invitationId,
                    },
                }),
                prisma.user.update({
                    where: {id: session.user.id},
                    data: {activeOrganizationId: invitation.organization.id},
                })
            ]);

            await customerIOTrack({
                userId: session.user.id ?? undefined,   // if you have it
                event: 'organization_invitation_accepted',
                timestamp: new Date(),
                properties: {
                    invitation_id: invitation.id,        // 🔑 must match the “sent” event
                    organization_id: invitation.organizationId,
                    invitee_email: invitation.email,
                },
            });

            await writeRawEvent({
                provider: "app",
                eventType: "user_accepted_organization_invitation", // batch payload handled by your register
                occurredAt: new Date(),
                payload: {
                    orgId: invitation.organization.id,
                    orgName: invitation.organization.name,
                    orgSubdomain: invitation.organization.subdomain,
                    orgImage: invitation.organization.image,
                    userId: session.user.id,
                    userName: session.user.name,
                    userEmail: session.user.email,
                },
            });

            revalidatePath("/app/team")
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
            // ---------- Parse FormData (unchanged) ----------
            const data: Record<string, any> = {};
            formData.forEach((value, key) => {
                const str = value.toString();

                if (key === "metadata") {
                    data[key] = JSON.parse(str);
                    return;
                }
                if (str === "" || str === "null") {
                    data[key] = null;
                    return;
                }
                if (!isNaN(Number(str))) {
                    data[key] = Number(str);
                    return;
                }
                if (str.startsWith("[")) {
                    try {
                        data[key] = JSON.parse(str);
                    } catch {
                        data[key] = str;
                    }
                    return;
                }
                data[key] = str;
            });

            // Utility: normalize associated condition inputs to slugs
            const normalizeSlugs = (raws?: string[]) => {
                if (!raws) return undefined;
                const toSlug = (s: string) => toKebabCase(String(s || "").trim());
                return Array.from(new Set(raws.map(toSlug).filter(Boolean)));
            };

            const link = await prisma.conditionToOrganization.findFirst({
                where: {organizationId: organization.id},
                select: {conditionId: true, condition: {select: {slug: true}}},
            });

            // Pull out incoming associated condition slugs before scalar updates
            const incomingRaw = data.associatedConditions as string[] | undefined;
            delete data.associatedConditions;
            const incomingSlugs = normalizeSlugs(incomingRaw);

            // Helper to upsert any missing conditions by slug and return {slug -> id}
            const ensureConditionsBySlugs = async (slugs: string[]) => {
                if (!slugs.length) return new Map<string, string>();

                const existing = await prisma.condition.findMany({
                    where: {slug: {in: slugs}},
                    select: {id: true, slug: true},
                });
                const bySlug = new Map(existing.map(e => [e.slug, e.id]));

                const missing = slugs.filter(s => !bySlug.has(s));
                if (missing.length) {
                    for (const slug of missing) {
                        const nameGuess = slug.replace(/-/g, " ").replace(/\s+/g, " ").trim();

                        // 1) If a condition with this *name* already exists, use it
                        const byName = await prisma.condition.findUnique({
                            where: {name: nameGuess},
                            select: {id: true, slug: true},
                        });
                        if (byName) {
                            bySlug.set(slug, byName.id);
                            continue;
                        }

                        // 2) Otherwise create a fresh one (slug is the unique key)
                        const created = await prisma.condition.create({
                            data: {slug, name: nameGuess},
                            select: {id: true, slug: true},
                        });
                        bySlug.set(created.slug, created.id);
                    }
                }

                return bySlug;
            };

            // Helper to replace Condition⇄Condition associations and return new target IDs
            const replaceAssociatedConditions = async (
                conditionId: string,
                targetSlugs: string[],
                selfSlug?: string | null
            ): Promise<string[]> => {
                const filteredSlugs = (targetSlugs || []).filter((s) => s && s !== selfSlug);
                const bySlug = await ensureConditionsBySlugs(filteredSlugs);
                const connectIds = Array.from(bySlug.values()).map((id) => ({id}));

                await prisma.condition.update({
                    where: {id: conditionId},
                    data: {
                        associatedConditions: {
                            set: [],
                            connect: connectIds,
                        },
                    },
                });

                return Array.from(bySlug.values());
            };

            // Helper to compute diff and sync ConditionToOrganization for associated conditions
            const syncOrgLinksForAssociatedConditions = async (
                orgId: string,
                prevIds: string[],
                nextIds: string[]
            ) => {
                const prevSet = new Set(prevIds);
                const nextSet = new Set(nextIds);
                const added = nextIds.filter((id) => !prevSet.has(id));
                const removed = prevIds.filter((id) => !nextSet.has(id));

                if (added.length) {
                    await prisma.conditionToOrganization.createMany({
                        data: added.map((conditionId) => ({conditionId, organizationId: orgId})),
                        skipDuplicates: true,
                    });
                }

                if (removed.length) {
                    await prisma.conditionToOrganization.deleteMany({
                        where: {
                            organizationId: orgId,
                            conditionId: {in: removed},
                        },
                    });
                }
            };

            // ---------- CREATE or ATTACH branch ----------
            if (!link?.conditionId) {
                const requestedId: string | undefined = (data as any).id ?? (data as any).conditionId;
                const requestedSlug: string | undefined =
                    (data as any).slug ?? (data.name ? toKebabCase(String(data.name)) : undefined);

                // Find existing by id or slug
                let existing =
                    requestedId
                        ? await prisma.condition.findUnique({where: {id: requestedId}})
                        : requestedSlug
                            ? await prisma.condition.findUnique({where: {slug: requestedSlug}})
                            : null;

                let condition: Condition;

                if (existing) {
                    condition = await prisma.condition.update({where: {id: existing.id}, data});
                } else {
                    const slug = requestedSlug ?? toKebabCase(String(data.name || ""));

                    // If a condition with this name already exists, use that one
                    if (data.name) {
                        const byName = await prisma.condition.findUnique({where: {name: data.name}});
                        if (byName) {
                            condition = await prisma.condition.update({
                                where: {id: byName.id},
                                data, // safe: you’re updating the existing record
                            });
                        } else {
                            condition = await prisma.condition.create({
                                data: {...data, slug, name: data.name ?? slug.replace(/-/g, " ")},
                            });
                        }
                    } else {
                        condition = await prisma.condition.create({
                            data: {...data, slug, name: slug.replace(/-/g, " ")},
                        });
                    }
                }

                // Link org → primary condition
                await prisma.conditionToOrganization.create({
                    data: {conditionId: condition.id, organizationId: organization.id},
                });

                // Replace associated conditions (if provided)
                let nextAssocIds: string[] = [];
                if (incomingSlugs && incomingSlugs.length) {
                    nextAssocIds = await replaceAssociatedConditions(
                        condition.id,
                        incomingSlugs,
                        condition.slug ?? null
                    );
                }

                // Compute prev (none for a fresh create) vs next, and sync Org links too
                await syncOrgLinksForAssociatedConditions(organization.id, [], nextAssocIds);

                revalidatePath("/app/profile");
                return {success: true, data: condition};
            }

            // ---------- UPDATE branch ----------
            let conditionId = link.conditionId;
            let thisSlug = link.condition?.slug ?? null;

            // Fetch previous associated (for diff) from the record we will actually update/use
            const getAssocIds = async (id: string) => {
                const prev = await prisma.condition.findUnique({
                    where: {id},
                    select: {associatedConditions: {select: {id: true}}, slug: true, name: true},
                });
                return {
                    ids: (prev?.associatedConditions ?? []).map((c) => c.id),
                    slug: prev?.slug ?? null,
                    name: prev?.name ?? null,
                };
            };

            // Pull out possible name/slug from incoming data
            const {name: incomingName, slug: incomingSlug, ...restData} = data ?? {};

            let targetConditionId = conditionId;

            // If a conflicting name is requested, re-point the org to the canonical row
            if (incomingName) {
                const byName = await prisma.condition.findUnique({
                    where: {name: incomingName},
                    select: {id: true},
                });

                if (byName && byName.id !== conditionId) {
                    // Move this organization's link to the existing condition with that name
                    await prisma.conditionToOrganization.upsert({
                        where: {
                            // uses @@unique([conditionId, organizationId]) compound unique
                            conditionId_organizationId: {conditionId, organizationId: organization.id},
                        },
                        update: {conditionId: byName.id},
                        create: {conditionId: byName.id, organizationId: organization.id},
                    });

                    targetConditionId = byName.id;
                }
            }

            // Re-fetch prev associations from the actual target row
            const {ids: prevAssocIds, slug: targetSlug} = await getAssocIds(targetConditionId);

            // Decide what scalar data we can safely apply:
            // - If we re-pointed to another record, do NOT try to change its slug arbitrarily
            // - Only allow changing 'name' when it's the same record (no conflict)
            const safeScalarData: Record<string, any> = {...restData};

            if (incomingName) {
                if (targetConditionId === conditionId) {
                    // safe to update name on the same record
                    safeScalarData.name = incomingName;
                } // else: we re-pointed → don't change the target row's name
            }

            // Protect slug unless you explicitly support slug changes; ignore incomingSlug by default
            // If you DO want to allow slug changes on the same record, uncomment:
            // if (incomingSlug && targetConditionId === conditionId) safeScalarData.slug = incomingSlug;

            const updated = await prisma.condition.update({
                where: {id: targetConditionId},
                data: safeScalarData,
            });

            // Replace associations based on incoming slugs (preserve prior semantics)
            let nextAssocIds = prevAssocIds;
            if (incomingSlugs) {
                nextAssocIds = await replaceAssociatedConditions(targetConditionId, incomingSlugs, targetSlug);
            }

            // Sync Org↔AssociatedCondition links using diff
            await syncOrgLinksForAssociatedConditions(organization.id, prevAssocIds, nextAssocIds);

            revalidatePath("/app/profile");
            return {success: true, data: updated};
        } catch (error: any) {
            console.error("Error in updateCondition:", error);
            return {success: false, error: error.message || "Failed to update or create condition."};
        }
    }
);

export const deleteAsset = withOrganizationAuth(
    async (_: Organization, toolId: string) => {
        try {
            const response = await prisma.tool.delete({
                where: {id: toolId},
                include: {
                    organization: {include: {conditions: {include: {condition: true}}}},
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


export const deleteBiosample = withOrganizationAuth(
    async (_: Organization, id: string) => {
        try {
            const response = await prisma.biosample.delete({
                where: {id},
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

export const deleteDiseaseModel = withOrganizationAuth(
    async (_: Organization, id: string) => {
        try {
            const response = await prisma.diseaseModel.delete({
                where: {id}
            })

            return response
        } catch (error: any) {
            console.error("Error deleting tool:", error.message);
            throw new Error(error.message || "Failed to delete tool.");
        }
    }
)

export const setDiseaseModelsVisibility = withOrganizationAuth(
    async (organization: Organization, ids: string[], isPrivate: boolean) => {
        try {
            if (!organization.id) throw new Error("No organization id provided.");

            const updatedDiseaseModels = await prisma.diseaseModel.updateMany({
                where: {
                    id: {in: ids}
                },
                data: {
                    private: isPrivate
                }
            })

            revalidatePath("/app/tools/disease-models")

            return updatedDiseaseModels
        } catch (error: any) {
            console.error("Error updating disease models:", error.message);
            throw new Error(error.message || "Failed to update disease models.");
        }
    }
)

export const updateDiseaseModel = withOrganizationAuth(
    async (organization: Organization, data: z.infer<typeof editDiseaseModelForm>) => {
        try {
            if (!organization.id) throw new Error("No organization id provided.")
            if (!data.id) throw new Error("No biosample id provided.")

            let foundInstitution = undefined
            let foundCompany = undefined

            if (data.storageFacility && data.storageFacility.length > 0) {
                foundInstitution = await prisma.institution.findUnique({
                    where: {
                        id: data?.storageFacility?.[0]?.value
                    }
                })
                foundCompany = await prisma.company.findUnique({
                    where: {
                        id: data?.storageFacility?.[0]?.value
                    }
                })
            }

            const diseaseModelData: any = {
                id: data.id,
                types: data.types ? data.types.map(type => type.value) : undefined,
                metadata: {
                    otherTypeDetails: data.otherTypeDetails
                } as JsonObject,
                private: data.isPrivate !== undefined && data.isPrivate !== null ? data.isPrivate : true,
                description: data.description,
                gene: data.genes && data.genes.length > 0 ? data.genes[0] : undefined,
                institution: foundInstitution,
                company: foundCompany,
                milestones: (data.milestones || []).map((m) => ({
                    milestoneId: m.id,
                    biosampleId: data.id || "",
                })),
                attachments: data.attachments,
                contacts: data.contacts,
                genotype: data.genotype,
                strain: data.strain,
                notes: data.notes
            }

            const newDiseaseModel = await prisma.diseaseModel.update({
                where: {id: data.id},
                include: {
                    contacts: true,
                    attachments: true,
                    organization: {include: {conditions: {include: {condition: true}}}},
                    gene: true,
                    // genes: true,
                    institution: true,
                    company: true,
                },
                data: {
                    ...diseaseModelData,
                    private: diseaseModelData.private !== undefined && diseaseModelData.private !== null ? diseaseModelData.private : false,
                    organization: {connect: {id: organization.id}},
                    metadata: diseaseModelData.metadata as InputJsonObject,
                    ...(diseaseModelData.gene
                        ? ({gene: {connect: {symbol: diseaseModelData.gene.value.toUpperCase()}}})
                        : {gene: {disconnect: true}}),
                    ...(diseaseModelData.attachments ? (
                        {
                            attachments: {
                                deleteMany: {}, // clear all existing attachments
                                createMany: {
                                    data: (diseaseModelData?.attachments || []).map((attachment: any) => ({
                                        link: attachment.link,
                                        ...(attachment.name ? {name: attachment.name} : undefined)
                                    }))
                                }
                            }
                        }
                    ) : undefined),
                    ...(diseaseModelData.contacts ? (
                        {
                            contacts: {
                                deleteMany: {},
                                createMany: {
                                    data: (diseaseModelData?.contacts || []).map((contact: any) => ({
                                        name: contact.name,
                                        email: contact.email,
                                        ...(contact.role ? {role: contact.role} : undefined),
                                        ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                                    }))
                                }
                            }
                        }
                    ) : undefined),
                    ...(diseaseModelData.milestones ? (
                        {
                            milestones: {
                                deleteMany: {},
                                create: (diseaseModelData.milestones || []).map((milestone: any) => ({
                                    milestone: {
                                        connect: {id: milestone.milestoneId}
                                    }
                                }))
                            },
                        }
                    ) : undefined),
                    ...(diseaseModelData.institution 
                        ? {institution: {connect: {id: diseaseModelData.institution.id}}} // if institution exists in database, connect
                        : {institution: {disconnect: true}}), // if institution does not exist in database, disconnect
                    ...(diseaseModelData.company 
                        ? {company: {connect: {id: diseaseModelData.company.id}}} // if company exists in database, connect
                        : {company: {disconnect: true}}), // if company does not exist in database, disconnect
                },
            })

            const response = await prisma.diseaseModel.findUnique({where: {id: data.id}})

            revalidatePath("/app/tools/disease-models")

            return response
        } catch (error: any) {
            console.error("Error creating disease model:", error.message);
            throw new Error(error.message || "Failed to create disease model.");
        }
    }
)

export const createDiseaseModel = withOrganizationAuth(
    async (organization: Organization, data: z.infer<typeof editDiseaseModelForm>) => {
        try {
            if (!organization.id) throw new Error("No organization id provided.")

            let foundInstitution = undefined
            let foundCompany = undefined

            if (data.storageFacility && data.storageFacility.length > 0) {
                foundInstitution = await prisma.institution.findUnique({
                    where: {
                        id: data?.storageFacility?.[0].value
                    }
                })
                foundCompany = await prisma.company.findUnique({
                    where: {
                        id: data?.storageFacility?.[0].value
                    }
                })
            }

            const diseaseModelData: any = {
                id: data.id,
                types: (data.types || []).map(type => type.value),
                metadata: {
                    otherTypeDetails: data.otherTypeDetails
                } as JsonObject,
                private: data.isPrivate !== undefined && data.isPrivate !== null ? data.isPrivate : true,
                description: data.description,
                gene: data.genes && data.genes.length > 0 ? data.genes[0] : undefined,
                institution: foundInstitution,
                company: foundCompany,
                milestones: (data.milestones || []).map((milestone) => {
                    return ({
                        milestoneId: milestone.id,
                        biosampleId: data.id || '',
                    })
                }),
                attachments: data.attachments,
                contacts: data.contacts,
                genotype: data.genotype,
                strain: data.strain,
                notes: data.notes,
            }

            const response = await prisma.diseaseModel.create({
                include: {
                    attachments: true,
                    contacts: true,
                    organization: {include: {conditions: {include: {condition: true}}}},
                    gene: true,
                    // genes: true,
                    institution: true,
                    company: true,
                },
                data: {
                    ...diseaseModelData,
                    // create with the given id if it's available. This is useful for situations like 'undo'
                    // where we're re-creating a pre-existing tool, and the id should match the id in our zustand state
                    id: diseaseModelData.id || generateToolNanoid(),
                    private: diseaseModelData.private || false,
                    organization: {connect: {id: organization.id}},
                    metadata: diseaseModelData.metadata as InputJsonObject,
                    ...(diseaseModelData.gene
                        ? ({gene: {connect: {symbol: diseaseModelData.gene.value.toUpperCase()}}})
                        : undefined),
                    ...(diseaseModelData.institution 
                        ? ({institution: {connect: {id: diseaseModelData.institution.id}}}) // if institution exists in database, connect
                        : ({institution: undefined})), // if institution does not exist in database, don't connect
                    ...(diseaseModelData.company 
                        ? ({company: {connect: {id: diseaseModelData.company.id}}}) // if company exists in database, connect
                        : ({company: undefined})), // if company does not exist in database, don't connect
                    attachments: {
                        createMany: {
                            data: (diseaseModelData?.attachments || []).map((attachment: any) => ({
                                link: attachment.link,
                                ...(attachment.name ? {name: attachment.name} : undefined)
                            }))
                        }
                    },
                    contacts: {
                        createMany: {
                            data: (diseaseModelData?.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                email: contact.email,
                                ...(contact.role ? {role: contact.role} : undefined),
                                ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                            }))
                        }
                    },
                    milestones: {
                        create: (diseaseModelData.milestones || []).map((milestone: any) => ({
                            milestone: {
                                connect: {id: milestone.milestoneId}
                            }
                        }))
                    },
                }
            })

            revalidatePath("/app/tools/disease-models")

            return response
        } catch (error: any) {
            console.error("Error creating disease model:", error.message);
            throw new Error(error.message || "Failed to create diseaseModel.");
        }
    }
)

function generateToolNanoid() {
    const id = nanoid(12) // generate 12 char
    console.log(`new donor id`, id.slice(0, 4) + '-' + id.slice(4, 8) + '-' + id.slice(8))
    return (id.slice(0, 4) + '-' + id.slice(4, 8) + '-' + id.slice(8))
}

function generateDonorNanoid() {
    const id = nanoid(8) // generate 8 char
    console.log(`new donor id`, id.slice(0, 4) + '-' + id.slice(4))
    return (id.slice(0, 4) + '-' + id.slice(4))
}

export const createClinicalDataset = withOrganizationAuth(
    async (organization: Organization, data: z.infer<typeof editDataToolForm>) => {
        const session = await getSession()
        try {
            if (!organization.id) {
                throw new Error("No organization id provided.")
            }

            let foundInstitution = undefined
            let foundCompany = undefined

            if (data.storageFacility && data.storageFacility.length > 0) {
                foundInstitution = await prisma.institution.findUnique({
                    where: {
                        id: data?.storageFacility?.[0].value
                    }
                })
                foundCompany = await prisma.company.findUnique({
                    where: {
                        id: data?.storageFacility?.[0].value
                    }
                })
            }

            const dataToolData: any = {
                id: data.id,
                title: data.title,
                types: (data.types || []).map(type => type.value),
                metadata: {otherTypeDetails: data.otherTypeDetails} as JsonObject,
                private: data.isPrivate !== undefined && data.isPrivate !== null ? data.isPrivate : true,
                milestones: (data.milestones || []).map((milestone) => {
                    return ({
                        milestoneId: milestone.id,
                        biosampleId: data.id || '',
                    })
                }),
                description: data.description,
                attachments: data.attachments,
                contacts: data.contacts,
                // gene: data.genes && data.genes.length > 0 ? data.genes[0] : undefined,
                genes: (data.genes || []).map(gene => gene.value),
                ...(data.cohortSize !== undefined && data.cohortSize !== null ? {cohortSize: JSON.parse(data.cohortSize)} : undefined),
                institution: foundInstitution,
                company: foundCompany,
                notes: data.notes,
            }

            const response = await prisma.tool.create({
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: {
                                include: {types: {include: {milestoneType: true}}}
                            }
                        }
                    },
                    institution: true,
                    company: true,
                },
                data: {
                    ...dataToolData,
                    // create with the given id if it's available. This is useful for situations like 'undo'
                    // where we're re-creating a pre-existing tool, and the id should match the id in our zustand state
                    id: dataToolData.id || generateToolNanoid(),
                    attachments: {
                        createMany: {
                            data: (dataToolData?.attachments || []).map((attachment: any) => ({
                                link: attachment.link,
                                ...(attachment.name ? {name: attachment.name} : undefined)
                            }))
                        }
                    },
                    contacts: {
                        createMany: {
                            data: (dataToolData?.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                email: contact.email,
                                ...(contact.role ? {role: contact.role} : undefined),
                                ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                            }))
                        }
                    },
                    milestones: {
                        create: (dataToolData.milestones || []).map((milestone: any) => ({
                            milestone: {
                                connect: {id: milestone.milestoneId}
                            }
                        }))
                    },
                    private: dataToolData.private || false,
                    organization: {connect: {id: organization.id}},
                    metadata: dataToolData.metadata as InputJsonObject,
                    ...(dataToolData.gene
                        ? ({gene: {connect: {symbol: dataToolData.gene.value.toUpperCase()}}})
                        : undefined),
                    ...((
                        data.cohortSize !== undefined &&
                        data.cohortSize !== null
                    )
                        ? {cohortSize: data.cohortSize !== '' ? JSON.parse(data.cohortSize) : null}
                        : undefined),
                    ...(dataToolData.institution 
                        ? ({institution: {connect: {id: dataToolData.institution.id}}}) // if institution exists in database, connect
                        : ({institution: undefined})), // if institution does not exist in database, don't connect
                    ...(dataToolData.company 
                        ? ({company: {connect: {id: dataToolData.company.id}}}) // if company exists in database, connect
                        : ({company: undefined})), // if company does not exist in database, don't connect
                }
            })

            try {
                await customerIOTrack({
                    userId: session?.user.id,
                    event: 'org_toolkit_item_added',
                    timestamp: new Date(),
                    traits: {
                        name: session?.user.name,
                        organization_id: organization.id,
                        organization_name: organization.name,
                        organization_subdomain: organization.subdomain,
                    },
                    properties: {
                        orgId: organization.id,
                        itemId: dataToolData.id,
                        itemType: dataToolData.type,       // e.g. "cell_line", "biosample"
                        itemTitle: dataToolData.title,
                    },
                });
            } catch (e) {
                console.error('[CIO] track org_toolkit_item_added failed:', e);
            }

            revalidatePath("/app/tools/data")

            return response
        } catch (error: any) {
            console.error("Error creating biosample:", error.message);
            throw new Error(error.message || "Failed to create biosample.");
        }
    }
)

export const setDataToolsVisibility = withOrganizationAuth(
    async (organization: Organization, ids: string[], isPrivate: boolean) => {
        try {
            if (!organization.id) throw new Error("No organization id provided.");

            const updatedDataTools = await prisma.tool.updateMany({
                where: {
                    id: {in: ids}
                },
                data: {
                    private: isPrivate
                }
            })

            revalidatePath("/app/tools/data")

            return updatedDataTools
        } catch (error: any) {
            console.error("Error updating clinical datasets:", error.message);
            throw new Error(error.message || "Failed to update clinical datasets.");
        }
    }
)

export const updateClinicalDataset = withOrganizationAuth(
    async (organization: Organization, data: z.infer<typeof editDataToolForm>) => {
        try {
            if (!organization.id) {
                throw new Error("No organization id provided.")
            }

            if (!data.id) {
                throw new Error("No data tool id provided.")
            }

            let foundInstitution = undefined
            let foundCompany = undefined

            if (data.storageFacility && data.storageFacility.length > 0) {
                foundInstitution = await prisma.institution.findUnique({
                    where: {
                        id: data?.storageFacility?.[0]?.value
                    }
                })
                foundCompany = await prisma.company.findUnique({
                    where: {
                        id: data?.storageFacility?.[0]?.value
                    }
                })
            }

            const dataToolData: any = {
                id: data.id,
                title: data.title,
                types: data.types ? data.types.map(type => type.value) : undefined,
                metadata: {otherTypeDetails: data.otherTypeDetails} as JsonObject,
                private: data.isPrivate !== undefined && data.isPrivate !== null ? data.isPrivate : true,
                milestones: (data.milestones || []).map((milestone) => {
                    return ({
                        milestoneId: milestone.id,
                        biosampleId: data.id || '',
                    })
                }),
                description: data.description,
                attachments: data.attachments,
                contacts: data.contacts,
                // gene: data.genes && data.genes.length > 0 ? data.genes[0] : undefined,
                genes: (data.genes || []).map(gene => gene.value),
                ...(data.cohortSize !== undefined && data.cohortSize !== null ? {cohortSize: JSON.parse(data.cohortSize)} : undefined),
                institution: foundInstitution,
                company: foundCompany,
                notes: data.notes,
            }

            const newDataTool = await prisma.tool.update({
                where: {id: data.id},
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: {
                                include: {types: {include: {milestoneType: true}}}
                            }
                        }
                    },
                    institution: true,
                    company: true,
                },
                data: {
                    ...dataToolData,
                    ...(dataToolData.attachments ? (
                        {
                            attachments: {
                                deleteMany: {}, // clear all existing attachments
                                createMany: {
                                    data: (dataToolData?.attachments || []).map((attachment: any) => ({
                                        link: attachment.link,
                                        ...(attachment.name ? {name: attachment.name} : undefined)
                                    }))
                                }
                            }
                        }
                    ) : undefined),
                    ...(dataToolData.contacts ? (
                        {
                            contacts: {
                                deleteMany: {},
                                createMany: {
                                    data: (dataToolData?.contacts || []).map((contact: any) => ({
                                        name: contact.name,
                                        email: contact.email,
                                        ...(contact.role ? {role: contact.role} : undefined),
                                        ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                                    }))
                                }
                            }
                        }
                    ) : undefined),
                    ...(dataToolData.milestones ? (
                        {
                            milestones: {
                                deleteMany: {},
                                create: (dataToolData.milestones || []).map((milestone: any) => ({
                                    milestone: {
                                        connect: {id: milestone.milestoneId}
                                    }
                                }))
                            },
                        }
                    ) : undefined),
                    private: dataToolData.private !== undefined && dataToolData.private !== null ? dataToolData.private : false,
                    metadata: dataToolData.metadata as InputJsonObject,
                    ...(dataToolData.gene ? ({
                        gene: {
                            connect: {symbol: dataToolData.gene.value.toUpperCase()}
                        }
                    }) : {gene: {disconnect: true}}),
                    ...(dataToolData.institution 
                        ? {institution: {connect: {id: dataToolData.institution.id}}} // if institution exists in database, connect
                        : {institution: {disconnect: true}}), // if institution does not exist in database, disconnect
                    ...(dataToolData.company 
                        ? {company: {connect: {id: dataToolData.company.id}}} // if company exists in database, connect
                        : {company: {disconnect: true}}), // if company does not exist in database, disconnect
                },
            })

            console.log(`updated tool`, newDataTool)

            const response = await prisma.tool.findUnique({
                where: {id: data.id}
            })

            revalidatePath("/app/tools/data")

            return response
        } catch (error: any) {
            console.error("Error creating clinical dataset:", error.message);
            throw new Error(error.message || "Failed to create clinical dataset.");
        }
    }
)

export const updateCreateFacilityRequest = withOrganizationAuth(
    async (organization: Organization, data: {
        id: string,
        name: string,
        milestoneId?: string,
        biosampleId?: string,
        diseaseModelId?: string,
        clinicalDatasetId?: string
    }) => {
        console.log(`create data`, data)
        const newRequest = await prisma.createFacilityRequest.update({
            where: {
                id: data.id
            },
            include: {
                milestone: true,
                biosample: true,
                diseaseModel: true,
                clinicalDataset: true,
            },
            data: {
                name: data.name,
                ...(data.milestoneId
                    ? ({milestone: {connect: {id: data.milestoneId}}})
                    : undefined),
                ...(data.biosampleId
                    ? ({biosample: {connect: {id: data.biosampleId}}}) 
                    : undefined),
                ...(data.diseaseModelId
                    ? ({diseaseModel: {connect: {id: data.diseaseModelId}}}) 
                    : undefined),
                ...(data.clinicalDatasetId
                    ? ({clinicalDataset: {connect: {id: data.clinicalDatasetId}}}) 
                    : undefined)
            }
        })

        return newRequest
    }
)

export const createCreateFacilityRequest = withOrganizationAuth(
    async (organization: Organization, data: {
        name: string,
        milestoneId?: string,
        biosampleId?: string,
        diseaseModelId?: string,
        clinicalDatasetId?: string
    }) => {
        console.log(`create data`, data)
        const newRequest = await prisma.createFacilityRequest.create({
            include: {
                milestone: true,
                biosample: true,
                diseaseModel: true,
                clinicalDataset: true,
            },
            data: {
                name: data.name,
                ...(data.milestoneId
                    ? ({milestone: {connect: {id: data.milestoneId}}})
                    : undefined),
                ...(data.biosampleId
                    ? ({biosample: {connect: {id: data.biosampleId}}}) 
                    : undefined),
                ...(data.diseaseModelId
                    ? ({diseaseModel: {connect: {id: data.diseaseModelId}}}) 
                    : undefined),
                ...(data.clinicalDatasetId
                    ? ({clinicalDataset: {connect: {id: data.clinicalDatasetId}}}) 
                    : undefined)
            }
        })

        return newRequest
    }
)

export const createBiosample = withOrganizationAuth(
    async (organization: Organization, data: z.infer<typeof editBiosampleForm>) => {
        try {
            const session = await getSession()

            if (!organization.id) {
                throw new Error("No organization id provided.")
            }

            let foundInstitution = undefined
            let foundCompany = undefined

            if (data.storageFacility && data.storageFacility.length > 0) {
                foundInstitution = await prisma.institution.findUnique({
                    where: {
                        id: data?.storageFacility?.[0]?.value
                    }
                })
                foundCompany = await prisma.company.findUnique({
                    where: {
                        id: data?.storageFacility?.[0]?.value
                    }
                })
            }

            const biosampleData: any = {
                id: data.id,
                types: (data.types || []).map(type => type?.value),
                metadata: {
                    // ...(toolData?.metadata ? JSON.parse(JSON.stringify(toolData.metadata)) : undefined),
                    otherTypeDetails: data.otherTypeDetails
                } as JsonObject,
                private: data.isPrivate !== undefined && data.isPrivate !== null ? data.isPrivate : true,
                milestones: (data.milestones || []).map((milestone) => {
                    return ({
                        milestoneId: milestone.id,
                        biosampleId: data.id || '',
                    })
                }),
                description: data.description,
                attachments: data.attachments,
                contacts: data.contacts,
                anatomicalSite: data.anatomicalSite,
                preservationMethod: data.preservationMethod,
                methodOfTransport: data.methodOfTransport,
                currentCountry: data.currentCountry,
                countryOfCollection: data.countryOfCollection,
                collectionDate: data.collectionDate,
                availability: data.availability,
                ...(data.quantity !== undefined && data.quantity !== null ? {quantity: JSON.parse(data.quantity)} : undefined),
                quantityUnit: data.quantityUnit,
                ...(data.price !== undefined && data.price !== null ? {price: JSON.parse(data.price)} : undefined),
                priceUnit: data.priceUnit,
                gene: data.genes && data.genes.length > 0 ? data.genes[0] : undefined,
                variant: data.variant,
                institution: foundInstitution,
                company: foundCompany,
                genotype: data.genotype,
                notes: data.notes,
                bsiId: data.bsiId,
                // yearOfExcision: typeof yearOfExcision === 'string' ? parseInt(yearOfExcision, 10) : yearOfExcision,
                // ageAtExcision: typeof ageAtExcision === 'string' ? parseInt(ageAtExcision, 10) : ageAtExcision,
            }

            const response = await prisma.biosample.create({
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: {
                                include: {types: {include: {milestoneType: true}}}
                            }
                        }
                    },
                    donor: true,
                    institution: true,
                    company: true
                },
                data: {
                    ...biosampleData,
                    // create with the given id if it's available. This is useful for situations like 'undo'
                    // where we're re-creating a pre-existing tool, and the id should match the id in our zustand state
                    id: biosampleData.id || generateToolNanoid(),
                    attachments: {
                        createMany: {
                            data: (biosampleData?.attachments || []).map((attachment: any) => ({
                                link: attachment.link,
                                ...(attachment.name ? {name: attachment.name} : undefined)
                            }))
                        }
                    },
                    contacts: {
                        createMany: {
                            data: (biosampleData?.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                email: contact.email,
                                ...(contact.role ? {role: contact.role} : undefined),
                                ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                            }))
                        }
                    },
                    milestones: {
                        create: (biosampleData.milestones || []).map((milestone: any) => ({
                            milestone: {
                                connect: {id: milestone.milestoneId}
                            }
                        }))
                    },
                    private: biosampleData.private || false,
                    organization: {connect: {id: organization.id}},
                    metadata: biosampleData.metadata as InputJsonObject,
                    ...(biosampleData.gene?.value
                        // transform symbol to uppercase because all genes are uppercase in our database
                        ? ({gene: {connect: {symbol: biosampleData.gene.value.toUpperCase() }}})
                        : undefined),
                    ...(biosampleData.institution 
                        ? ({institution: {connect: {id: biosampleData.institution.id}}}) // if institution exists in database, connect
                        : ({institution: undefined})), // if institution does not exist in database, don't connect
                    ...(biosampleData.company 
                        ? ({company: {connect: {id: biosampleData.company.id}}}) // if company exists in database, connect
                        : ({company: undefined})), // if company does not exist in database, don't connect
                    donor: {
                        connectOrCreate: {
                            where: {
                                id: data.donorId || nanoid(),
                                organizationId: organization.id
                            },
                            create: {
                                id: data.donorId || generateDonorNanoid(),
                                internalId: data.internalDonorId,
                                age: typeof data.age === 'string' ? parseInt(data.age, 10) : data.age,
                                sex: data.sex,
                                gender: data.gender,
                                race: data.race,
                                ethnicity: data.ethnicity,
                                treatments: data.treatments,
                                height: typeof data.height === 'string' ? parseInt(data.height, 10) : data.height,
                                weight: typeof data.weight === 'string' ? parseInt(data.weight, 10) : data.weight,
                                bmi: typeof data.bmi === 'string' ? parseInt(data.bmi, 10) : data.bmi,
                                medications: data.medications,
                                organization: {connect: {id: organization.id}},
                                diagnoses: {
                                    create: (data.diagnoses || []).map((diagnosis: {
                                        diagnosis: Option[],
                                        severity?: string
                                    }) => ({
                                        severity: diagnosis.severity,
                                        type: {
                                            connectOrCreate: {
                                                where: {id: diagnosis.diagnosis[0].value},
                                                create: {
                                                    id: diagnosis.diagnosis[0].value,
                                                    label: diagnosis.diagnosis[0].label
                                                }
                                            }
                                        }
                                    }))
                                }
                            }
                        }
                    }
                }
            })

            if (!response.private) {
                await writeRawEvent({
                    provider: "app",
                    eventType: "org_created_tool",
                    externalId: response.id,
                    occurredAt: new Date(),
                    payload: {
                        biosampleId: response.id,
                        orgId: organization.id,
                        orgName: organization.name,
                        orgSubdomain: organization.subdomain,
                        orgImage: organization.image,
                        title: response.description || `Biosample ${response.id}`,
                        private: false,
                        availability: response.availability,
                        types: response.types ?? [],
                        geneId: response.geneId ?? undefined,
                        institutionId: response.institutionId ?? undefined,
                        userId: session?.user.id,
                        userName: session?.user.name,
                    },
                });

                try {
                    await customerIOTrack({
                        userId: session?.user.id,
                        event: 'org_toolkit_item_added',
                        timestamp: new Date(),
                        traits: {
                            name: session?.user.name,
                            organization_id: organization.id,
                            organization_name: organization.name,
                            organization_subdomain: organization.subdomain,
                        },
                        properties: {
                            orgId: organization.id,
                            itemId: biosampleData.id,
                            itemType: biosampleData.types,
                            itemTitle: biosampleData.title,
                        },
                    });
                } catch (e) {
                    console.error('[CIO] track org_toolkit_item_added failed:', e);
                }
            }

            revalidatePath("/app/tools/biosample")

            return response
        } catch (error: any) {
            console.error("Error creating biosample:", error.message);
            throw new Error(error.message || "Failed to create biosample.");
        }
    }
)

export const setBiosamplesVisibility = withOrganizationAuth(
    async (organization: Organization, ids: string[], isPrivate: boolean) => {
        try {
            if (!organization.id) throw new Error("No organization id provided.");

            const updatedBiosamples = await prisma.biosample.updateMany({
                where: {
                    id: {in: ids}
                },
                data: {
                    private: isPrivate
                }
            })

            revalidatePath("/app/tools/biosample")

            return updatedBiosamples
        } catch (error: any) {
            console.error("Error updating biosample:", error.message);
            throw new Error(error.message || "Failed to create biosample.");
        }
    }
)

export const updateBiosample = withOrganizationAuth(
    async (organization: Organization, data: z.infer<typeof editBiosampleForm>) => {
        try {
            if (!organization.id) throw new Error("No organization id provided.");
            if (!data.id) throw new Error("No biosample id provided.");

            const session = await getSession();

            // Fetch existing to capture previous privacy state (and avoid a second roundtrip for description if you like)
            const existing = await prisma.biosample.findUnique({
                where: {id: data.id},
                select: {id: true, private: true},
            });
            if (!existing) throw new Error("Biosample not found.");

            let foundInstitution = undefined
            let foundCompany = undefined

            if (data.storageFacility && data.storageFacility.length > 0) {
                foundInstitution = await prisma.institution.findUnique({
                    where: {
                        id: data?.storageFacility?.[0]?.value
                    }
                })
                foundCompany = await prisma.company.findUnique({
                    where: {
                        id: data?.storageFacility?.[0]?.value
                    }
                })
            }

            const biosampleData: any = {
                id: data.id,
                types: data.types ? data.types.map((t) => t.value) : undefined,
                metadata: {otherTypeDetails: data.otherTypeDetails} as JsonObject,
                private:
                    data.isPrivate !== undefined && data.isPrivate !== null ? data.isPrivate : true,
                milestones: (data.milestones || []).map((m) => ({
                    milestoneId: m.id,
                    biosampleId: data.id || "",
                })),
                description: data.description,
                attachments: data.attachments,
                contacts: data.contacts,
                anatomicalSite: data.anatomicalSite,
                preservationMethod: data.preservationMethod,
                methodOfTransport: data.methodOfTransport,
                currentCountry: data.currentCountry,
                countryOfCollection: data.countryOfCollection,
                collectionDate: data.collectionDate,
                availability: data.availability,
                ...((data.quantity !== undefined && data.quantity !== null && data.quantity !== '')
                    ? {quantity: JSON.parse(data.quantity)}
                    : {quantity: null}),
                quantityUnit: data.quantityUnit,
                ...((data.price !== undefined && data.price !== null && data.quantity !== '')
                    ? {price: JSON.parse(data.price)}
                    : {price: null}),
                priceUnit: data.priceUnit,
                gene: data.genes && data.genes.length > 0 ? data.genes[0] : undefined,
                variant: data.variant,
                institution: foundInstitution,
                company: foundCompany,
                genotype: data.genotype,
                notes: data.notes,
                bsiId: data.bsiId,
            };

            const newBiosample = await prisma.biosample.update({
                where: {id: data.id},
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: {include: {types: {include: {milestoneType: true}}}},
                        },
                    },
                    donor: true,
                    institution: true,
                    company: true,
                },
                data: {
                    ...biosampleData,
                    ...(biosampleData.attachments
                        ? {
                            attachments: {
                                deleteMany: {},
                                createMany: {
                                    data: (biosampleData?.attachments || []).map((a: any) => ({
                                        link: a.link,
                                        ...(a.name ? {name: a.name} : undefined),
                                    })),
                                },
                            },
                        }
                        : undefined),
                    ...(biosampleData.contacts
                        ? {
                            contacts: {
                                deleteMany: {},
                                createMany: {
                                    data: (biosampleData?.contacts || []).map((c: any) => ({
                                        name: c.name,
                                        email: c.email,
                                        ...(c.role ? {role: c.role} : undefined),
                                        ...(c.affiliation ? {affiliation: c.affiliation} : undefined),
                                    })),
                                },
                            },
                        }
                        : undefined),
                    ...(biosampleData.milestones
                        ? {
                            milestones: {
                                deleteMany: {},
                                create: (biosampleData.milestones || []).map((m: any) => ({
                                    milestone: {connect: {id: m.milestoneId}},
                                })),
                            },
                        }
                        : undefined),
                    private:
                        biosampleData.private !== undefined && biosampleData.private !== null
                            ? biosampleData.private
                            : false,
                    metadata: biosampleData.metadata as InputJsonObject,
                    ...(biosampleData.gene
                        ? {gene: {connect: {symbol: biosampleData.gene.value.toUpperCase()}}}
                        : {gene: {disconnect: true}}),
                    ...(biosampleData.institution 
                        ? {institution: {connect: {id: biosampleData.institution.id}}} // if institution exists in database, connect
                        : {institution: {disconnect: true}}), // if institution does not exist in database, disconnect
                    ...(biosampleData.company 
                        ? {company: {connect: {id: biosampleData.company.id}}} // if company exists in database, connect
                        : {company: {disconnect: true}}), // if company does not exist in database, disconnect
                    ...(data.donorId
                        ? {donor: {connect: {id: data.donorId}}}
                        : {donor: {disconnect: true}}),
                },
            });

            if (data.donorId) {
                await prisma.donor.update({
                    where: {id: data.donorId},
                    data: {
                        internalId: data.internalDonorId,
                        age: typeof data.age === "string" ? parseInt(data.age, 10) : data.age,
                        sex: data.sex,
                        gender: data.gender,
                        race: data.race,
                        ethnicity: data.ethnicity,
                        treatments: data.treatments,
                        height: typeof data.height === "string" ? parseInt(data.height, 10) : data.height,
                        weight: typeof data.weight === "string" ? parseInt(data.weight, 10) : data.weight,
                        bmi: typeof data.bmi === "string" ? parseInt(data.bmi, 10) : data.bmi,
                        medications: data.medications,
                        ...(data.diagnoses
                            ? {
                                diagnoses: {
                                    deleteMany: {},
                                    create: data?.diagnoses?.map((d: { diagnosis: Option[]; severity?: string }) => ({
                                        severity: d.severity,
                                        type: {
                                            connectOrCreate: {
                                                where: {id: d.diagnosis[0].value},
                                                create: {id: d.diagnosis[0].value, label: d.diagnosis[0].label},
                                            },
                                        },
                                    })),
                                },
                            }
                            : undefined),
                    },
                });
            }

            const response = await prisma.biosample.findUnique({where: {id: data.id}});

            // --- Event emission: private/undefined -> public (first publication)
            const wasPrivate = existing?.private;            // prior state
            const isPrivate = newBiosample.private === true; // current state as boolean
            const justPublished = (wasPrivate !== false) && (newBiosample.private === false);

            if (justPublished) {
                await writeRawEvent({
                    provider: "app",
                    eventType: "org_updated_tool",
                    externalId: newBiosample.id,
                    occurredAt: new Date(),
                    payload: {
                        toolId: newBiosample.id,
                        orgId: organization.id,
                        orgName: organization.name,
                        orgSubdomain: organization.subdomain,
                        orgImage: organization.image,
                        title: newBiosample.description || `Biosample ${newBiosample.id}`,
                        private: false,
                        availability: newBiosample.availability,
                        types: newBiosample.types ?? [],
                        geneId: newBiosample.geneId ?? undefined,
                        institutionId: newBiosample.institutionId ?? undefined,
                        userId: session?.user.id,
                        userName: session?.user.name,
                    },
                });
            }

            revalidatePath("/app/tools/biosample")

            return response;
        } catch (error: any) {
            console.error("Error creating biosample:", error.message);
            throw new Error(error.message || "Failed to create biosample.");
        }
    }
);

// export const createOrUpdateAsset = withOrganizationAuth(
//     async (organization: Organization, toolData: any) => {
//         try {
//             console.log(`tool data`, toolData)
//             if (!organization.id) {
//                 throw new Error("No organization id provided.")
//             }

//             const response = await prisma.tool.upsert({
//                 where: {
//                     id: toolData.id || nanoid()
//                 },
//                 include: {
//                     organization: {include: {conditions: {include: {condition: true}}}},
//                     contacts: true,
//                     attachments: true,
//                     milestones: {
//                         include: {
//                             milestone: {
//                                 include: {types: {include: {milestoneType: true}}}
//                             }
//                         }
//                     },
//                 },
//                 update: {
//                     title: toolData.title,
//                     description: toolData.description,
//                     types: toolData.types,
//                     ...(toolData.attachments ? (
//                         {
//                             attachments: {
//                                 deleteMany: {}, // clear all existing attachments
//                                 createMany: {
//                                     data: (toolData?.attachments || []).map((attachment: any) => ({
//                                         link: attachment.link,
//                                         ...(attachment.name ? {name: attachment.name} : undefined)
//                                     }))
//                                 }
//                             }
//                         }
//                     ) : undefined),
//                     ...(toolData.contacts ? (
//                         {
//                             contacts: {
//                                 deleteMany: {},
//                                 createMany: {
//                                     data: (toolData?.contacts || []).map((contact: any) => ({
//                                         name: contact.name,
//                                         email: contact.email,
//                                         ...(contact.role ? {role: contact.role} : undefined),
//                                         ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
//                                     }))
//                                 }
//                             }
//                         }
//                     ) : undefined),
//                     ...(toolData.milestones ? (
//                         {
//                             milestones: {
//                                 deleteMany: {},
//                                 create: (toolData.milestones || []).map((milestone: any) => ({
//                                     milestone: {
//                                         connect: {id: milestone.milestoneId}
//                                     }
//                                 }))
//                             },
//                         }
//                     ) : undefined),
//                     private: toolData.private || false,
//                     metadata: toolData.metadata as InputJsonObject,
//                 },
//                 create: {
//                     // create with the given id if it's available. This is useful for situations like 'undo'
//                     // where we're re-creating a pre-existing tool, and the id should match the id in our zustand state
//                     ...(toolData.id ? {id: toolData.id} : undefined),
//                     title: toolData.title || "",
//                     description: toolData.description,
//                     types: toolData.types,
//                     attachments: {
//                         createMany: {
//                             data: (toolData?.attachments || []).map((attachment: any) => ({
//                                 link: attachment.link,
//                                 ...(attachment.name ? {name: attachment.name} : undefined)
//                             }))
//                         }
//                     },
//                     contacts: {
//                         createMany: {
//                             data: (toolData?.contacts || []).map((contact: any) => ({
//                                 name: contact.name,
//                                 email: contact.email,
//                                 ...(contact.role ? {role: contact.role} : undefined),
//                                 ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
//                             }))
//                         }
//                     },
//                     milestones: {
//                         create: (toolData.milestones || []).map((milestone: any) => ({
//                             milestone: {
//                                 connect: {id: milestone.milestoneId}
//                             }
//                         }))
//                     },
//                     private: toolData.private || false,
//                     organization: {connect: {id: organization.id}},
//                     metadata: toolData.metadata as InputJsonObject,
//                 },
//             })

//             return response
//         } catch (error: any) {
//             console.error("Error creating or updating tool:", error.message);
//             throw new Error(error.message || "Failed to create or update tool.");
//         }
//     }
// )

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
    async (
        organization: Organization,
        rfpData: Partial<RFP>,
        actor?: Actor
    ) => {
        const session = await getSession()

        try {
            if (!organization.id) {
                throw new Error("No organization id provided.");
            }

            // Pre-check: did it exist before?
            // If there is no id in rfpData, this is definitely a create.
            const existing =
                rfpData.id
                    ? await prisma.rFP.findUnique({
                        where: {id: rfpData.id},
                        select: {id: true, private: true, endDate: true, title: true},
                    })
                    : null;

            const wasExisting = !!existing;
            const wasPrivate = existing?.private ?? undefined;
            const wasEndDate = existing?.endDate ?? undefined;

            console.log(`rfp data`, rfpData)

            const response = await prisma.rFP.upsert({
                where: {
                    id: rfpData.id || nanoid(),
                },
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: {
                                include: {types: {include: {milestoneType: true}}},
                            },
                        },
                    },
                    organization: true,
                },
                update: {
                    headerImage: rfpData.headerImage,
                    title: rfpData.title,
                    description: rfpData.description,
                    eligibility: rfpData.eligibility,
                    instructions: rfpData.instructions,
                    evaluationProcess: rfpData.evaluationProcess,
                    attachments: {
                        deleteMany: {}, // clear all existing attachments
                        createMany: {
                            data: (rfpData?.attachments || []).map((attachment: any) => ({
                                link: attachment.link,
                                ...(attachment.name ? {name: attachment.name} : undefined),
                            })),
                        },
                    },
                    contacts: {
                        deleteMany: {},
                        createMany: {
                            data: (rfpData?.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                email: contact.email,
                                ...(contact.role ? {role: contact.role} : undefined),
                                ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined),
                            })),
                        },
                    },
                    private: rfpData.private ?? false,
                    openTo: rfpData.openTo ?? [],
                    startDate: rfpData.startDate || null, // remove start date if not provided
                    endDate: rfpData.endDate || null, // remove end date if not provided
                    milestones: {
                        deleteMany: {},
                        create: (rfpData.milestones || []).map((milestone: any) => ({
                            milestone: {connect: {id: milestone.milestoneId}},
                        })),
                    },
                    budget: rfpData.budget,
                    notes: rfpData.notes,
                },
                create: {
                    ...(rfpData.id ? {id: rfpData.id} : undefined),
                    headerImage: rfpData.headerImage,
                    title: rfpData.title || "",
                    description: rfpData.description,
                    eligibility: rfpData.eligibility,
                    instructions: rfpData.instructions,
                    evaluationProcess: rfpData.evaluationProcess,
                    attachments: {
                        createMany: {
                            data: (rfpData?.attachments || []).map((attachment: any) => ({
                                link: attachment.link,
                                ...(attachment.name ? {name: attachment.name} : undefined),
                            })),
                        },
                    },
                    contacts: {
                        createMany: {
                            data: (rfpData?.contacts || []).map((contact: any) => ({
                                name: contact.name,
                                email: contact.email,
                                ...(contact.role ? {role: contact.role} : undefined),
                                ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined),
                            })),
                        },
                    },
                    private: rfpData.private ?? false,
                    openTo: rfpData.openTo ?? [],
                    startDate: rfpData.startDate,
                    endDate: rfpData.endDate,
                    milestones: {
                        create: (rfpData.milestones || []).map((milestone: any) => ({
                            milestone: {connect: {id: milestone.milestoneId}},
                        })),
                    },
                    organization: {connect: {id: organization.id}},
                    budget: rfpData.budget,
                    notes: rfpData.notes,
                },
            });

            // ---- Event emission logic ----------------------------------------

            // Always have these available for payloads
            const orgId = organization.id;
            const orgName = organization.name ?? response.organization?.name;
            const title = response.title;
            const startDate = response.startDate ?? undefined;
            const endDate = response.endDate ?? undefined;
            const isPrivate = response.private ?? false;

            // 1) ORG_CREATED_RFP — only when this was a new create
            if (!wasExisting) {
                await writeRawEvent({
                    provider: "app",
                    eventType: "org_created_rfp",
                    externalId: response.id,
                    occurredAt: new Date(),
                    payload: {
                        rfpId: response.id,
                        title,
                        orgId,
                        orgSubdomain: organization.subdomain,
                        orgName,
                        orgImage: organization.image,
                        startDate,
                        endDate,
                        private: isPrivate,
                        budget: response.budget ?? undefined,
                        userId: actor?.userId,
                        userName: actor?.userName,
                    },
                });
            }

            // 2) RFP_CREATED — when it becomes public for the first time
            //    (i.e., previously private/undefined -> now public)
            const justPublished =
                (wasExisting && wasPrivate !== false && isPrivate === false) ||
                (!wasExisting && isPrivate === false); // created already public

            if (justPublished) {
                await writeRawEvent({
                    provider: "app",
                    eventType: "org_created_rfp",
                    externalId: response.id,
                    occurredAt: new Date(),
                    payload: {
                        rfpId: response.id,
                        orgId,
                        orgImage: organization.image,
                        orgSubdomain: organization.subdomain,
                        title,
                        deadline: endDate ?? undefined,
                        userId: actor?.userId,
                        userName: actor?.userName,
                    },
                });

                try {
                    await customerIOTrack({
                        userId: session?.user.id,
                        event: 'org_rfp_created',
                        timestamp: new Date(),
                        traits: {
                            name: actor?.userName,
                            organization_id: organization.id,
                            organization_name: organization.name,
                            organization_subdomain: organization.subdomain,
                        },
                        properties: {
                            orgId: organization.id,
                            rfpId: rfpData.id,
                            title: rfpData.title,
                            fundingAmount: rfpData.budget,
                            deadline: rfpData.endDate,
                        },
                    });
                } catch (e) {
                    console.error('[CIO] track org_rfp_created failed:', e);
                }
            }

            // 3) RFP_CLOSED — endDate exists AND is now in the past
            if (endDate) {
                const now = new Date();
                const ended = new Date(endDate) <= now;

                // Emit close if it *is* closed now and either:
                //   - it was not closed before, or
                //   - it was created already closed (idempotency key prevents dupes)
                const wasEndedBefore = wasEndDate ? new Date(wasEndDate) <= now : false;

                if (ended && !wasEndedBefore) {
                    await writeRawEvent({
                        provider: "app",
                        eventType: "rfp_closed",
                        externalId: response.id,
                        occurredAt: new Date(),
                        payload: {
                            rfpId: response.id,
                            orgImage: organization.image,
                            orgSubdomain: organization.subdomain,
                            orgId,
                            title,
                            deadline: endDate,
                            userId: actor?.userId,
                            userName: actor?.userName,
                        },
                    });
                }
            }

            // (Optional) A separate scheduler/cron should emit rfp_deadline_approaching
            // 7 days prior; don’t do it inline here to avoid race/timing issues.

            return response;
        } catch (error: any) {
            console.error("Error creating or updating RFP:", error?.message ?? error);
            throw new Error(error?.message || "Failed to create or update RFP.");
        }
    }
);

export const createRoadmap = withOrganizationAuth(
    async (
        organization: Organization,
        roadmapTemplate?: (typeof templateResearchPlans)[0] & { metadata: JsonObject },
        actor?: Actor
    ) => {
        const session = await getSession()

        try {
            if (!organization.id) {
                throw new Error("No organization id provided.");
            }

            const roadmap = await prisma.roadmap.create({
                data: {
                    title: roadmapTemplate?.title,
                    description: roadmapTemplate?.description,
                    organization: {connect: {id: organization.id}},
                    modalities: roadmapTemplate?.modalities,
                    ...(roadmapTemplate?.metadata ? {metadata: roadmapTemplate.metadata} : undefined),
                    // published defaults to true per your model; omit to use default
                },
            });

            // If a template was provided, create nodes/edges/milestones first
            if (roadmapTemplate?.milestones) {
                const sortedMilestones = roadmapTemplate?.milestones.sort((a, b) => {
                    const aNode = roadmapTemplate?.nodes?.find(node => node.id === a.nodeId)
                    const bNode = roadmapTemplate?.nodes?.find(node => node.id === b.nodeId)

                    if (aNode?.positionX && bNode?.positionX) {
                        return aNode.positionX - bNode.positionX
                    } else if (aNode?.positionX) {
                        // node a is defiend, node b is not, put node a first
                        return -1
                    } else if (bNode?.positionX) {
                        // node b is defined, node b is not, put node b first
                        return 1
                    }

                    // if nether is defined, don't re-sort
                    return 0
                })
                const sortedNodes = roadmapTemplate?.nodes.sort((a, b) => {
                    if (a?.positionX && b?.positionX) {
                        return a.positionX - b.positionX
                    } else if (a?.positionX) {
                        // node a is defiend, node b is not, put node a first
                        return -1
                    } else if (b?.positionX) {
                        // node b is defined, node b is not, put node b first
                        return 1
                    }

                    // if nether is defined, don't re-sort
                    return 0
                })

                // sort milestones and nodes, just in case they're not sorted properly in the template file
                await createNodesAndEdgesFromTemplate(organization.id, roadmap.id, {
                    ...roadmapTemplate,
                    milestones: sortedMilestones,
                    nodes: sortedNodes
                });
            }

            // Re-fetch with full graph
            const finalRoadmap = await prisma.roadmap.findUnique({
                where: {id: roadmap.id},
                include: {
                    milestones: {
                        include: {
                            node: true,
                            contacts: true,
                            attachments: true,
                            types: {include: {milestoneType: true}},
                            tools: {include: {tool: true}},
                            rfps: {include: {rfp: true}},
                        },
                    },
                    nodes: true,
                    edges: true,
                    organization: true,
                },
            });

            await writeRawEvent({
                provider: "app",
                eventType: "org_research_plan_created",
                externalId: roadmap.id, // back-reference for idempotency
                occurredAt: new Date(),
                payload: {
                    // mapper expects these:
                    orgId: organization.id,
                    orgName: organization.name ?? finalRoadmap?.organization?.name,
                    orgSubdomain: organization.subdomain,
                    orgImage: organization.image,
                    roadmapId: roadmap.id,
                    title: finalRoadmap?.title ?? roadmapTemplate?.title,
                    published: true, // Roadmap.published default in your model is true
                    // actor
                    userId: actor?.userId,
                    userName: actor?.userName,
                },
            });

            try {
                await customerIOTrack({
                    userId: session?.user.id,                 // required to attribute to a person; helper no-ops if missing
                    event: 'org_research_plan_created',    // keep aligned with your writeRawEvent type
                    timestamp: new Date(),                 // or finalRoadmap?.createdAt if you select it
                    traits: {
                        // optional profile upserts (handy for segmentation):
                        name: actor?.userName,
                        organization_id: organization.id,
                        organization_name: organization.name ?? finalRoadmap?.organization?.name,
                        organization_subdomain: organization.subdomain,
                    },
                    properties: {
                        orgId: organization.id,
                        orgName: organization.name ?? finalRoadmap?.organization?.name,
                        orgSubdomain: organization.subdomain,
                        roadmapId: finalRoadmap?.id,
                        title: finalRoadmap?.title ?? roadmapTemplate?.title,
                        published: true, // your default
                        template_title: roadmapTemplate?.title,
                        modalities: roadmapTemplate?.modalities,
                        milestone_count: finalRoadmap?.milestones?.length ?? 0,
                        node_count: finalRoadmap?.nodes?.length ?? 0,
                        edge_count: finalRoadmap?.edges?.length ?? 0,
                    },
                });
            } catch (e) {
                // don’t ever block the user flow on analytics
                console.error('[CIO] track org_research_plan_created failed:', e);
            }

            // This is to make it so that saving shows the newly created projects from the roadmap
            revalidatePath("/app/marketplace/service-providers")

            return finalRoadmap;
        } catch (error: any) {
            console.error("Error creating roadmap:", error?.message ?? error);
            throw new Error(error?.message || "Failed to create roadmap.");
        }
    }
);

export const createNodesAndEdgesFromTemplate = withOrganizationAuth(
    async (organization: Organization, roadmapId: string, roadmapTemplate: typeof templateResearchPlans[0] & {
        metadata: JsonObject
    }) => {
        // maps the original node id (from the template) to the new node ID that's stored in the DB
        const nodeIDMap: { [originalNodeId: string]: string } = {}

        const existingMilestonesCount = await prisma.milestone.count({
            where: {roadmapId}
        })

        // if a roadmap template was provided, create the relevant nodes, milestones, and edges
        if (roadmapTemplate?.milestones) {
            const milestones = roadmapTemplate.milestones

            const nodes = await Promise.all(
                milestones.map(async (milestone: any, index: number) => {
                    // find the node associated with the milestone, used to fetch position information
                    const templateNode = roadmapTemplate.nodes.find((n: any) => n.id === milestone.nodeId)

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
                                    timelineOrder: existingMilestonesCount + index
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
                            biosamples: {include: {biosample: true}},
                            diseaseModels: {include: {diseaseModel: true}},
                            tools: {include: {tool: true}},
                            rfps: {include: {rfp: true}},
                            companies: {include: {company: true}},
                            institutions: {include: {institution: true}},
                            createFacilityRequests: true,
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
                            contacts: {
                                createMany: {
                                    data: (milestone?.contacts || []).map((contact: any) => ({
                                        email: contact.link,
                                        name: contact.name
                                    }))
                                }
                            },
                            status: milestone?.status || "PLANNED",
                            private: (milestone?.private !== null && milestone?.private !== undefined) ? milestone?.private : true,
                            nodeType: milestone?.nodeType || "PROJECT",
                            companies: {
                                create: (milestone?.companies || []).map((company: any) => ({
                                    company: {
                                        connect: {id: company.companyId}
                                    }
                                }))
                            },
                            institutions: {
                                create: (milestone?.institutions || []).map((institution: any) => ({
                                    institution: {
                                        connect: {id: institution.institutionId}
                                    }
                                }))
                            },

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
        const session = await getSession()

        try {
            const updatedNodes: any[] = []
            const createdPublicProjects: Array<{
                researchPlanId: string;
                projectId: string;
                title?: string;
                startDate?: Date | string | null;
                endDate?: Date | string | null;
                private?: boolean;
                status?: string | null;
                budget?: number | null;
                timelineOrder?: number | null;
            }> = []

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
                                    contacts: {
                                        createMany: {
                                            data: (node.data?.contacts || []).map((contact: any) => ({
                                                email: contact.email,
                                                name: contact.name,
                                            }))
                                        }
                                    },
                                    status: node.data?.status || "PLANNED",
                                    private: (node.data?.private !== null && node.data?.private !== null) ? node.data?.private : true,
                                    nodeType: node.data?.nodeType || "PROJECT"
                                }
                            }
                        }
                    })

                    updatedNodes.push(n)

                    const m = n.data; // Milestone
                    if (m?.nodeType === "PROJECT" && m?.private === false) {
                        createdPublicProjects.push({
                            researchPlanId: roadmapId,
                            projectId: m.id,
                            title: m.title,
                            startDate: m.startDate ?? null,
                            endDate: m.endDate ?? null,
                            private: m.private,
                            status: m.status ?? null,
                            budget: m.budget ?? null,
                            timelineOrder: m.timelineOrder ?? null,
                        });
                    }
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

            if (createdPublicProjects.length) {
                const ids = createdPublicProjects.map(p => p.projectId).sort().join(",");
                const externalId = crypto.createHash("sha256").update(`project-batch:${ids}`).digest("hex");

                await writeRawEvent({
                    provider: "app",
                    eventType: "org_created_project", // batch payload handled by register below
                    externalId,
                    occurredAt: new Date(),
                    payload: {
                        researchPlanId: roadmapId,
                        orgId: organizationId,
                        orgName: organization.name,
                        orgSubdomain: organization.subdomain,
                        orgImage: organization.image,
                        projects: createdPublicProjects,
                        userId: session?.user.id,
                        userName: session?.user.name,
                    },
                });
            }

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
// export const syncDBAssets = withOrganizationAuth(
//     async (_: Organization, {tools}: { tools: Asset[] }) => {
//         try {
//             let updateAssets: Asset[] = []
//             const session = await getSession()

//             if (!session?.user.organizationId) throw new Error("No session available")

//             await Promise.all(
//                 tools.map(async (tool: Asset) => {
//                     const previousAsset: Asset | null = await prisma.tool.findUnique({
//                         where: {id: tool.id},
//                         include: {
//                             organization: {include: {conditions: {include: {condition: true}}}},
//                             contacts: true,
//                             attachments: true,
//                             milestones: {
//                                 include: {
//                                     milestone: true
//                                 }
//                             },
//                             institution: true,
//                             gene: true,
//                         }
//                     })

//                     if (!previousAsset) {
//                         // if the tool does not exist, re-create it
//                         const a = await createClinicalDataset(session.user.organizationId, tool)
//                         updateAssets = [...updateAssets, a]
//                     } else {
//                         // if the tool does exist, update it's properties
//                         const a = await updateClinicalDataset(session.user.organizationId, tool)
//                         updateAssets = [...updateAssets, a]
//                     }
//                 })
//             )

//             // delete any tools that no longer exist
//             // const dbAssetIds = await prisma.tool.findMany({
//             //     where: {organizationId: session.user.organizationId}
//             // }).map(tool => )

//             return {success: true, data: updateAssets}
//         } catch (e) {
//             return {success: false, error: e}
//         }
//     }
// )

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
            const session = await getSession();
            let updatedMilestones: Milestone[] = [];

            const publishedProjects: Array<{
                projectId: string;
                title?: string | null;
                startDate?: string | null;
                endDate?: string | null;
                private?: boolean;
                status?: string | null;
                budget?: number | null;
                openTo?: string[];
                otherTypeDetails?: string | null;
                timelineOrder?: number | null;
                updatedAt?: string;
                orgId?: string;
            }> = []

            await Promise.all(
                milestones.map(async (milestone: any) => {
                    const previousMilestone = await prisma.milestone.findUnique({
                        where: {nodeId: milestone.nodeId},
                        select: {
                            id: true,
                            private: true
                        },
                    });

                    if (!previousMilestone) {
                        throw new Error(
                            `Milestone (${milestone.title}) with ID ${milestone.id} does not exist.`,
                        );
                    }

                    // let foundInstitutions = undefined
                    // let foundCompanies = undefined

                    // if (milestone.partners && milestone.partners.length > 0) {
                    //     foundInstitutions = await prisma.institution.findMany({
                    //         where: {
                    //             id: {in: milestone?.partners?.map((partner: Option) => partner.value)}
                    //         }
                    //     })
                    //     foundCompanies = await prisma.company.findMany({
                    //         where: {
                    //             id: {in: milestone?.partners?.map((partner: Option) => partner.value)}
                    //         }
                    //     })
                    // }

                    // console.log(`found companies`, milestone.companies)
                    // console.log(`found institutions`, milestone.institutions)

                    const m = await prisma.milestone.update({
                        where: {nodeId: milestone.nodeId},
                        include: {
                            node: true,
                            contacts: true,
                            attachments: true,
                            roadmap: true,
                            types: {include: {milestoneType: true}},
                            biosamples: {include: {biosample: true}},
                            diseaseModels: {include: {diseaseModel: true}},
                            tools: {include: {tool: true}},
                            rfps: {include: {rfp: true}},
                            companies: {include: {company: true}},
                            institutions: {include: {institution: true}},
                            createFacilityRequests: true,
                        },
                        data: {
                            title: milestone.title,
                            types: {
                                deleteMany: {},
                                create: (milestone.types || []).map((type: any) => ({
                                    milestoneType: {
                                        connect: {id: type.milestoneTypeId || type.milestoneType.id},
                                    },
                                })),

                            },
                            biosamples: {
                                deleteMany: {},
                                create: (milestone.biosamples || []).map((tool: any) => ({
                                    biosample: {
                                        connect: {id: tool.biosampleId || tool.biosample.id},
                                    },
                                })),
                            },
                            diseaseModels: {
                                deleteMany: {},
                                create: (milestone.diseaseModels || []).map((tool: any) => ({
                                    diseaseModel: {
                                        connect: {id: tool.diseaseModelId || tool.diseaseModel.id},
                                    },
                                })),
                            },
                            tools: {
                                deleteMany: {},
                                create: (milestone.tools || []).map((tool: any) => ({
                                    tool: {
                                        connect: {id: tool.toolId || tool.tool.id},
                                    },
                                })),
                            },
                            rfps: {
                                deleteMany: {},
                                create: (milestone.rfps || []).map((rfp: any) => ({
                                    rfp: {
                                        connect: {id: rfp.rfpId || rfp.rfp.id},
                                    },
                                })),
                            },
                            institutions: {
                                deleteMany: {},
                                create: (milestone.institutions || []).map((institution: any) => ({
                                    institution: {
                                        connect: {id: institution?.institutionId || institution?.institution?.id}
                                    }
                                }))
                            },
                            companies: {
                                deleteMany: {},
                                create: (milestone.companies || []).map((company: any) => ({
                                    company: {
                                        connect: {id: company?.companyId || company?.company?.id}
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
                                deleteMany: {},
                                createMany: {
                                    data: (milestone?.attachments || []).map((attachment: any) => ({
                                        link: attachment.link,
                                        ...(attachment.name ? {name: attachment.name} : undefined),
                                    })),
                                },
                            },
                            contacts: {
                                deleteMany: {},
                                createMany: {
                                    data: (milestone?.contacts || []).map((contact: any) => ({
                                        name: contact.name,
                                        email: contact.email,
                                        ...(contact.role ? {role: contact.role} : undefined),
                                        ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined),
                                    })),
                                },
                            },
                            openTo: milestone.openTo || [],
                            status: milestone.status || "PLANNED",
                            private: milestone.private ?? false, // <-- preserve explicit false
                            notes: milestone.notes,
                            nodeType: milestone.nodeType || "PROJECT",
                            ...(milestone.metadata ? {metadata: milestone.metadata} : undefined),
                        },
                    });

                    updatedMilestones = [...updatedMilestones, m];

                    const justPublished =
                        m.nodeType === "PROJECT" &&
                        previousMilestone.private !== false &&
                        m.private === false;

                    if (justPublished) {
                        publishedProjects.push({
                            projectId: m.id,
                            title: m.title,
                            startDate: m.startDate ? new Date(m.startDate).toISOString() : null,
                            endDate: m.endDate ? new Date(m.endDate).toISOString() : null,
                            private: m.private,
                            status: m.status ?? null,
                            budget: m.budget ?? null,
                            openTo: m.openTo ?? [],
                            otherTypeDetails: m.otherTypeDetails ?? null,
                            timelineOrder: m.timelineOrder ?? null,
                            updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : undefined,
                            orgId: (m as any).organizationId,
                        });
                    }
                }),
            );

            // --- One batched raw event for all updated public projects ---
            if (publishedProjects.length) {
                const idemSeed = publishedProjects
                    .map((p) => `${p.projectId}@${p.updatedAt ?? ""}`)
                    .sort()
                    .join(",");
                const externalId = crypto
                    .createHash("sha256")
                    .update(`project-batch-publish:${idemSeed}`)
                    .digest("hex");

                const orgId = publishedProjects[0].orgId!;
                let orgName: string | undefined = undefined;
                let orgImage: string | undefined = undefined;
                let orgSubdomain: string | undefined = undefined;
                try {
                    const org = await prisma.organization.findUnique({
                        where: {id: orgId},
                        select: {name: true, image: true, subdomain: true},
                    });
                    orgName = org?.name ?? undefined;
                    orgImage = org?.image ?? undefined;
                    orgSubdomain = org?.subdomain ?? undefined;
                } catch {
                }

                await writeRawEvent({
                    provider: "app",
                    eventType: "org_updated_project", // batch payload handled by your register
                    externalId,
                    occurredAt: new Date(),
                    payload: {
                        orgId,
                        orgName,
                        orgSubdomain,
                        orgImage,
                        projects: publishedProjects,
                        userId: session?.user.id,
                        userName: session?.user.name,
                    },
                });
            }

            return {success: true, data: updatedMilestones};
        } catch (error: any) {
            logError(`Error updating Milestone: `, error);
            return {success: false, error: "Internal server error"};
        }
    },
);

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
            // const newTask: Task = await prisma.task.create({
            //     include: {checklist: true, stakeholders: {include: {user: true}}},
            //     data: {
            //         name: 'New Task',
            //         id: nanoid(),
            //         createdAt: new Date(),
            //         updatedAt: new Date(),
            //         kanbanPosition: 0,
            //         // status: null,
            //         // description: null,
            //         // milestoneId: null,
            //         orderPosition: 0,
            //         columnId,
            //         // date: null,
            //         // endDate: null,
            //         // priority: null,
            //         private: true,
            //         // startDate: null,
            //         // checklist: []
            //         ...(properties?.stakeholders ? {
            //             stakeholders: {
            //                 createMany: {
            //                     data: (properties.stakeholders || []).map((stakeholder: any) => ({
            //                         userId: stakeholder?.user?.id || stakeholder?.userId,
            //                         // user: { connect: { id: stakeholder.id }},
            //                     }))
            //                 }
            //             }
            //         } : undefined)
            //     }
            // })

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

            // if (!newTask) {
            //     return {success: false, error: "Could not create task"}
            // }

            // Typesense - if updating typesense, update here...

            const newTask = null
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

            revalidatePath(`/app/service-providers/${companyId}`);

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

            revalidatePath(`/app/service-providers/${companyId}`);

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
    async (organization: Organization, croId: string, milestoneId?: string | null) => {
        try {
            // Check if this CRO is already saved by this organization
            const existing = await prisma.savedCompany.findFirst({
                where: {
                    companyId: croId,
                    organizationId: organization.id,
                },
            });

            if (existing) {
                return {
                    success: false,
                    error: "This CRO is already saved. To remove it, go to your saved page and unsave it there.",
                };
            }

            const data: Prisma.SavedCompanyUncheckedCreateInput = {
                companyId: croId,
                organizationId: organization.id,
                ...(milestoneId ? { milestoneId } : {}), // omit if none
            };

            const response = await prisma.savedCompany.create({
                data,
                include: {
                    company: true,
                    ...(milestoneId ? { milestone: { include: { types: true } } } : {}),
                },
            });

            if (!response) {
                return { success: false, error: "Database error. Please try again later." };
            }

            // Revalidate relevant pages
            revalidatePath(`/app/service-providers/${croId}`);
            revalidatePath(`/app/marketplace`);
            revalidatePath(`/app/marketplace/service-providers`);

            return { success: true, data: response };
        } catch (error: any) {
            console.error("Error saving company:", error);

            // Handle unique constraint directly (fallback)
            if (error.code === "P2002") {
                return {
                    success: false,
                    error: "This CRO is already saved. To remove it, go to your saved page and unsave it there.",
                };
            }

            return { success: false, error: "Database error. Please try again later." };
        }
    }
);

export const contactCRO = withOrganizationAuth(
    async (organization: Organization, croId: string, formData: FormData) => {
        const session = await getSession();
        const description = formData.get("description") as string;
        const timeline = formData.get("timeline") as string;

        const services = formData.get("services")
            ? (formData.get("services") as string).split(",")
            : [];

        const rfpIds = formData.get("rfps")
            ? (formData.get("rfps") as string).split(",")
            : [];

        try {
            const response = await prisma.companyContactRequest.create({
                data: {
                    company: {
                        connect: {
                            id: croId,
                        },
                    },
                    organization: {
                        connect: {
                            id: organization.id,
                        },
                    },
                    description,
                    timeline,
                    services: {
                        create: services.map((serviceId) => ({
                            service: {
                                connect: {id: serviceId},
                            },
                        })),
                    },
                    rfps: {
                        create: rfpIds.map((rfpId) => ({
                            rfp: {
                                connect: {id: rfpId},
                            },
                        })),
                    },
                },
                include: {
                    company: true,
                    organization: true,
                    services: true,
                    rfps: true,
                },
            });

            if (response && session) {
                await sendProviderContactRequestEmail(
                    {
                        userName: session.user.name,
                        email: session.user.email,
                        providerName: response.company.title,
                        organizationName: response.organization.name,
                        organizationImage: response.organization.image,
                    }
                ).then(() => {
                    console.log("email sent")
                })
            }

            return {success: true, data: response};
        } catch (error: any) {
            console.error("Error creating contact request:", error);
            return {success: false, error: "Database error. please try again later."};
        }
    }
);

export const saveOrganization = withOrganizationAuth(
    async (organization: Organization, savedOrganizationId: string) => {
        try {
            // Check if this organization is already saved by this organization
            const existing = await prisma.savedOrganization.findFirst({
                where: {
                    organizationId: organization.id,
                    savedOrganizationId: savedOrganizationId,
                },
            });

            if (existing) {
                return {
                    success: false,
                    error:
                        "This organization is already saved. To remove it, go to your saved page and unsave it there.",
                };
            }

            const response = await prisma.savedOrganization.create({
                include: {
                    savedOrganization: true,
                    organization: true,
                },
                data: {
                    savedOrganization: {
                        connect: {
                            id: savedOrganizationId,
                        },
                    },
                    organization: {
                        connect: {
                            id: organization.id,
                        },
                    },
                },
            });

            if (!response) {
                console.error("Error saving organization.");
                return { success: false, error: "Database error. Please try again later." };
            }

            console.log(`response`, response);

            revalidatePath(`/app/marketplace`);
            revalidatePath(`/app/marketplace/patient-groups`);

            return { success: true, data: response };
        } catch (error: any) {
            console.error("Error saving organization:", error);

            // Handle unique constraint directly (fallback)
            if (error.code === "P2002") {
                return {
                    success: false,
                    error:
                        "This organization is already saved. To remove it, go to your saved page and unsave it there.",
                };
            }

            return { success: false, error: "Database error. Please try again later." };
        }
    }
);

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

export const unsaveOrganization = withOrganizationAuth(
    async (_: Organization, savedOrganizationId: string) => {
        try {
            const response = await prisma.savedOrganization.delete({
                where: {id: savedOrganizationId},
                include: {
                    organization: true,
                    savedOrganization: true
                },
            });

            if (!response) {
                console.error("Error unsaving organization.")
                return {success: false, error: "Database error. please try again later."}
            }

            return {success: true, data: response}
        } catch (error: any) {
            console.error("Error unsaving organization:", error)
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

export const updateResearcher = withAuth(
    async (_id: unknown, data: { [key: string]: any }) => {
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

            // 1. Delete existing affiliations
            await prisma.affiliation.deleteMany({
                where: {researcherId: researcher.id},
            });

            if (Array.isArray(data.affiliations)) {
                const institutionIds = data.affiliations.map((a: any) => a.value);

                // Validate institutionIds
                const existingInstitutions = await prisma.institution.findMany({
                    where: {
                        id: {in: institutionIds},
                    },
                    select: {id: true},
                });

                const validInstitutionIds = new Set(existingInstitutions.map((i) => i.id));

                const newAffiliations = data.affiliations
                    .filter((a: any) => validInstitutionIds.has(a.value))
                    .map((a: any) => ({
                        researcherId: researcher.id,
                        institutionId: a.value,
                    }));

                if (newAffiliations.length > 0) {
                    await prisma.affiliation.createMany({
                        data: newAffiliations,
                    });
                }
            }

            // 3. Update researcher fields
            const response = await prisma.researcher.update({
                where: {userId: session.user.id},
                data: {
                    title: data.title ?? null,
                    orcid: data.orcid,
                    researchInterests: {
                        set: data.researchInterests?.map((r: any) => r.value) || [],
                    },
                    therapeuticsOfInterest: {
                        set: data.therapeuticsOfInterest?.map((r: any) => r.value) || [],
                    },
                    genesOfInterest: {
                        set: data.genesOfInterest?.map((g: any) => g.value) || [],
                    },
                    conditionsOfInterest: {
                        set: data.conditionsOfInterest?.map((c: any) => c.value) || [],
                    },
                },
            });

            return response;
        } catch (error: any) {
            if (error.code === "P2002") {
                const field = Object.keys(data)[0];
                return {error: `This ${field} is already in use`};
            } else {
                console.error(error);
                return {error: error.message};
            }
        }
    }
);

export const createMaterialAndDataAccessRequest = withResearcherAuth(
    async (user: User, formData: FormData) => {
        const session = await getSession()
        if (!session?.user.id) {
            return {
                error: "Not authenticated"
            }
        }

        const rawData = formData.get("data");
        if (!rawData || typeof rawData !== "string") {
            return {error: "Invalid form data."};
        }

        const parsed = JSON.parse(rawData);

        const {
            name,
            description,
            organizationId,
            openToCollab,
            projectDetails,
            sampleDetails,
            logistics,
            commercial,
            agreements,
        } = parsed;

        const {
            studyTitle,
            studyDescription,
            justification,
            hasIrbApproval,
            irbStatus,
            hasRisks,
            riskDescription,
            disseminationPlan,
            patientSignificance,
        } = projectDetails;

        const {
            sampleTypes,
            otherSampleType,
            participantCount,
            processingRequirements,
        } = sampleDetails;

        const {
            timeline,
            logisticsContact,
            providesCollectionKit,
            needsCollectionMaterials,
            participantCompensation,
            compensationDetails,
            shippingAddress,
            fedexAccount,
            shippingMethod,
            shippingContact,
            shippingPhone,
        } = logistics;

        const {
            isCommercial,
            fundingOrganization,
        } = commercial;

        const metadata: JsonObject = parsed.metadata ?? {};

        try {
            const request = await prisma.materialAndDataAccessRequest.create({
                include: {
                    organization: {select: {id: true, name: true, image: true, subdomain: true}},
                    researcher: {select: {id: true}},
                },
                data: {
                    title: name,
                    description,
                    submittedAt: new Date(),
                    sampleCount: participantCount,
                    openToCollab,
                    studyTitle,
                    studyDescription,
                    justification,
                    hasIrbApproval,
                    irbStatus,
                    hasRisks,
                    riskDescription,
                    disseminationPlan,
                    patientSignificance,
                    sampleTypes,
                    otherSampleType,
                    processingRequirements,
                    timeline,
                    logisticsContact,
                    providesCollectionKit,
                    needsCollectionMaterials,
                    participantCompensation,
                    compensationDetails,
                    shippingAddress,
                    fedexAccount,
                    shippingMethod,
                    shippingContact,
                    shippingPhone,
                    isCommercial,
                    fundingOrganization,
                    metadata,

                    organization: {
                        connect: {
                            id: organizationId,
                        },
                    },
                    researcher: {
                        connect: {
                            userId: session.user.id,
                        },
                    },
                },
            });

            await writeRawEvent({
                provider: "app",
                eventType: "tool_request_created",
                externalId: request.id,
                occurredAt: new Date(),
                payload: {
                    requestId: request.id,
                    title: request.title,
                    orgId: request.organization?.id ?? organizationId,
                    orgName: request.organization?.name,
                    orgSubdomain: request.organization?.subdomain,
                    orgImage: request.organization?.image,
                    researcherId: request.researcher?.id!, // created via connect, should exist
                    userId: session.user.id,
                    userName: session.user.name,
                    status: (request as any).status, // include if your model has it; else harmlessly undefined
                    submittedAt: request.submittedAt?.toISOString(),
                },
            });

            await addTypeSenseDocument(
                `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                (
                    process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                        ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                        : process.env.TYPESENSE_ADMIN_API_KEY
                )!,
                request,
                'requests'
            );

            revalidatePath("/requests")

            // await sendNewOrganizationEmail(
            //     {
            //         user: {
            //             name: session.user.name,
            //             email: session.user.email
            //         },
            //         organization: {
            //             name: organization.name,
            //             subdomain: organization.subdomain
            //         }
            //     }
            // ).then(() => {
            //     console.log("email sent")
            // })

            return {success: true, data: request}
        } catch (error: any) {
            if (error.code === "P2002") {
                const target = error.meta?.target?.[0];

                switch (target) {
                    default:
                        return {error: `Unique constraint failed on ${target}`};
                }
            } else {
                return {
                    error: error.message
                }
            }
        }
    }
)

export const updateMaterialAndDataAccessRequestProperty = withAuth(
    async (
        requestId: string,
        property: string,
        value: any
    ): Promise<{ success: boolean; error?: string; data?: any }> => {
        try {
            const session = await getSession();
            if (!session?.user.id) {
                return {success: false, error: "Not authenticated"};
            }

            const allowedProps = [
                "sampleCount", "about", "status", "submittedAt", "expiresAt",
                "sampleTypes", "dataTypes"
            ];

            if (!allowedProps.includes(property)) {
                return {success: false, error: "Unsupported property."};
            }

            let updateData: any = {};
            updateData[property] = value;

            const updatedRequest = await prisma.materialAndDataAccessRequest.update({
                where: {id: requestId},
                include: {organization: true},
                data: updateData
            });

            if (property === "status" && value === "APPROVED") {
                await writeRawEvent({
                    provider: "app",
                    eventType: "tool_request_approved",
                    externalId: updatedRequest.id,
                    occurredAt: new Date(),
                    payload: {
                        requestId: updatedRequest.id,
                        title: updatedRequest.title,
                        orgId: updatedRequest.organizationId,
                        orgName: updatedRequest.organization?.name,
                        orgSubdomain: updatedRequest.organization?.subdomain,
                        orgImage: updatedRequest.organization?.image,
                        approverUserId: session.user.id,
                        approverUserName: session.user.name,
                        approvedAt: new Date().toISOString(),
                    },
                });
            }

            await updateTypeSenseDocument(
                `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                (
                    process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                        ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                        : process.env.TYPESENSE_ADMIN_API_KEY
                )!,
                updatedRequest,
                'requests'
            );

            revalidatePath("/requests");

            return {success: true, data: updatedRequest};
        } catch (error: any) {
            console.error("Error updating property:", error);
            return {success: false, error: "Server error occurred."};
        }
    }
);


export async function switchOrganization(organizationId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return {success: false, error: "Not authenticated"};
    }

    // Verify the user is a member of that org
    const membership = await prisma.member.findFirst({
        where: {userId: session.user.id, organizationId},
    });

    if (!membership) {
        return {success: false, error: "Not authorized for this organization"};
    }

    await prisma.user.update({
        where: {id: session.user.id},
        data: {activeOrganizationId: organizationId},
    });

    // Revalidate key pages that depend on org
    for (const p of PATHS) {
        revalidatePath(p);
    }

    return {success: true};
}

export async function subscribeToOrganization(email: string, host?: string | null): Promise<ApiResponse<{ id: string }>> {
    try {
        const lower = email.trim().toLowerCase();
        const isDomainValid = await validateEmailDomain(lower);

        if (!isDomainValid) {
            return {success: false, error: "Email domain is invalid or cannot receive emails."};
        }

        if (!host) return { success: false, error: "Missing host." };

        // Try custom domain first
        let org = await prisma.organization.findFirst({
            where: { customDomain: host, public: true, published: true },
            select: { id: true, subdomain: true },
        });

        // If not a custom domain, try subdomain.<ROOT_DOMAIN>
        if (!org) {
            const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
            const isSubOnRoot = root && host.endsWith(`.${root}`);
            const sub = isSubOnRoot ? host.slice(0, -(root.length + 1)) : null;

            if (sub) {
                org = await prisma.organization.findFirst({
                    where: { subdomain: sub, public: true, published: true },
                    select: { id: true, subdomain: true },
                });
            }
        }

        if (!org) return { success: false, error: "Organization not found." };

        const existing = await prisma.subscription.findFirst({
            where: { organizationId: org.id, email: lower },
            select: { id: true },
        });
        if (existing) {
            return { success: false, error: "You're already subscribed to this organization." };
        }

        const record = await prisma.subscription.create({
            data: {
                organizationId: org.id,
                email: lower,
            },
            select: { id: true },
        });

        await customerIOTrack({
            userId: null, // public form, no session
            event: "user_subscribed_to_organization",
            timestamp: new Date(),
            traits: {
                email: lower,
                organization_id: org.id,
            },
            properties: {
                email: lower,
                organizationId: org.id,
                organizationHost: host,
            },
        });

        return { success: true, data: { id: record.id } };
    } catch (err: any) {
        console.error("subscribePublic error", err);
        if (err?.code === "P2002") {
            return { success: false, error: "You're already subscribed to this organization." };
        }
        return { success: false, error: "Database error. Please try again later." };
    }
}

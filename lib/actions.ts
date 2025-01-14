"use server"

import prisma from "@/lib/prisma"
import {Roadmap, Organization, Prisma, Column, Kanban, Post, Task, User, Condition} from "@prisma/client"
import {revalidateTag} from "next/cache"
import {withOrganizationAttributeAuth, withOrganizationAuth, withRoadmapAuth} from "./auth"
import {getSession} from "@/lib/auth"
import {addDomainToVercel, removeDomainFromVercelProject, validDomainRegex,} from "@/lib/domains";
import {put} from "@vercel/blob";
import {customAlphabet} from "nanoid";
import {getBlurDataURL, logError, toKebabCase} from "@/lib/utils";
import {Session} from "next-auth";
import {sendInviteEmail, sendMemberRequestEmail, sendNewOrganizationEmail} from "@/lib/emails";
import {getKanbanFromOrganizationId} from "./fetchers"
import {ApiResponse} from "@/lib/types";

export async function createRoadmap(organizationId: string, roadmapTemplate?: any | undefined) {
    const roadmap = await prisma.roadmap.create({
        data: {
            organization: {
                connect: {id: organizationId}
            }
        }
    })

    // if a roadmap template was provided, create the relevant nodes, milestones, and edges
    if (roadmapTemplate?.milestones) {
        const milestones = roadmapTemplate.milestones

        const nodes = await Promise.all(
            milestones.map(async (milestone: any, index: number) => {
                // create Node & associated Milestone
                const node = await prisma.node.create({
                    data: {
                        roadmapId: roadmap.id,
                        type: 'MILESTONE',
                        positionX: index * 500,
                        positionY: 0,
                        data: {
                            create: {
                                roadmapId: roadmap.id,
                                organizationId,
                                type: milestone.type || 'NOTYPE',
                                status: milestone.status || "TODO",
                                title: milestone.title,
                                ...(milestone.description ? {description: milestone.description} : undefined),
                                ...(milestone.startDate ? {startDate: milestone.startDate} : undefined),
                                ...(milestone.endDate ? {endDate: milestone.endDate} : undefined),
                                ...(milestone.budget ? {budget: milestone.budget} : undefined),
                                // papers: milestone.papers || [],
                                private: milestone.private || false
                            }
                        }
                    }
                })

                // grab milestone so we can add tasks
                // createMany doesn't support nested creates - we must add tasks after creating the Milestone object
                const newMilestone = await prisma.milestone.findUnique({
                    where: {nodeId: node.id},
                    include: {
                        papers: true,
                        asset: {
                            include: {contacts: true, attachments: true}
                        },
                        RFP: {
                            include: {contacts: true, attachments: true}
                        },
                        tasks: true
                    }
                })

                // create tasks for relevant milestone
                // if (newMilestone) {
                //     await Promise.all((milestone.tasks || []).map(async (task: any, index: number) => (
                //         await prisma.task.create({
                //             data: {
                //                 milestoneId: newMilestone?.id,
                //                 status: task.status || "TODO",
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

        for (let i = 0; i < nodes.length - 1; i++) {
            await prisma.edge.create({
                data: {
                    roadmap: {connect: {id: roadmap.id}},
                    source: nodes[i]?.id,
                    target: nodes[i + 1]?.id
                }
            })
        }
    }

    return roadmap
}

const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    7
) // 7-character random string

export const createMemberRequest = async (organizationId: string): Promise<ApiResponse<any>> => {
    const session = await getSession()
    if (!session?.user.id) {
        throw new Error("You must be signed in to perform this action")
    }

    try {
        const memberRequest = await prisma.memberRequest.create({
            data: {
                email: session.user.email,
                role: "admin",
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
            }
        })

        const organization = await prisma.organization.findUnique({
            where: {
                id: organizationId
            }
        })

        if (organization) {
            await sendMemberRequestEmail(
                {
                    user: {
                        name: session.user.name,
                        email: session.user.email,
                        image: ""
                    },
                    admin: {
                        name: session?.user.name,
                        email: session?.user.email,
                        organizationName: organization.name || "",
                        organizationImage: organization.image || "",
                    },
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

export const createCondition = async (formData: FormData) => {
    const session = await getSession();
    if (!session?.user.id) {
        return {
            error: "Not authenticated"
        };
    }

    const name = formData.get("name") as string;
    const summary = formData.get("summary") as string;
    const slug = toKebabCase(name);
    const interestedModalities = (formData.get("interestedModalities") as string || "").split(",");
    const diseaseCategories = (formData.get("diseaseCategories") as string || "").split(",");
    const prevalenceNumerator = formData.get("prevalenceNumerator")
        ? parseInt(formData.get("prevalenceNumerator") as string, 10)
        : null;
    const prevalenceDenominator = formData.get("prevalenceDenominator")
        ? parseInt(formData.get("prevalenceDenominator") as string, 10)
        : null;
    const numberOfIdentifiedPatients = formData.get("numberOfIdentifiedPatients")
        ? parseInt(formData.get("numberOfIdentifiedPatients") as string, 10)
        : null;
    const relevantDiseaseMechanisms = (formData.get("relevantDiseaseMechanisms") as string || "").split(",");
    const associatedGenes = (formData.get("associatedGenes") as string || "").split(",");
    const associatedSystems = (formData.get("associatedSystems") as string || "").split(",");
    const associatedSignsAndSymptoms = (formData.get("associatedSignsAndSymptoms") as string || "").split(",");
    const existingDatabasesAndStudies = (formData.get("existingDatabasesAndStudies") as string || "").split(",");
    const assetsUnderDevelopment = (formData.get("assetsUnderDevelopment") as string || "").split(",");

    try {
        const condition = await prisma.condition.create({
            data: {
                name,
                summary,
                slug,
                interestedModalities,
                diseaseCategories,
                prevalenceNumerator,
                prevalenceDenominator,
                numberOfIdentifiedPatients,
                relevantDiseaseMechanisms,
                associatedGenes,
                associatedSystems,
                associatedSignsAndSymptoms,
                existingDatabasesAndStudies,
                assetsUnderDevelopment,
            }
        });

        if (!condition) {
            console.error("Error creating condition.");
            return { success: false, error: "Database error. Please try again later." };
        }

        return { success: true, data: condition };
    } catch (error: any) {
        console.error("Error creating condition:", error);
        return { success: false, error: "Database error. Please try again later." };
    }
};

export const connectOrganizationToCondition = async (organizationId: string | null | undefined, conditionId: string) => {
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
        return {success: false, error: error.message || "An error occurred while connecting the organization to the condition"}
    }
};

export const createOrganization = async (formData: FormData) => {
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

    try {
        const response = await prisma.organization.create({
            data: {
                name,
                description,
                subdomain,
                yearFounded: founded?.toString(),
                website,
                incorporationStatus,
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
            },
        });
        await prisma.member.create({
            data: {
                userId: session.user.id,
                email: session.user.email,
                role: "admin", // Creator of organization is admin by default
                organizationId: response.id
            }
        })
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
                    name: response.name,
                    subdomain: response.subdomain
                }
            }
        ).then(() => {
            console.log("email sent")
        })

        return response
    } catch (error: any) {
        if (error.code === "P2002") {
            return {
                error: `This subdomain is already taken`
            }
        } else {
            return {
                error: error.message
            }
        }
    }
}

export const toggleOrganizationVerified = async (organizationId: string) => {
    try {
        const organization = await prisma.organization.findUnique({
            where: {
                id: organizationId,
            }
        })

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
            console.log("Toggled verified status for organization", organization.id)
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

export const updateOrganization = withOrganizationAuth(
    async (formData: FormData, organization: Organization) => {
        // Convert FormData to a plain object
        const data: Record<string, any> = {};

        formData.forEach((value, key) => {
            // Attempt to parse numbers
            if (!isNaN(Number(value)) && value !== "") {
                data[key] = Number(value);
            } else {
                data[key] = value;
            }
        });

        try {
            const response = await prisma.organization.update({
                where: {
                    id: organization.id,
                },
                data,
            });

            return response;
        } catch (error: any) {
            console.error("Error updating organization:", error.message);
            throw new Error(error.message || "Failed to update organization.");
        }
    }
);


export const updateOrganizationAttribute = withOrganizationAttributeAuth(
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

            console.log(
                "Updated organization data! Revalidating tags: ",
                `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
                `${organization.customDomain}-metadata`
            )
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

export const deleteOrganization = withOrganizationAttributeAuth(
    async (_: FormData, organization: Organization) => {
        try {
            const response = await prisma.organization.delete({
                where: {
                    id: organization.id
                }
            })
            await revalidateTag(
                `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
            )
            response.customDomain &&
            (await revalidateTag(`${organization.customDomain}-metadata`))
            return response
        } catch (error: any) {
            return {
                error: error.message
            }
        }
    }
)

// export const createRoadmap = withOrganizationAuth(
//     async (_: FormData, organization: Organization) => {
//         const session = await getSession()
//         if (!session?.user.id) {
//             return {
//                 error: "Not authenticated"
//             }
//         }
//         const response = await prisma.roadmap.create({
//             data: {
//                 organizationId: organization.id,
//                 userId: session.user.id
//             }
//         })

//         await revalidateTag(
//             `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-roadmaps`
//         )
//         organization.customDomain &&
//             (await revalidateTag(`${organization.customDomain}-roadmaps`))

//         return response
//     }
// )

// creating a separate function for this because we're not using FormData
export const updateRoadmap = async (data: Roadmap) => {
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
            organization: true
        }
    })
    if (!roadmap || roadmap.userId !== session.user.id) {
        return {
            error: "Roadmap not found"
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
                content: data.content
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

export const updateRoadmapMetadata = withRoadmapAuth(
    async (
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
                        imageBlurhash: blurhash
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

export const deleteRoadmap = withRoadmapAuth(
    async (_: FormData, roadmap: Roadmap) => {
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
    }
)

export const editUser = async (
    _id: unknown,
    data: { [key: string]: unknown }
) => {
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
};

// Invite user function with updated Organization model
export async function inviteUser(
    session: Session | null,
    email: string = "therealflawnsontong@gmail.com",
    role: string = "admin",
    ip: string,
    organization: {
        organizationId: string
        organizationName: string
        organizationImage: string
    }
): Promise<ApiResponse<any>> {
    try {
        if (!session) {
            throw new Error("You must be signed in to perform this action")
        }

        if (email === session.user.email) {
            throw new Error("Cannot send invitation to yourself")
        }

        const lowerCaseEmail = email.toLowerCase()

        let invitationId: string | undefined
        const invitation = await prisma.invitation.create({
            data: {
                email: lowerCaseEmail,
                role: role,
                organizationId: organization.organizationId
            }
        }).then((res) => {
            console.log(`Invitation created for ${email}`)

            return res
        })
        invitationId = invitation.id

        await sendInviteEmail(
            {
                invitee: {
                    name: "",
                    email: email,
                    image: ""
                },
                inviter: {
                    name: session?.user.name,
                    email: session?.user.email,
                    image: session?.user.image,
                    organizationName: organization.organizationName,
                    organizationImage: organization.organizationImage,
                    ip: ip,
                },
                inviteLink: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login?invitationId=${invitationId}`
            }
        ).then(() => {
            console.log("email sent")
        })

        if (!invitation) {
            console.error("Error inviting user.")
            return {success: false, error: "Database error. please try again later."}
        }

        return {success: true, data: invitation}
    } catch (error: any) {
        console.error("Error inviting user:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

// Create or get organization (replaces organization logic with organization logic)
export async function createOrGetOrganization(
    input: {
        siteName: string
        siteSlug: string
    },
    userId: string | undefined,
    description: string
) {
    const session = await getSession()

    if (!session?.user.id) {
        return {
            error: "Not authenticated"
        }
    }

    try {
        // Try to find a organization by slug first
        if (input.siteSlug) {
            const site = await prisma.organization.findUnique({
                where: {
                    subdomain: input.siteSlug
                }
            })

            // If the organization is found, return it
            if (site) {
                return site
            }
        }

        // If no organization was found by slug or no slug was provided, create a new one if name is provided
        if (input.siteName) {
            return await prisma.organization.create({
                data: {
                    name: input.siteName,
                    description: description,
                    user: {
                        connect: {
                            id: session.user.id
                        }
                    }
                }
            })
        }

        // If neither name nor slug was provided or used, throw an error
        throw new Error("Organization name or slug must be provided")
    } catch (error) {
        console.error("Error creating or retrieving organization:", error)
        throw new Error("Failed to create or retrieve organization.")
    }
}

// Add a member to the organization
export async function addMemberToOrganization(
    organizationId: string,
    session: Session | null
) {
    try {
        if (!session || !organizationId) {
            throw new Error("Invalid session or organizationId")
        }

        const email = session.user?.email

        if (!email) {
            throw new Error("Email is required but is missing")
        }

        // If session and organizationId are valid, create a new member for the organization
        return await prisma.member.create({
            data: {
                email: email, // email is guaranteed to be a string here
                organizationId: organizationId, // Updated to organizationId
                role: "admin",
                userId: session.user?.id // Ensure userId is also non-null
            }
        })
    } catch (error) {
        console.error("Error adding member to organization:", error)
        throw new Error("Failed to add member to organization.")
    }
}

/* MILESTONE AND ROADMAP UPDATES ----------------------------------------------------------------------------------------- */

export async function updateDBFlow({roadmapId, nodes, edges}: {
    roadmapId: string | null,
    nodes: any[],
    edges: any[]
}) {
    try {
        if (!roadmapId) throw new Error('No roadmapId provided.')
        // console.log(`nodes:`, nodes)
        // console.log(`milestones:`, milestones)
        // console.log(`edges:`, edges)

        const organizations = await prisma.organization.findMany({
            include: {
                roadmaps: true
            }
        })
        const organization = organizations.find(org => org.roadmaps.map(r => r.id).includes(roadmapId))

        if (!organization) throw new Error(`Could not find organization with roadmap id: ${roadmapId}`)
        const organizationId: string = organization.id

        // Delete any nodes that are not in the request
        const nodeIds = nodes.map((node: any) => node.id)
        const nodesInDB = await prisma.node.findMany({select: {id: true}})
        const nodeIdsInDB = (nodesInDB || []).map((node: any) => node.id)
        const nodesToDelete = nodeIdsInDB.filter(
            (id: string) => !nodeIds.includes(id)
        )

        await prisma.node.deleteMany({
            where: {
                id: {in: nodesToDelete}
            }
        })

        await prisma.edge.deleteMany()

        // Save or update nodes
        await Promise.all(
            nodes.map(async (node: any) => {
                const n = await prisma.node.upsert({
                    include: { data: true },
                    where: {id: node.id},
                    update: {
                        positionX: node.position?.x,
                        positionY: node.position?.y
                    },
                    create: {
                        id: node.id,
                        roadmap: {
                            connect: {id: roadmapId}
                        },
                        type: node.type,
                        positionX: node.position?.x,
                        positionY: node.position?.y,
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
                                type: node.data?.type || undefined,
                                description: node.data?.description,
                                startDate: node.data?.startDate,
                                endDate: node.data?.endDate,
                                budget: node.data?.budget,
                                papers: {
                                    createMany: {
                                        data: (node.data?.papers || []).map((paper: any) => ({
                                            link: paper.link,
                                            ...(paper.name ? {name: paper.name} : undefined)
                                        }))
                                    }
                                },
                                status: node.data?.status || "TODO",
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

        console.log(`Successfully updated Flow`)
    } catch (error) {
        console.error(`Error updating Flow: `, error)
    }
}

type MilestoneType = Prisma.MilestoneGetPayload<{
    include: {
        papers: true,
        asset: {
            include: { contacts: true, attachments: true }
        },
        RFP: {
            include: { contacts: true, attachments: true }
        },
        tasks: true
    }
}>

export async function updateDBMilestones({milestones}: { milestones: any[] }) {
    try {
        await Promise.all(
            milestones.map(async (milestone: any) => {
                const previousMilestone = await prisma.milestone.findUnique({
                    where: { nodeId: milestone.nodeId },
                    // where: {id: milestone.id},
                    include: {
                        papers: true,
                        asset: {
                            include: {contacts: true, attachments: true}
                        },
                        RFP: {
                            include: {contacts: true, attachments: true}
                        },
                        tasks: true
                    }
                })

                if (!previousMilestone) {
                    // milestone doesn't exist, throw error
                    throw new Error(`Milestone (${milestone.title}) with ID ${milestone.id} does not exist.`);
                }

                await prisma.milestone.update({
                    where: { nodeId: milestone.nodeId },
                    // where: {id: milestone.id},
                    include: {
                        papers: true,
                        asset: {
                            include: {contacts: true, attachments: true}
                        },
                        RFP: {
                            include: {contacts: true, attachments: true}
                        },
                    },
                    data: {
                        title: milestone.title,
                        type: milestone.type,
                        description: milestone.description,
                        startDate: milestone.startDate,
                        endDate: milestone.endDate,
                        budget: milestone.budget,
                        papers: {
                            deleteMany: {}, // clear all existing papers
                            createMany: {
                                data: milestone.papers.map((paper: any) => ({
                                    link: paper.link,
                                    ...(paper.name ? {name: paper.name} : undefined)
                                }))
                            }
                        },
                        status: milestone.status || "TODO",
                        private: milestone.private || false,
                    }
                })

                updateAssets(previousMilestone, milestone)

                updateRFP(previousMilestone, milestone)
            })
        )

        console.log(`Successfully updated Milestone`)
    } catch (error) {
        console.error(`Error updating Milestone: `, error)
    }
}

async function updateAssets(previousMilestone: MilestoneType, milestone: MilestoneType) {
    if (milestone.asset) {
        await prisma.milestone.update({
            where: {id: milestone.id},
            include: {
                asset: {include: {contacts: true, attachments: true}}
            },
            data: {
                asset: {
                    upsert: {
                        create: {
                            name: milestone.asset.name
                        },
                        update: {
                            name: milestone.asset.name,
                            description: milestone.asset.description,
                            contacts: {
                                deleteMany: {},  // clear all existing contacts
                                createMany: {
                                    data: milestone.asset.contacts.map((contact: any) => ({
                                        name: contact.name,
                                        role: contact.role,
                                        email: contact.email
                                    }))
                                }
                            },
                            attachments: {
                                deleteMany: {}, // clear all existing attachments
                                createMany: {
                                    data: milestone.asset.attachments.map((attachment: any) => ({
                                        link: attachment.link,
                                        name: attachment.name
                                    }))
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    if (!milestone.asset && previousMilestone.asset) {
        await prisma.milestone.update({
            where: {id: milestone.id},
            include: {
                asset: {include: {contacts: true, attachments: true}}
            },
            data: {
                asset: {delete: true}
            }
        })
    }
}

async function updateRFP(previousMilestone: MilestoneType, milestone: MilestoneType) {
    if (milestone.RFP) {
        await prisma.milestone.update({
            where: {id: milestone.id},
            include: {
                RFP: {include: {contacts: true, attachments: true}},
            },
            data: {
                RFP: {
                    upsert: {
                        create: {
                            name: milestone.RFP.name,
                            funding: milestone.RFP.funding,
                            researchFocus: milestone.type,
                            openTo: milestone.RFP.openTo
                        },
                        update: {
                            name: milestone.RFP.name,
                            funding: milestone.RFP.funding,
                            description: milestone.RFP.description,
                            contacts: {
                                deleteMany: {}, // clear all existing contacts
                                createMany: {
                                    data: milestone.RFP.contacts.map((contact: any) => ({
                                        name: contact.name,
                                        role: contact.role,
                                        email: contact.email
                                    }))
                                }
                            },
                            attachments: {
                                deleteMany: {}, // clear all existing attachments
                                createMany: {
                                    data: milestone.RFP.attachments.map((attachment: any) => ({
                                        link: attachment.link,
                                        name: attachment.name
                                    }))
                                }
                            },
                            researchFocus: milestone.type,
                            openTo: milestone.RFP.openTo,
                            startDate: milestone.RFP.startDate,
                            endDate: milestone.RFP.endDate
                        }
                    }
                }
            }
        })
    }

    if (!milestone.RFP && previousMilestone.RFP) {
        await prisma.milestone.update({
            where: {id: milestone.id},
            include: {
                RFP: {include: {contacts: true, attachments: true}},
            },
            data: {
                RFP: {delete: true}
            }
        })
    }
}

export async function updateDBColumns({columns}: { columns: Column[] }) {
    try {
        await Promise.all(
            columns.map(async (column: any) => {
                await prisma.column.update({
                    where: {id: column?.id},
                    data: {
                        name: column.name,
                        kanbanPosition: column.kanbanPosition
                    }
                })
            })
        )

        console.log(`Successfully updated Task`)
    } catch (error) {
        console.error(`Error updating Task: `, error)
    }
}

export async function updateDBTask({tasks}: { tasks: Task[] }) {
    try {
        console.log(`tasks:`, tasks)
        let updatedTasks: Task[] = []

        await Promise.all(
            tasks.map(async (task: any) => {
                if (!task) return

                let t = await prisma.task.update({
                    where: {id: task?.id},
                    include: {milestone: true},
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
                            set: [],
                            connect: task.stakeholders?.map((stakeholder: User) => ({id: stakeholder?.id})) || []
                        },
                        milestone: task.milestoneId
                            ? {connect: { id: task.milestoneId }} // Connect if milestoneId exists
                            : {disconnect: true}, // Disconnect if milestoneId is undefined
                        endDate: task.endDate,
                        priority: task.priority,
                        private: task.private,
                        column: {
                            connect: {id: task.columnId}
                        }
                    }
                })

                updatedTasks.push(t)
            })
        )

        console.log(`Successfully updated Task`)
        return updatedTasks
    } catch (error) {
        console.error(`Error updating Task: `, error)
    }
}

export async function deleteOrgRoadmap(
    roadmapId: string,
    organizationId: string
) {
    try {
        const response = await prisma.roadmap.delete({
            where: {
                id: roadmapId,
                organizationId: organizationId
            }
        })

        if (!response) {
            return {success: false, error: 'roadmap not found'}
        }

        return {success: true, data: response}
    } catch (error: any) {
        logError("Error deleting roadmap", error)
        return {success: false, error: "Internal server error"}
    }
}

// Invite user function with updated Organization model
export async function leaveOrganization(
    session: Session | null,
    organizationId: string
) {
    try {
        if (!session) {
            return {success: false, error: "Session not found."};
        }

        const member = await prisma.member.delete({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId: organizationId,
                }
            }
        })

        if (!member) {
            return {success: false, error: "membership not found"};
        }

        return {success: true, data: member};
    } catch (error: any) {
        logError("Error fetching membership data", error);
        return {success: false, error: "Internal server error"};
    }
}

// Invite user function with updated Organization model
export async function deleteUser(
    session: Session | null,
) {
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

export async function createKanban(orgId: string) {
    try {
        const newKanban = await prisma.kanban.create({
            data: {
                organization: { connect: { id: orgId } },
                columns: {
                    create: [
                        {
                            name: "To Do",
                            kanbanPosition: 0
                        },
                        {
                            name: 'In Progress',
                            kanbanPosition: 1
                        },
                        {
                            name: 'Done',
                            kanbanPosition: 2
                        }
                    ]
                }
            }
        })

        return {success: true, data: newKanban}
    } catch (error: any) {
        logError(`Error creating kanban task for ${orgId}`, error)
        return {success: false, error: "Internal server error"}
    }
}

export async function createNewKanbanTask(task: Prisma.TaskGetPayload<{
    select: {
        id: true,
        name: true,
        orderPosition: true,
        kanbanPosition: true,
        columnId: true
    }
}>) {
    try {
        const newTask = prisma.task.create({
            data: {
                id: task.id,
                column: {
                    connect: {
                        id: task.columnId
                    }
                },
                name: task.name,
                orderPosition: 0,
                kanbanPosition: 0
            }
        })

        if (!newTask) {
            return {success: false, error: "membership not found"};
        }

        return {success: true, data: newTask};
    } catch (error: any) {
        logError("Error fetching membership data", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function createKanbanColumn(column: Column) {
    try {
        const {data: kanban} = await getKanbanFromOrganizationId()
        if (!kanban) return {success: false, error: "failed to find associated kanban board"}

        const newColumn = prisma.column.create({
            data: {
                id: column.id,
                kanban: {
                    connect: {
                        id: kanban.id
                    },
                },
                name: column.name,
                kanbanPosition: 0
            }
        })

        if (!newColumn) {
            return {success: false, error: "failed to create kanban column"};
        }

        return {success: true, data: newColumn};
    } catch (error: any) {
        logError("Error creating kanban column", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function deleteKanbanColumn(columnId: string) {
    try {
        const deletedColumn = prisma.column.delete({
            where: {
                id: columnId
            }
        })

        if (!deletedColumn) {
            return {success: false, error: "failed to delete kanban column"};
        }

        return {success: true, data: deletedColumn};
    } catch (error: any) {
        logError("Error deleting kanban column", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function createPost(formData: FormData) {
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

export async function deletePost(postId: string) {
    try {
        const post = prisma.post.delete({
            where: {
                id: postId
            }
        })

        if (!post) {
            return {success: false, error: "failed to delete post"};
        }

        return {success: true, data: post};
    } catch (error: any) {
        logError("Error deleting post", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function createComment(postId: string | null, text: string) {
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

export async function createFollow(organizationId: string | null) {
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

export async function acceptInvitation(invitationId: string) {
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

        if (!invitation || invitation.accepted) {
            console.log("No valid invitation found or it has already been accepted.");
            return {success: false, error: "failed to follow organization"};
        }

        // Process invitation: create membership and mark invitation as accepted
        await prisma.$transaction([
            prisma.member.create({
                data: {
                    email: invitation.email,
                    organizationId: invitation.organizationId,
                    role: invitation.role || "admin",
                    userId: session.user.id,
                },
            }),
            prisma.invitation.update({
                where: {
                    id: invitationId,
                },
                data: {
                    accepted: true,
                },
            }),
        ]);

        return {success: true, data: invitation};
    } catch (error) {
        console.error();
        logError("Error accepting invitation:", error);
        return {success: false, error: "Failed to accept invitation. Please try again."};
    }
}


export async function updateCondition(formData: FormData, organizationId: string) {
    try {
        // Convert FormData to a plain object
        const data: Record<string, any> = {};
        formData.forEach((value, key) => {
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
            where: { organizationId },
            include: { condition: true },
        });

        if (!conditions || conditions.length === 0) {
            throw new Error("No associated condition found for the organization.");
        }

        // Update the condition in Prisma
        const updatedCondition = await prisma.condition.update({
            where: { id: conditions[0].conditionId },
            data,
        });

        return { success: true, data: updatedCondition };
    } catch (error: any) {
        console.error("Error updating condition:", error);
        return { success: false, error: error.message || "Failed to update condition." };
    }
}

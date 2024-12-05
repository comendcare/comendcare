"use server"

import prisma from "@/lib/prisma"
import {Roadmap, Organization, Prisma} from "@prisma/client"
import {revalidateTag} from "next/cache"
import {withOrganizationAuth, withRoadmapAuth} from "./auth"
import {getSession} from "@/lib/auth"
import {addDomainToVercel, removeDomainFromVercelProject, validDomainRegex,} from "@/lib/domains";
import {put} from "@vercel/blob";
import {customAlphabet} from "nanoid";
import {getBlurDataURL, logError} from "@/lib/utils";
import {Session} from "next-auth";
import {sendInviteEmail, sendMemberRequestEmail} from "@/lib/emails";


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
                                type: milestone.type || 'NOTYPE',
                                status: milestone.status || "TODO",
                                title: milestone.title,
                                ...(milestone.description ? {description: milestone.description} : undefined),
                                ...(milestone.startDate ? {startDate: milestone.startDate} : undefined),
                                ...(milestone.endDate ? {endDate: milestone.endDate} : undefined),
                                ...(milestone.budget ? {budget: milestone.budget} : undefined),
                                papers: milestone.papers || [],
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
                if (newMilestone) {
                    await Promise.all((milestone.tasks || []).map(async (task: any, index: number) => (
                        await prisma.task.create({
                            data: {
                                milestoneId: newMilestone?.id,
                                status: task.status || "TODO",
                                name: task.name,
                                orderPosition: index,
                                kanbanPosition: index,
                                checklist: {
                                    createMany: {
                                        data: (task.checklist || []).map((item: any, index: number) => ({
                                            name: item.name,
                                            complete: item.complete || false,
                                            orderPosition: index
                                        }))
                                    }
                                }
                            }
                        })
                    )))
                }

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

export const createMemberRequest = async (organizationId: string) => {
    const session = await getSession()
    if (!session?.user.id) {
        return {
            error: "Not authenticated"
        }
    }

    try {
        const response = await prisma.memberRequest.create({
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

        return response
    } catch (error: any) {
        return {
            error: error.message
        }
    }
}

export const createOrganization = async (formData: FormData) => {
    const session = await getSession()
    if (!session?.user.id) {
        return {
            error: "Not authenticated"
        }
    }
    const name = formData.get("orgName") as string
    const description = formData.get("description") as string
    const subdomain = formData.get("subdomain") as string

    try {
        const response = await prisma.organization.create({
            data: {
                name,
                description,
                subdomain,
                user: {
                    connect: {
                        id: session.user.id
                    }
                }
            }
        })
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
            } else {
                const prevalenceNumerator: number | undefined = parseInt(formData.get('prevalenceNumerator') as string) || undefined
                const prevalenceDenominator: number | undefined = parseInt(formData.get('prevalenceDenominator') as string) || undefined

                response = await prisma.organization.update({
                    where: {
                        id: organization.id
                    },
                    data: {
                        [key]: value,
                        // add prevalenceRatio (if applicable)
                        ...(prevalenceNumerator && prevalenceDenominator ?
                                {prevalenceRatio: prevalenceNumerator / prevalenceDenominator} :
                                undefined
                        )
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

export const deleteOrganization = withOrganizationAuth(
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
) {
    try {
        if (!session) {
            throw new Error("You must be signed in to perform this action")
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

        return invitation

        // return await prisma.member.create({
        //     data: {
        //         email: lowerCaseEmail,
        //         organization: {
        //             connect: {
        //                 id: organization.organizationId
        //             }
        //         },
        //         role: role,
        //         invitedBy: {
        //             connect: {
        //                 id: session?.user?.id
        //             }
        //         },
        //         meta: {
        //             invitationId,
        //         },
        //     },
        // }).then((res) => {
        //     console.log(`Membership created for ${email}`)
        //
        //     return res
        // })
    } catch (error) {
        console.error("Error inviting user:", error)
        throw new Error("Failed to invite user.")
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
                await prisma.node.upsert({
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
                                title: node.data?.title || "New Milestone",
                                status: node.data?.status || "TODO",
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
                    // where: { nodeId: milestone.nodeId },
                    where: {id: milestone.id},
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

                const previousTasks = previousMilestone?.tasks || []
                const tasksToDelete = previousTasks.filter((task) => !milestone.tasks.map((t: any) => t.id).includes(task.id))
                const tasksToUpdate = milestone.tasks?.filter((task: any) => previousMilestone?.tasks.map((t: any) => t.id).includes(task.id))
                const tasksToCreate = milestone.tasks.filter((task: any) => !previousMilestone?.tasks.map((t: any) => t.id).includes(task.id))

                // console.log(`tasks to delete`, tasksToDelete)
                // console.log(`tasks to update`, tasksToUpdate)
                // console.log(`tasks to create`, tasksToCreate)

                await prisma.milestone.update({
                    // where: { nodeId: milestone.nodeId },
                    where: {id: milestone.id},
                    include: {
                        papers: true,
                        asset: {
                            include: {contacts: true, attachments: true}
                        },
                        RFP: {
                            include: {contacts: true, attachments: true}
                        },
                        tasks: true
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
                        tasks: {
                            deleteMany: tasksToDelete
                                .filter((task: any) => task.id !== null && task.id !== undefined)
                                .map(task => ({id: task.id})),
                            createMany: {
                                data: tasksToCreate
                                    .filter((task: any) => task.id !== undefined && task.id !== undefined)
                                    .map((task: any) => ({
                                        id: task?.id || nanoid(),
                                        name: task?.name || "New Task",
                                        status: task?.status || "TODO",
                                        orderPosition: task.orderPosition || 0,
                                        kanbanPosition: task.kanbanPosition || 0,
                                    }))
                            }
                        },
                        status: milestone.status || "TODO",
                        private: milestone.private || false,
                    }
                })

                updateAssets(previousMilestone, milestone)

                updateRFP(previousMilestone, milestone)

                for (let i = 0; i < tasksToUpdate.length; i++) {
                    const task = tasksToUpdate[i]
                    await prisma.task.update({
                        where: {id: task.id},
                        data: {
                            name: task.name,
                            status: task.status,
                            orderPosition: task.orderPosition || 0
                        }
                    })
                }
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

export async function updateDBTask({tasks}: { tasks: any[] }) {
    try {
        // console.log(`tasks:`, tasks)

        await Promise.all(
            tasks.map(async (task: any) => {
                await prisma.task.update({
                    where: {id: task.id},
                    data: {
                        name: task.name,
                        status: task.status,
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
                        }
                    }
                })
            })
        )

        console.log(`Successfully updated Task`)
    } catch (error) {
        console.error(`Error updating Task: `, error)
    }
}

// Invite user function with updated Organization model
export async function leaveOrganization(
    session: Session | null,
    organizationId: string
) {
    try {
        if (!session) {
            return {success: false, error: "Internal server error"};
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

"use server"

import {unstable_cache} from "next/cache"
import prisma from "@/lib/prisma"
import {serialize} from "next-mdx-remote/serialize"
import {replaceExamples, replaceTweets} from "@/lib/remark-plugins"
import {ApiResponse} from "@/lib/types";
import {logError} from "@/lib/utils";
import {getSession} from "@/lib/auth";

export async function getConditionData(slug: string): Promise<ApiResponse<any>> {
    try {
        const condition = await prisma.condition.findUnique({
            where: {slug},
            include: {
                organizations: {
                    select: {
                        organization: true
                    }
                }
            },
        });

        if (!condition) {
            return {success: false, error: "Condition not found"};
        }

        return {success: true, data: condition};
    } catch (error: any) {
        logError("Error fetching condition data", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getConditionsDataFromOrgId(organizationId: string): Promise<ApiResponse<any[]>> {
    try {
        const conditions = await prisma.condition.findMany({
            where: {
                organizations: {some: {organizationId}},
            },
            include: {organizations: true},
        });

        return {success: true, data: conditions};
    } catch (error: any) {
        logError("Error fetching conditions data from organization ID", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getOrganizationData(domain: string) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : null

    return await unstable_cache(
        async () => {
            return prisma.organization.findUnique({
                where: subdomain ? {subdomain} : {customDomain: domain},
                include: {
                    user: true,
                    roadmaps: true,
                    members: {
                        include: {
                            user: true
                        }
                    }
                }
            })
        },
        [`${domain}-metadata`],
        {
            revalidate: 900,
            tags: [`${domain}-metadata`]
        }
    )()
}

export async function getRoadmapsForOrganization(domain: string) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : null

    const roadmaps = prisma.roadmap.findMany({
        where: {
            // organization: subdomain
            //     ? {subdomain}
            //     : {customDomain: domain},
            organization: {
                subdomain: subdomain,
            },
            // published: true
        },
        // select: {
        //     title: true,
        //     description: true,
        //     slug: true,
        //     image: true,
        //     imageBlurhash: true,
        //     createdAt: true,
        // },
        include: {
            nodes: {
                include: {
                    data: true
                },
                where: {
                    data: { private: false }
                }
            },
            edges: true,
            milestones: {
                where: {
                    private: false
                },
                include: {
                    asset: {
                        include: {
                            contacts: true,
                            attachments: true
                        }
                    },
                    RFP: {
                        include: {
                            contacts: true,
                            attachments: true
                        }
                    }
                }
            },
        },
        orderBy: [
            {
                createdAt: "desc"
            }
        ]
    })
    console.log(`roadmaps`, roadmaps)
    return roadmaps

    // return await unstable_cache(
    //     async () => {
    //         const roadmaps = prisma.roadmap.findMany({
    //             where: {
    //                 // organization: subdomain
    //                 //     ? {subdomain}
    //                 //     : {customDomain: domain},
    //                 organization: {
    //                     subdomain: subdomain,
    //                 },
    //                 // published: true
    //             },
    //             // select: {
    //             //     title: true,
    //             //     description: true,
    //             //     slug: true,
    //             //     image: true,
    //             //     imageBlurhash: true,
    //             //     createdAt: true,
    //             // },
    //             include: {
    //                 nodes: {
    //                     include: {
    //                         data: true
    //                     }
    //                 },
    //                 edges: true,
    //                 milestones: {
    //                     where: {
    //                         private: false
    //                     }
    //                 },
    //             },
    //             orderBy: [
    //                 {
    //                     createdAt: "desc"
    //                 }
    //             ]
    //         })
    //         console.log(`roadmaps`, roadmaps)
    //         return roadmaps
    //     },
    //     [`${domain}-roadmaps`],
    //     {
    //         revalidate: 900,
    //         tags: [`${domain}-roadmaps`]
    //     }
    // )()
}

export async function getRoadmapData(domain: string, slug: string) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : null

    return await unstable_cache(
        async () => {
            const data = await prisma.roadmap.findFirst({
                where: {
                    organization: subdomain
                        ? {subdomain}
                        : {customDomain: domain},
                    slug,
                    published: true
                },
                include: {
                    organization: {
                        include: {
                            user: true
                        }
                    }
                }
            })

            if (!data) return null

            const [mdxSource, adjacentRoadmaps] = await Promise.all([
                getMdxSource(data.content!),
                prisma.roadmap.findMany({
                    where: {
                        organization: subdomain
                            ? {subdomain}
                            : {customDomain: domain},
                        published: true,
                        NOT: {
                            id: data.id
                        }
                    },
                    select: {
                        slug: true,
                        title: true,
                        createdAt: true,
                        description: true,
                        image: true,
                        imageBlurhash: true
                    }
                })
            ])

            return {
                ...data,
                mdxSource,
                adjacentRoadmaps
            }
        },
        [`${domain}-${slug}`],
        {
            revalidate: 900, // 15 minutes
            tags: [`${domain}-${slug}`]
        }
    )()
}

async function getMdxSource(roadmapContents: string) {
    // transforms links like <link> to [link](link) as MDX doesn't support <link> syntax
    // https://mdxjs.com/docs/what-is-mdx/#markdown
    const content =
        roadmapContents?.replaceAll(/<(https?:\/\/\S+)>/g, "[$1]($1)") ?? ""
    // Serialize the content string into MDX
    const mdxSource = await serialize(content, {
        mdxOptions: {
            remarkPlugins: [replaceTweets, () => replaceExamples(prisma)]
        }
    })

    return mdxSource
}

export async function getMembers(organizationId: string | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedMembers = await prisma?.member.findMany({
            include: {user: true},
            where: {organizationId},
        })


        if (!fetchedMembers) {
            return {success: false, error: "members not found"};
        }

        return {
            success: true,
            data: fetchedMembers
        };
    } catch (error: any) {
        logError("Error fetching members", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getInvitees(organizationId: string | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedInvitees = await prisma?.invitation.findMany({
            where: {organizationId, accepted: false},
        })

        if (!fetchedInvitees) {
            return {success: false, error: "invitees not found"};
        }

        return {
            success: true,
            data: fetchedInvitees
        };
    } catch (error: any) {
        logError("Error fetching invitees", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getMemberRequests(organizationId: string | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedMemberRequests = await prisma?.memberRequest.findMany({
            include: {user: true},
            where: {organizationId},
        })

        // return {fetchedMemberRequests}

        if (!fetchedMemberRequests) {
            return {success: false, error: "user not found"};
        }

        return {
            success: true,
            data: {fetchedMemberRequests}
        };
    } catch (error: any) {
        logError("Error fetching member requests", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getUser(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            include: {organizations: true},
            where: {id: userId}
        })

        if (!user) {
            return {success: false, error: "user not found"};
        }

        return {
            success: true,
            data: user
        };
    } catch (error: any) {
        logError("Error fetching user", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getRoadmapId(orgId: string | null | undefined) {
    if (!orgId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const organization = await prisma.organization.findUnique({
            include: {roadmaps: true},
            where: {
                id: decodeURIComponent(orgId)
            }
        })

        if (!organization) {
            return {success: false, error: "organization not found"};
        }

        return {
            success: true,
            data: organization?.roadmaps && organization?.roadmaps?.length > 0 ? organization?.roadmaps[0].id : undefined
        };
    } catch (error: any) {
        logError("Error fetching roadmap id", error);
        return {success: false, error: "Internal server error"};
    }
}

export const getOrganizationFromOrganizationId = async (organizationId: string) => {
    try {
        const organization = await prisma.organization.findUnique({
            where: {
                id: organizationId,
            },
            include: {
                roadmaps: true,
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!organization) {
            return {success: false, error: "organization not found"};
        }

        return {success: true, data: organization};
    } catch (error: any) {
        logError("Error fetching organization data", error);
        return {success: false, error: "Internal server error"};
    }
};

export const getAllOrganizations = async () => {
    try {
        const organizations = await prisma.organization.findMany({
            orderBy: {
                createdAt: "asc"
            },
        })

        if (!organizations) {
            return {success: false, error: "organizations not found"};
        }

        return {success: true, data: organizations};
    } catch (error: any) {
        logError("Error fetching membership data", error);
        return {success: false, error: "Internal server error"};
    }
};

export const getAllOrganizationsFromUserId = async (userId: string) => {
    try {
        const memberships = await prisma.member.findMany({
            where: {
                userId: userId
            },
            include: {
                organization: true
            }
        });

        if (!memberships) {
            return {success: false, error: "memberships not found"};
        }

        return {success: true, data: memberships};
    } catch (error: any) {
        logError("Error fetching membership data", error);
        return {success: false, error: "Internal server error"};
    }
};

export const getOrganizationFromRoadmapId = async (roadmapId: string): Promise<ApiResponse<any>> => {
    try {
        const roadmap = await prisma.roadmap.findUnique({
            where: {
                id: roadmapId
            },
            select: {
                organizationId: true
            }
        })

        if (!roadmap) {
            return {success: false, error: "roadmap not found"};
        }

        return {success: true, data: roadmap?.organizationId};
    } catch (error: any) {
        logError("Error fetching roadmap data", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function checkSubdomainAvailability(nickname: string) {
    try {
        const existingOrg = await prisma.organization.findUnique({
            where: {subdomain: nickname},
        });
        console.log(`serverside: ${existingOrg}`)

        return !existingOrg
    } catch (error: any) {
        console.error("Database error checking subdomain availability:", error);
        return {error: "Database error. Please try again later."};
    }
}

export async function getMilestoneDetails(id: string) {
    try {
        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: {
                asset: {
                    include: {
                        contacts: true,
                        attachments: true,
                    }
                },
                RFP: {
                    include: {
                        contacts: true,
                        attachments: true
                    }
                },
                tasks: true,
                papers: true
            }
        })

        return {success: true, data: milestone}
    } catch (error: any) {
        console.error("Database error finding milestone details:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function getKanbanFromOrganizationId() {
    const session = await getSession()
    try {
        const kanban = await prisma.kanban.findUnique({
            where: {
                organizationId: session?.user.organizationId
            }
        })

        return {success: true, data: kanban}
    } catch (error: any) {
        console.error("Database error finding kanban details:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}
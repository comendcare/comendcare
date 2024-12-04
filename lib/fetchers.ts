"use server"

import {unstable_cache} from "next/cache"
import prisma from "@/lib/prisma"
import {serialize} from "next-mdx-remote/serialize"
import {replaceExamples, replaceTweets} from "@/lib/remark-plugins"

export async function getConditionData(slug: string) {
    return prisma.condition.findUnique({
        where: slug ? {slug} : {slug: slug},
        include: {organizations: true}
    })
}

export async function getConditionsDataFromOrgId(organizationId: string) {
    return prisma.condition.findMany({
        where: {
            organizations: {
                some: {
                    organizationId: organizationId
                }
            }
        },
        include: {organizations: true}
    })
}

export async function getOrganizationData(domain: string) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : null

    return await unstable_cache(
        async () => {
            return prisma.organization.findUnique({
                where: subdomain ? {subdomain} : {customDomain: domain},
                include: {user: true}
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

    return await unstable_cache(
        async () => {
            return prisma.roadmap.findMany({
                where: {
                    // organization: subdomain
                    //     ? {subdomain}
                    //     : {customDomain: domain},
                    organization: {
                        subdomain: subdomain
                    },
                    // published: true
                },
                select: {
                    title: true,
                    description: true,
                    slug: true,
                    image: true,
                    imageBlurhash: true,
                    createdAt: true
                },
                orderBy: [
                    {
                        createdAt: "desc"
                    }
                ]
            })
        },
        [`${domain}-roadmaps`],
        {
            revalidate: 900,
            tags: [`${domain}-roadmaps`]
        }
    )()
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

export async function getMembersAndInvitees(organizationId: string | undefined) {
    if (organizationId) {
        const [fetchedMembers, fetchedInvitees] = await Promise.all([
            prisma?.member.findMany({
                include: {user: true},
                where: {organizationId},
            }),
            prisma?.invitation.findMany({
                where: {organizationId, accepted: false},
            }),
        ]);

        return {fetchedMembers, fetchedInvitees};
    } else {
        console.log("No organizationId provided.")
        return {}
    }
}

export async function getMemberRequests(organizationId: string | undefined) {
    if (organizationId) {
        const fetchedMemberRequests = await prisma?.memberRequest.findMany({
            include: {user: true},
            where: {organizationId},
        })

        return {fetchedMemberRequests}
    } else {
        console.log("No organizationId provided.")
        return {}
    }
}

export async function getUser(userId: string) {
    const user = await prisma.user.findUnique({
        include: {organizations: true},
        where: {id: userId}
    })

    return user
}

export async function getRoadmapId(orgId: string | null | undefined) {
    if (!orgId) return

    const organization = await prisma.organization.findUnique({
        include: {roadmaps: true},
        where: {
            id: decodeURIComponent(orgId)
        }
    })

    // for now we're just getting the first roadmap, in the future we may enable multiple roadmaps per-organziation
    return organization?.roadmaps && organization?.roadmaps?.length > 0 ? organization?.roadmaps[0].id : undefined
}

export const getOrganizationFromOrganizationId = async (organizationId: string) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });
    return organization
};
export const getAllOrganizations = async () => {
    const organizations = await prisma.organization.findMany({
        orderBy: {
            createdAt: "asc"
        },
    })

    return organizations
};
export const getAllOrganizationsFromUserId = async (userId: string) => {
    const memberships = await prisma.member.findMany({
        where: {
            userId: userId
        },
        include: {
            organization: true
        }
    });
    return memberships
};
export const getOrganizationFromRoadmapId = async (roadmapId: string) => {
    const roadmap = await prisma.roadmap.findUnique({
        where: {
            id: roadmapId
        },
        select: {
            organizationId: true
        }
    })
    return roadmap?.organizationId
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
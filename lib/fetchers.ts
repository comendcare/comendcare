import {unstable_cache} from "next/cache"
import prisma from "@/lib/prisma"
import {serialize} from "next-mdx-remote/serialize"
import {replaceExamples, replaceTweets} from "@/lib/remark-plugins"

export async function getDisorderData(slug: string) {
    return prisma.condition.findUnique({
        where: slug ? {slug} : {slug: slug},
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

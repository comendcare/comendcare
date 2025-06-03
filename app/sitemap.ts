import { getPublicRoadmapsForOrganization } from "@/lib/fetchers"
import { headers } from "next/headers"

export default async function Sitemap() {
    const headersList = headers()
    const domain =
        headersList
            .get("host")
            ?.replace(
                ".localhost:3000",
                `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            ) ?? "vercel.pub"

    const posts = await getPublicRoadmapsForOrganization(domain, {
                id: true,
                title: true,
                description: true,
                slug: true,
                edges: true,
                milestones: true,
                nodes: true,
                modalities: true
            })

    return [
        {
            url: `https://${domain}`,
            lastModified: new Date()
        },
        ...posts.map(({ slug }) => ({
            url: `https://${domain}/${slug}`,
            lastModified: new Date()
        }))
    ]
}

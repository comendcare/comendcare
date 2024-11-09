import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import {getRoadmapData, getOrganizationData, getDisorderData} from "@/lib/fetchers"
import BlogCard from "@/components/blog-card"
import BlurImage from "@/components/blur-image"
import MDX from "@/components/mdx"
import { placeholderBlurhash, toDateString } from "@/lib/utils"
import * as domain from "node:domain";

export async function generateMetadata({
                                           params
                                       }: {
    params: { domain: string; slug: string }
}) {
    const slug = decodeURIComponent(params.slug)

    const data = await getDisorderData(slug)

    // Fallback to avoid passing null to title or description
    const title = data?.name || "Default Title" // Use a fallback title
    const description = data?.description || "Default description" // Use a fallback description

    if (!data) {
        return {
            title: "Page Not Found",
            description: "The page you are looking for does not exist."
        }
    }

    return {
        title,
        description,
        openGraph: {
            title: title || undefined, // Ensure it's not null
            description: description || undefined // Ensure it's not null
        },
        twitter: {
            card: "summary_large_image",
            title: title || undefined, // Ensure it's not null
            description: description || undefined, // Ensure it's not null
            creator: "@vercel"
        },
    }
}

export async function generateStaticParams() {
    const allRoadmaps = await prisma.roadmap.findMany({
        select: {
            slug: true,
            organization: {
                select: {
                    subdomain: true,
                    customDomain: true
                }
            }
        }
        // feel free to remove this filter if you want to generate paths for all roadmaps
        // where: {
        //     organization: {
        //         subdomain: "demo",
        //     },
        // },
    })

    const allPaths = allRoadmaps
        .flatMap(({ organization, slug }) => [
            organization?.subdomain && {
                domain: `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
                slug
            },
            organization?.customDomain && {
                domain: organization.customDomain,
                slug
            }
        ])
        .filter(Boolean)

    return allPaths
}

export default async function SitePostPage({
                                               params
                                           }: {
    params: { domain: string; slug: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const slug = decodeURIComponent(params.slug)
    const data = await getDisorderData(slug)

    if (!data) {
        notFound()
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center">
                <div className="m-auto w-full text-center md:w-7/12">
                    <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 dark:text-stone-400 md:text-base">
                        {toDateString(data.createdAt)}
                    </p>
                    <h1 className="mb-10 font-title text-3xl font-bold text-stone-800 dark:text-white md:text-6xl">
                        {data.name}
                    </h1>
                    <p className="text-md m-auto w-10/12 text-stone-600 dark:text-stone-400 md:text-lg">
                        {data.description}
                    </p>
                </div>
            </div>
        </>
    )
}

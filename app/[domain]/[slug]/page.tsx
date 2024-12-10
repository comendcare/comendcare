import {notFound, useSearchParams} from "next/navigation"
import prisma from "@/lib/prisma"
import {getRoadmapData, getOrganizationData, getRoadmapsForOrganization, getMilestoneDetails} from "@/lib/fetchers"
import BlogCard from "@/components/blog-card"
import BlurImage from "@/components/blur-image"
import MDX from "@/components/mdx"
import {cn, createDicebearAvatar, placeholderBlurhash, toDateString} from "@/lib/utils"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PublicFlowView } from "@/components/public-flow"
import { PublicTimelineView } from "@/components/public-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PublicRoadmap } from "@/components/public-roadmap"
import { PublicMilestoneDetails } from "@/components/public-milestone-details"

export async function generateMetadata({
                                           params
                                       }: {
    params: { domain: string; slug: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const slug = decodeURIComponent(params.slug)

    const [data, organizationData] = await Promise.all([
        getRoadmapData(domain, slug),
        getOrganizationData(domain)
    ])

    // Fallback to avoid passing null to title or description
    const title = data?.title || "Default Title" // Use a fallback title
    const description = data?.description || "Default description" // Use a fallback description

    if (!data || !organizationData) {
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
        ...(organizationData.customDomain && {
            alternates: {
                canonical: `https://${organizationData.customDomain}/${params.slug}`
            }
        })
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
        .flatMap(({organization, slug}) => [
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

export default async function OrganizationRoadmapPage({
                                                          params
                                                      }: {
    params: { domain: string; slug: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const slug = decodeURIComponent(params.slug)
    
    // const data = await getRoadmapData(domain, slug)
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(domain),
        getRoadmapsForOrganization(domain),
    ])

    if (!organization) {
        notFound()
    }

    return (
        <>
            {roadmaps.length > 0 ? (
                    <div className="flex flex-col items-center justify-center my-16 gap-8">
                        <div className="m-auto w-full text-center md:w-7/12">
                            <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 dark:text-stone-400 md:text-base">
                                {toDateString(roadmaps[0].createdAt)}
                            </p>
                        </div>

                        <div className="flex gap-4 items-center">
                            <img 
                                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                src={createDicebearAvatar(organization?.createdAt.toLocaleString() ?? "", 50, 40, "identicon")}
                                alt=""
                            />
                            <h1 className="truncate text-4xl font-bold text-gray-900">{organization.name}</h1>
                        </div>

                        <div className="m-auto w-full text-left md:w-7/12 flex flex-col gap-8">
                            <PublicRoadmap roadmap={roadmaps[0]} subdomain={organization?.subdomain || undefined} />
                            <PublicMilestoneDetails />
                        </div>
                    </div>
                ) :
                (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Image
                            alt="missing roadmap"
                            src="https://illustrations.popsy.co/gray/success.svg"
                            width={400}
                            height={400}
                            className="dark:hidden"
                        />
                        <Image
                            alt="missing roadmap"
                            src="https://illustrations.popsy.co/white/success.svg"
                            width={400}
                            height={400}
                            className="hidden dark:block"
                        />
                        <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                            No roadmaps yet.
                        </p>
                    </div>
                )
            }
        </>
    )
}

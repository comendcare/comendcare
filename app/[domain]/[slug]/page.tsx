import {notFound} from "next/navigation"
import prisma from "@/lib/prisma"
import {getRoadmapData, getOrganizationData, getRoadmapsForOrganization} from "@/lib/fetchers"
import BlogCard from "@/components/blog-card"
import BlurImage from "@/components/blur-image"
import MDX from "@/components/mdx"
import {cn, placeholderBlurhash, toDateString} from "@/lib/utils"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PublicFlowView } from "@/components/public-flow"
import { PublicTimelineView } from "@/components/public-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
        getRoadmapsForOrganization(domain)
    ])

    if (!organization) {
        notFound()
    }

    return (
        <>
            {roadmaps.length > 0 ? (
                    <div className="flex flex-col items-center justify-center my-12 gap-8">
                        <div className="m-auto w-full text-center md:w-7/12">
                            <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 dark:text-stone-400 md:text-base">
                                {toDateString(roadmaps[0].createdAt)}
                            </p>
                            <h1 className="mb-10 font-title text-3xl font-bold text-stone-800 dark:text-white md:text-6xl">
                                {roadmaps[0].title}
                            </h1>
                            <p className="text-md m-auto w-10/12 text-stone-600 dark:text-stone-400 md:text-lg">
                                {roadmaps[0].description}
                            </p>
                        </div>

                        <Card className="m-auto w-full text-left md:w-7/12">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                                    Research Plan
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="px-8">

                                <Tabs defaultValue="timeline" className="space-y-4 w-full">
                                    <TabsList>
                                        <TabsTrigger value="timeline">
                                            Timeline View
                                        </TabsTrigger>
                                        <TabsTrigger value="flow">
                                            Flow View
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="timeline" className="space-y-4 w-full">
                                        <PublicTimelineView roadmap={roadmaps[0]} />
                                    </TabsContent>
                                    <TabsContent value="flow" className="space-y-4 w-full">
                                        <div className="h-[600px]">
                                            <PublicFlowView roadmap={roadmaps[0]} />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
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

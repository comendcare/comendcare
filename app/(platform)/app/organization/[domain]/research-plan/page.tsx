"use server"
import React from "react";
import {notFound} from "next/navigation"
import prisma from "@/lib/prisma"
import {getOrganizationData, getPublicRoadmapsForOrganization} from "@/lib/fetchers"
import Image from "next/image"
import {Post} from "@/app/condition/[slug]/page";
import {FloatingDock} from "@/components/floating-dock";
import ShareDialog from "@/components/share-dialog";
import MarketplaceBreadcrumb from "@/components/marketplace-breadcrumb";
import { Mail, Share } from "lucide-react";
import ContactPAGDialog from "@/components/contact-pag-dialog";
import { PAGRoadmapHeader } from "@/components/pag-roadmap-header";
import { RoadmapsCard } from "@/components/public-roadmap-card";
import { mixpanelTrack } from "@/app/mixpanel";

export async function generateMetadata({
                                           params
                                       }: {
    params: { domain: string; slug: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const slug = decodeURIComponent(params.slug)

    const organizationData = await getOrganizationData(domain)

    // Fallback to avoid passing null to title or description
    const title = organizationData?.name || "Default Title" // Use a fallback title
    const description = organizationData?.description || "Default description" // Use a fallback description

    console.log("organizationData", organizationData)
    if (!organizationData) {
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

const posts: Post[] = [
    {
        id: '1',
        user: {
            name: 'John Doe',
            username: '@johndoe',
            avatar: '/placeholder.svg?height=40&width=40'
        },
        content: 'Just finished a great hike! The view was breathtaking. 🏞️ #NatureLover',
        image: '/placeholder.png',
        likes: 120,
        comments: 18,
        shares: 5,
        timestamp: '2 hours ago'
    },
    {
        id: '2',
        user: {
            name: 'Jane Smith',
            username: '@janesmith',
            avatar: '/placeholder.svg?height=40&width=40'
        },
        content: 'Excited to announce my new project! Stay tuned for more details. 🚀 #NewBeginnings',
        image: '/placeholder.png',
        likes: 89,
        comments: 32,
        shares: 12,
        timestamp: '5 hours ago'
    },
    {
        id: '3',
        user: {
            name: 'Bob Jackson',
            username: '@bobby',
            avatar: '/placeholder.svg?height=40&width=40'
        },
        content: 'Hello!. 🚀 #NewBeginnings',
        image: '/placeholder.png',
        likes: 29,
        comments: 32,
        shares: 1,
        timestamp: '5 hours ago'
    }
]

export default async function OrganizationRoadmapPage({
                                                          params
                                                      }: {
    params: { domain: string; slug: string }
}) {
    const domain = decodeURIComponent(params.domain)

    // const data = await getRoadmapData(domain, slug)
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(domain),
        getPublicRoadmapsForOrganization(domain),
    ])

    if (!organization) {
        notFound()
    }

    return (
        <>
            {roadmaps.length > 0 ? (
                    <>
                        <div
                            className="flex flex-col items-start justify-center gap-4 max-w-7xl mx-auto w-full text-left p-4"
                        >
                            <MarketplaceBreadcrumb
                                organization={organization}
                                roadmap={roadmaps[0]}
                                marketplaceDomain={"/app/marketplace/milestones"}
                            />

                            <PAGRoadmapHeader organization={organization} editable={false} />
                            <RoadmapsCard roadmaps={roadmaps} organization={organization}/>
                        </div>

                        <FloatingDock
                            items={[
                                {
                                    title: "Share on social media",
                                    icon: <Share />,
                                    dialog: (
                                        <ShareDialog
                                            url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmaps[0].id}`}
                                            organization={organization}
                                            // trackShareEvent={(socialOption: string) => {
                                            //     mixpanelTrack(`Research Plans Table Shared`, {
                                            //         "Platform": socialOption,
                                            //         ...(organization ? {
                                            //             "Organization ID": organization.id,
                                            //             "Organization Name": organization.name
                                            //         } : undefined)
                                            //     })
                                            // }}
                                            trackShareEvent={{
                                                title: `Research Plans Table Shared`
                                            }}
                                        />
                                    ),
                                },
                                // ...(organization.contactEmail
                                //     ? [
                                //         {
                                //             title: "Contact patient group",
                                //             icon: <Mail/>,
                                //             dialog: <ContactPAGDialog organization={organization} />,
                                //         },
                                //     ]
                                //     : []),
                            ]}
                            orientation="vertical"
                            desktopClassName="right-4"
                        />
                    </>
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

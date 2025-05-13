import {notFound, useSearchParams} from "next/navigation"
import prisma from "@/lib/prisma"
import {getOrganizationData, getPublicRoadmapsForOrganization} from "@/lib/fetchers"
import {formatMoney, standardizeYear} from "@/lib/utils"
import Image from "next/image"
import PAGPublicRoadmapBreadcrumb from "@/components/pag-public-roadmap-breadcrumb";
import {ProfilePhoto} from "@/components/profile-photo";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {FloatingDock} from "@/components/floating-dock";
import {IconFlag, IconShare} from "@tabler/icons-react";
import ShareDialog from "@/components/share-dialog";
import {SheetHeader, SheetTitle} from "@/components/ui/sheet";
import FeedbackForm from "@/components/feedback-form";
import React, { useState } from "react";
import { PublicRoadmapContent } from "@/components/public-roadmap-content"
import { Building2, Calendar, HandCoins, Mail, Share } from "lucide-react"
import ContactPAGDialog from "@/components/contact-pag-dialog";

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

// const posts: Post[] = [
//     {
//         id: '1',
//         user: {
//             name: 'John Doe',
//             username: '@johndoe',
//             avatar: '/placeholder.svg?height=40&width=40'
//         },
//         content: 'Just finished a great hike! The view was breathtaking. 🏞️ #NatureLover',
//         image: '/placeholder.png',
//         likes: 120,
//         comments: 18,
//         shares: 5,
//         timestamp: '2 hours ago'
//     },
//     {
//         id: '2',
//         user: {
//             name: 'Jane Smith',
//             username: '@janesmith',
//             avatar: '/placeholder.svg?height=40&width=40'
//         },
//         content: 'Excited to announce my new project! Stay tuned for more details. 🚀 #NewBeginnings',
//         image: '/placeholder.png',
//         likes: 89,
//         comments: 32,
//         shares: 12,
//         timestamp: '5 hours ago'
//     },
//     {
//         id: '3',
//         user: {
//             name: 'Bob Jackson',
//             username: '@bobby',
//             avatar: '/placeholder.svg?height=40&width=40'
//         },
//         content: 'Hello!. 🚀 #NewBeginnings',
//         image: '/placeholder.png',
//         likes: 29,
//         comments: 32,
//         shares: 1,
//         timestamp: '5 hours ago'
//     }
// ]

export default async function OrganizationRoadmapPage({
                                                          params
                                                      }: {
    params: { domain: string; slug: string; id: string }
}) {
    // const searchParams = useSearchParams()
    const domain = decodeURIComponent(params.domain)
    const slug = decodeURIComponent(params.slug)

    // const [milestone, setMilestone] = useState<string | undefined>(searchParams.get("project") || undefined)

    // const data = await getRoadmapData(domain, slug)
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(domain),
        getPublicRoadmapsForOrganization(domain),
    ])

    if (!organization) {
        notFound()
    }

    const roadmap = roadmaps.find(roadmap => roadmap.id === params.id)
    console.log(`roadmap`, roadmap)

    return (
        <>
            {roadmap ? (
                    <>
                        <div
                            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
                        >
                            <PAGPublicRoadmapBreadcrumb
                                organization={organization}
                                roadmap={roadmap}
                            />
                            <div className="w-full flex flex-col md:flex-row mx-auto px-8 gap-4 items-start">
                                    <ProfilePhoto
                                        img={organization.image}
                                        name={organization.name}
                                        className="h-16 w-16 rounded-full"
                                        textSize="small"
                                        editable={false}
                                    />
                                <div className="flex flex-col">
                                    <div className="flex gap-4 justify-between">
                                        <h1 className="text-wrap text-2xl md:text-3xl font-semibold">
                                            {organization?.name}
                                        </h1>
                                        {/*<ComendVerifiedBadge verified={organization.verified}/>*/}
                                    </div>
                                    <div className="w-full flex flex-wrap gap-x-6">
                                        {organization?.moneyRaised !== null && organization?.moneyRaised > 0 &&
                                            <div className="mt-2 flex items-center text-gray-500">
                                                <HandCoins
                                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                                {formatMoney(organization?.moneyRaised)} raised
                                            </div>
                                        }
                                        {organization?.yearFounded && (
                                            <div className="mt-2 flex items-center text-gray-500">
                                                <Calendar
                                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"/>
                                                Founded
                                                in {standardizeYear(organization?.yearFounded ?? "")}
                                            </div>
                                        )}
                                        {organization?.incorporationStatus === "YES" &&
                                            <div className="mt-2 flex items-center text-gray-500">
                                                <Building2
                                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"/>
                                                {`501(c)(3)`}
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>

                            <PublicRoadmapContent 
                                roadmap={roadmap}
                                subdomain={organization?.subdomain || undefined}
                                // milestoneChangedCallback={setMilestone}
                            />
                        </div>

                        <FloatingDock
                            items={[
                                {
                                    title: "Share on social media",
                                    icon: <Share />,
                                    dialog: (
                                        <ShareDialog
                                            url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmap}`}
                                            organization={organization}
                                            embeddedResearchPlanLink={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmap.id}`}
                                            // embeddedProjectLink={milestone ? `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmap.id}?project=${milestone}` : undefined}
                                        />
                                    ),
                                },
                                ...(organization.contactEmail
                                    ? [
                                        {
                                            title: "Contact patient group",
                                            icon: <Mail/>,
                                            dialog: <ContactPAGDialog organization={organization} />,
                                        },
                                    ]
                                    : []),
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

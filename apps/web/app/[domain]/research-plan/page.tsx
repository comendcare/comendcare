"use server"
import {notFound} from "next/navigation"
import prisma from "@comend/lib/prisma"
import {getOrganizationData, getResearchPlans} from "@comend/lib/fetchers"
import Image from "next/image"
import PAGPublicRoadmapBreadcrumb from "~web/components/pag-public-roadmap-breadcrumb";
import {FloatingDock} from "~web/components/floating-dock";
import ShareDialog from "~web/components/share-dialog";
import React from "react";
import { Mail, Share } from "lucide-react"
import { RoadmapsCard } from "~web/components/public-roadmap-card"
import { PAGRoadmapHeader } from "~web/components/pag-roadmap-header"

export async function generateMetadata({
    params
}: {
    params: { domain: string; slug: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const organizationData = await getOrganizationData(domain, {
        id: true,
        name: true,
        description: true,
        contactEmail: true,
        logo: true,
        image: true,
        subdomain: true,
        customDomain: true,
        yearFounded: true,
        moneyRaised: true,
        moneyDeployed: true,
        researchBudget: true,
    })

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
    params: { domain: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const organization = await getOrganizationData(domain, {
        id: true,
        name: true,
        description: true,
        contactEmail: true,
        logo: true,
        image: true,
        subdomain: true,
        customDomain: true,
        yearFounded: true,
        moneyRaised: true,
        moneyDeployed: true,
        researchBudget: true,
    })

    if (!organization) notFound()

    const {data: researchPlans, pageCount: researchPlansPageCount} = await getResearchPlans(
        organization.id,
        {
            id: true,
            title: true,
            description: true,
            published: true,
            organizationId: true,
            organization: true,
            modalities: true,
            stages: true,
            statuses: true,
            partners: true,
            links: true,
            milestones: {
                where: {private: false},
                include: {types: {include: {milestoneType: true}}}
            }
        },
        undefined,
        true,
    )
    
    return (
        <>
            {researchPlans.length > 0 ? (
                    <>
                        <div
                            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
                        >
                            <PAGPublicRoadmapBreadcrumb
                                organization={organization}
                                roadmap={undefined}
                            />
                            <PAGRoadmapHeader
                                organization={organization}
                                editable={false}
                            />
                            <RoadmapsCard
                                researchPlans={researchPlans}
                                researchPlansPageCount={researchPlansPageCount}
                                organization={organization}
                            />
                        </div>

                        <FloatingDock
                            items={[
                                {
                                    title: "Share on social media",
                                    icon: <Share />,
                                    dialog: (
                                        <ShareDialog
                                            url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`}
                                            organization={organization}
                                            trackShareEvent={{
                                                title: `Research Plans Table Shared`
                                            }}
                                        />
                                    ),
                                },
                                ...(organization.contactEmail
                                    ? [
                                        {
                                            title: "Contact patient group",
                                            icon: <Mail/>,
                                            href: `mailto:${organization.contactEmail}`
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

import { getOrganizationData, getPublicRoadmapsForOrganization } from "@/lib/fetchers"
import { notFound } from "next/navigation"
import {cn, formatMoney, standardizeYear} from "@/lib/utils"
import Image from "next/image"
import {ProfilePhoto} from "@/components/profile-photo";
import React from "react";
import { Building2, Calendar, HandCoins } from "lucide-react"
import { RoadmapCard } from "@/components/public-roadmap-card";
import { PAGRoadmapHeader } from "@/components/pag-roadmap-header";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default async function EmbeddedResearchPlanPage({params}: {params: {domain: string, researchPlanId: string}}) {
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(params.domain, {
            id: true,
            public: true,
            verified: true,
            published: true,
            name: true,
            description: true,
            contactEmail: true,
            logo: true,
            font: true,
            image: true,
            headerImage: true,
            biopharmaConsentSettings: true,
            subdomain: true,
            customDomain: true,
            statedGoal: true,
            yearFounded: true,
            incorporationStatus: true,
            therapeuticsOfInterest: true,
            therapeuticsInDevelopment: true,
            website: true,
            moneyRaised: true,
            moneyDeployed: true,
            researchBudget: true,
            // address1                  String?
            // address2                  String?
            // formattedAddress          String?
            // city                      String?
            // region                    String?
            // postalCode                String?
            // country                   String?
            // lat                       String?
            // lng                       String?
            createdAt: true,
            updatedAt: true,
            user: true,
            userId: true,
            roadmaps: true,
            members: true,
            clients: true,
            invitations: true,
            membershipRequests: true,
            conditions: true,
            kanban: true,
            milestones: true,
            platformNotifications: true,
            reviews: true,
            savedCompanies: true,
            tools: true,
            rfps: true,
            metadata: true
        }),
        getPublicRoadmapsForOrganization(params.domain, {
            id: true,
            title: true,
            description: true,
            slug: true,
            edges: true,
            milestones: true,
            nodes: true,
            modalities: true
        }),
    ])

    if (!organization) {
        notFound()
    }

    const roadmap = roadmaps.find(roadmap => roadmap.id === params.researchPlanId)

    return (
        <>
            {roadmap ? (
                    <>
                        <div
                            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
                        >
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank">
                                            {organization.name}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`} target="_blank">
                                            Research Plans
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmap.id}`} target="_blank">
                                            {roadmap?.title || 'Untitled Research Plan'}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                            <PAGRoadmapHeader organization={organization} editable={false} embedded={true}/>
                            <div className={"col-span-full w-full"}>
                                <RoadmapCard
                                    roadmap={roadmap}
                                    subdomain={params.domain || undefined}
                                    isPublic={true}
                                    externalLinks={true}
                                    urlView={'flow'}
                                />
                            </div>
                        </div>
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
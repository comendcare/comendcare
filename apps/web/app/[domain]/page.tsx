"use server"
import prisma from "@comend/lib/prisma"
import {notFound} from "next/navigation"
import {
    getOrganizationData,
    getConditionsDataFromOrgId,
    getPublicRFPsForOrganization,
    getPublicClinicalDatasetsForOrganization,
    getPublicRoadmapsForOrganization,
    getPublicToolCountsForOrganization
} from "@comend/lib/fetchers"
import PAGPublicProfileHeader from "~web/components/pag-public-profile-header";
import {RoadmapsCard} from "~web/components/public-roadmap-card";
import {PagProfileAboutCard} from "~web/components/pag-profile-about-card";
import {PAGProfileConditionsCard} from "~web/components/pag-profile-conditions-card";
import {FloatingDock} from "~web/components/floating-dock";
import ShareDialog from "~web/components/share-dialog";
import UnverifiedOrganizationPage from "~web/components/unverified-organization-page";
import {PAGProfileRFPsHoverableCard} from "~web/components/pag-profile-rfps-card";
import React from "react";
import UnpublishedOrganizationPage from "~web/components/unpublished-organization-page";
import {Mail, Share} from "lucide-react";
import { PAGProfileToolsCard } from "~web/components/pag-profile-tools-card";
import { SearchParams } from "@/packages/components/types";

interface IndexPageProps {
    params: {domain: string},
    searchParams: Promise<SearchParams>
}

export async function generateStaticParams() {
    const allOrganizations = await prisma.organization.findMany({
        select: {
            subdomain: true,
            customDomain: true
        }
        // feel free to remove this filter if you want to generate paths for all organizations
        // where: {
        //     subdomain: "demo",
        // },
    })

    const allPaths = allOrganizations
        .flatMap(({subdomain, customDomain}) => [
            subdomain && {
                domain: `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            },
            customDomain && {
                domain: customDomain
            }
        ])
        .filter(Boolean)
    return allPaths
}

export default async function OrganizationHomePage(props: IndexPageProps) {
    const searchParams = await props.searchParams
    const domain = decodeURIComponent(props.params.domain)
    const [organization, roadmaps, toolCounts, rfps] = await Promise.all([
        getOrganizationData(domain, {
            id: true,
            public: true,
            verified: true,
            published: true,
            name: true,
            description: true,
            contactEmail: true,
            logo: true,
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
        getPublicRoadmapsForOrganization(domain, {
            id: true,
            title: true,
            description: true,
            slug: true,
            edges: true,
            milestones: true,
            nodes: true,
            modalities: true
        }),
        getPublicToolCountsForOrganization(domain),
        getPublicRFPsForOrganization(domain, {
            id: true,
            title: true,
            description: true,
            openTo: true,
            startDate: true,
            endDate: true,
            budget: true,
            headerImage: true,
            contacts: true,
            attachments: true,
            milestones: true,
            organizationId: true,
            organization: true
        })
    ])

    if (!organization) {
        notFound()
    }

    let dbMilestones = []
    dbMilestones = await prisma.milestone.findMany({
        where: {roadmapId: organization.roadmaps?.[0]?.id},
        include: {
            node: true,
            contacts: true,
            attachments: true,
            types: {include: {milestoneType: true}},
            tools: {include: {tool: true}},
            rfps: {include: {rfp: true}}
        }
    })

    let conditions = null
    if (organization) {
        const response = await getConditionsDataFromOrgId(organization?.id, {
            id: true,
            name: true,
            summary: true,
            prevalenceNumerator: true,
            prevalenceDenominator: true,
            numberOfPatientsEngaged: true,
            nationalEstimatedPopulation: true,
            globalEstimatedPopulation: true,
            diseaseCategories: true,
            causalGenes: true,
            associatedGenes: true
        })
        if (response.success) {
            conditions = response.data
        } else {
            console.error(response.error)
        }
    }

    if (!organization.verified) {
        // Render unverified organization state
        return (
            <UnverifiedOrganizationPage organization={organization}/>
        );
    }

    if (!organization.published) {
        // Render unpublished organization state
        return (
            <UnpublishedOrganizationPage organization={organization}/>
        );
    }

    return (
        <>
            <main className="grid grid-cols-8 w-full max-w-7xl mx-auto mt-16 gap-4">
                <div className="col-span-8 flex flex-col items-center space-y-8 px-4 lg:px-0">
                    <PAGPublicProfileHeader organization={organization}/>

                    <div className="w-full grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="relative md:col-span-2 space-y-4">
                            <div className="sticky top-4 space-y-4">
                                <PagProfileAboutCard
                                    organization={organization as any}
                                    editable={false}
                                />
                                <PAGProfileConditionsCard
                                    conditions={conditions}
                                    organization={organization}
                                    showEditDialog={false}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-4 flex flex-col space-y-4">
                            {(rfps.length > 0) && (
                                <PAGProfileRFPsHoverableCard
                                    isPrivate={false}
                                    rfps={rfps}
                                />
                            )}
                            {/* tools card handles it's own data state via zustand - necessary for pagination to work properly */}
                            {(
                                toolCounts.biosampleCount > 0 || 
                                toolCounts.diseaseModelCount > 0 || 
                                toolCounts.clinicalDatasetCount > 0
                            ) && 
                                <PAGProfileToolsCard organizationId={organization.id} toolCounts={toolCounts} searchParams={searchParams}/>
                            }
                            <RoadmapsCard roadmaps={roadmaps} organization={organization}/>
                        </div>
                    </div>
                </div>
            </main>

            <FloatingDock
                items={[
                    {
                        title: "Share on social media",
                        icon: <Share />,
                        dialog: (
                            <ShareDialog
                                url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                                organization={organization}
                                // trackShareEvent={(socialOption: string) => {
                                //     mixpanelTrack(`Organization Profile Shared`, {
                                //         "Platform": socialOption,
                                //         ...(organization ? {
                                //             "Organization ID": organization.id,
                                //             "Organization Name": organization.name
                                //         } : undefined)
                                //     })
                                // }}
                                trackShareEvent={{
                                    title: `Organization Profile Shared`
                                }}
                            />
                        ),
                    },
                    ...(organization.contactEmail
                        ? [
                            {
                                title: "Contact patient group",
                                icon: <Mail/>,
                                // dialog: <ContactPAGDialog organization={organization}/>,
                                href: `mailto:${organization.contactEmail}`
                            },
                        ]
                        : []),
                ]}
                orientation="vertical"
                desktopClassName="right-4"
            />
        </>
    )
}

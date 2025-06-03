import prisma from "@/lib/prisma"
import {notFound} from "next/navigation"
import {getOrganizationData, getConditionsDataFromOrgId, getRFPs, getPublicAssetsForOrganization, getPublicRFPsForOrganization, getPublicRoadmapsForOrganization} from "@/lib/fetchers"
import PAGPublicProfileHeader from "@/components/pag-public-profile-header";
import {RoadmapCard, RoadmapsCard} from "@/components/public-roadmap-card";
import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {Card, CardContent} from "@/components/ui/card";
import Image from "next/image";
import {PAGProfileAssetsAndRFPsHoverableCard} from "@/components/pag-profile-assets-and-projects-hoverable-card";
import Link from "next/link";
import UnpublishedOrganizationPage from "@/components/unpublished-organization-page";
import MarketplaceBreadcrumb from "@/components/marketplace-breadcrumb";
import { PublicNoResearchPlans } from "@/components/no-research-plans";
import { Prisma } from "@prisma/client";

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

export default async function OrganizationHomePage({
                                                       params
                                                   }: {
    params: { domain: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const [organization, roadmaps, tools, rfps] = await Promise.all([
        getOrganizationData(domain, {
            id: true,
            name: true,
            description: true,
            contactEmail: true,
            image: true,
            headerImage: true,
            subdomain: true,
            yearFounded: true,
            incorporationStatus: true,
            therapeuticsOfInterest: true,
            therapeuticsInDevelopment: true,
            website: true,
            moneyRaised: true,
            moneyDeployed: true,
            researchBudget: true,
            members: true,
            conditions: true,
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
        getPublicAssetsForOrganization(domain, {
            title: true,
            description: true,
            contacts: true,
            attachments: true,
            pinned: true,
            milestones: true
        }),
        getPublicRFPsForOrganization(domain, {
            title: true,
            description: true,
            openTo: true,
            startDate: true,
            endDate: true,
            budget: true,
            headerImage: true,
            pinned: true,
            contacts: true,
            attachments: true,
            milestones: true
        })
    ])

    console.log(`organization members`, organization?.members)

    if (!organization) {
        notFound()
    }

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
            associatedGenes: true,
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
        <div className="flex flex-col w-full max-w-7xl mx-auto p-4 gap-4">
            <MarketplaceBreadcrumb
                organization={organization}
                marketplaceDomain={"/app/marketplace/patient-groups"}
            />
            <main className="grid grid-cols-8 w-full max-w-7xl mx-auto">
                <div className="col-span-8 flex flex-col items-center space-y-8">
                    <PAGPublicProfileHeader organization={organization}/>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                            {(tools.filter(a => a.pinned).length > 0 || rfps.filter(r => r.pinned).length > 0) && (
                                <PAGProfileAssetsAndRFPsHoverableCard
                                    isPrivate={false}
                                    tools={tools}
                                    rfps={rfps}
                                />
                            )}
                            <RoadmapsCard roadmaps={roadmaps} organization={organization}/>
                        </div>
                    </div>

                </div>
            </main>

        </div>
    )
}

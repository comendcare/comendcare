import prisma from "@/lib/prisma"
import {notFound} from "next/navigation"
import {getRoadmapsForOrganization, getOrganizationData, getConditionsDataFromOrgId, getAssetsForOrganization, getRFPs, getRFPsForOrganization} from "@/lib/fetchers"
import PAGPublicProfileHeader from "@/components/pag-public-profile-header";
import {RoadmapCard} from "@/components/public-roadmap-card";
import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {Card, CardContent} from "@/components/ui/card";
import Image from "next/image";
import {PAGProfileAssetsAndRFPsHoverableCard} from "@/components/pag-profile-assets-and-projects-hoverable-card";
import Link from "next/link";
import UnpublishedOrganizationPage from "@/components/unpublished-organization-page";
import MarketplaceBreadcrumb from "@/components/marketplace-breadcrumb";

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
    const [organization, roadmaps, assets, rfps] = await Promise.all([
        getOrganizationData(domain),
        getRoadmapsForOrganization(domain),
        getAssetsForOrganization(domain),
        getRFPsForOrganization(domain)
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
            types: { include: { milestoneType: true } },
            assets: { include: { asset: true } },
            rfps: { include: { rfp: true } }
        }
    })

    let conditions = null
    if (organization) {
        const response = await getConditionsDataFromOrgId(organization?.id)
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
                                    organization={organization}
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
                            <PAGProfileAssetsAndRFPsHoverableCard
                                isPrivate={false}
                                assets={assets}
                                rfps={rfps}
                            />
                            {roadmaps.length > 0 ?
                                <RoadmapCard
                                    roadmap={roadmaps?.[0]}
                                    subdomain={organization?.subdomain || undefined}
                                    isPublic={true}
                                    externalLinks={true}
                                />
                                : <Card>
                                    <CardContent>
                                        <div className="flex flex-col items-center justify-center space-x-4 my-8">
                                            <h1 className="font-cal text-4xl">No research plan yet</h1>
                                            <Image
                                                alt="missing roadmap"
                                                src="https://illustrations.popsy.co/gray/graphic-design.svg"
                                                width={400}
                                                height={400}
                                            />
                                            <p className="text-lg text-stone-500">
                                                {`${organization.name} doesn't have a roadmap yet.`}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            }
                        </div>
                    </div>

                </div>
            </main>

        </div>
    )
}

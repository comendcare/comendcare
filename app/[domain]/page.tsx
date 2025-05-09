import prisma from "@/lib/prisma"
import {notFound} from "next/navigation"
import {
    getOrganizationData,
    getConditionsDataFromOrgId,
    getPublicRFPsForOrganization,
    getPublicAssetsForOrganization,
    getPublicRoadmapsForOrganization
} from "@/lib/fetchers"
import PAGPublicProfileHeader from "@/components/pag-public-profile-header";
import {RoadmapCard, UnderDevelopmentCard} from "@/components/public-roadmap-card";
import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import {FloatingDock} from "@/components/floating-dock";
import ShareDialog from "@/components/share-dialog";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {PAGProfileAssetsAndRFPsHoverableCard} from "@/components/pag-profile-assets-and-projects-hoverable-card";
import React from "react";
import UnpublishedOrganizationPage from "@/components/unpublished-organization-page";
import ContactPAGDialog from "@/components/contact-pag-dialog";
import {Mail, Share} from "lucide-react";

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
        getPublicRoadmapsForOrganization(domain),
        getPublicAssetsForOrganization(domain),
        getPublicRFPsForOrganization(domain)
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
            assets: {include: {asset: true}},
            rfps: {include: {rfp: true}}
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
        <>
            <main className="grid grid-cols-8 w-full max-w-7xl mx-auto mt-16 gap-4">
                <div className="col-span-8 flex flex-col items-center space-y-8 px-4 lg:px-0">
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
                            {(assets.filter(a => a.pinned).length > 0 || rfps.filter(r => r.pinned).length > 0) && (
                                <PAGProfileAssetsAndRFPsHoverableCard
                                    isPrivate={false}
                                    assets={assets}
                                    rfps={rfps}
                                />
                            )}
                            {roadmaps.length > 0 ?
                                <RoadmapCard
                                    roadmap={roadmaps?.[0]}
                                    subdomain={organization?.subdomain || undefined}
                                    isPublic={true}
                                    externalLinks={true}
                                />
                                : <UnderDevelopmentCard isPublic={true}/>
                            }
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
                                url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}}`}
                                organization={organization}
                            />
                        ),
                    },
                    ...(organization.contactEmail
                        ? [
                            {
                                title: "Contact patient group",
                                icon: <Mail/>,
                                dialog: <ContactPAGDialog organization={organization}/>,
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

import prisma from "@/lib/prisma"
import {notFound} from "next/navigation"
import {getOrganizationData, getConditionsDataFromOrgId, getPublicAssetsForOrganization, getPublicRFPsForOrganization, getPublicRoadmapsForOrganization} from "@/lib/fetchers"
import PAGPublicProfileHeader from "@/components/pag-public-profile-header";
import {RoadmapsCard} from "@/components/public-roadmap-card";
import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {PAGProfileAssetsAndRFPsHoverableCard} from "@/components/pag-profile-assets-and-projects-hoverable-card";
import UnpublishedOrganizationPage from "@/components/unpublished-organization-page";
import MarketplaceBreadcrumb from "@/components/marketplace-breadcrumb";
import {IconEdit, IconFlag, IconShare} from "@tabler/icons-react";
import {DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import ShareDialog from "@/components/share-dialog";
import {FloatingDock} from "@/components/floating-dock";
import React from "react";
import {Mail} from "lucide-react";

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
            id: true,
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
            milestones: true,
            organizationId: true,
        })
    ])

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

            <FloatingDock
                items={[
                    // {
                    //     title: "Post on feed",
                    //     icon: <IconShare2 />,
                    //     href: "/app/feed",
                    // },
                    {
                        title: "Share on social media",
                        icon: <IconShare/>,
                        dialog: <ShareDialog
                            url={`${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/condition/${organization.subdomain}`}
                        />
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
                    // {
                    //     title: "Report an issue",
                    //     icon: <IconFlag/>,
                    //     dialog: (
                    //         <>
                    //             <DialogHeader>
                    //                 <DialogTitle>Edit profile</DialogTitle>
                    //                 <DialogDescription>
                    //                     {`Make changes to your profile here. Click save when you're done.`}
                    //                 </DialogDescription>
                    //             </DialogHeader>
                    //             <div className="grid gap-4 py-4">
                    //                 <Label htmlFor="name">Name</Label>
                    //                 <Input id="name" defaultValue="John Doe"/>
                    //             </div>
                    //             <DialogFooter>
                    //                 <Button type="submit">Save changes</Button>
                    //             </DialogFooter>
                    //         </>
                    //     ),
                    // }
                ]}
                orientation="vertical"
                desktopClassName="right-4"
            />

        </div>
    )
}

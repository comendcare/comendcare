import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {formatMoney, standardizeYear} from "@/lib/utils";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {getSession} from "@/lib/auth";
import Link from "next/link";
import prisma from "@/lib/prisma"
import {getConditionsDataFromOrgId, getOrganizationFromOrganizationId, getPublicAssetsForOrganization, getPublicRFPsForOrganization, getPublicRoadmapsForOrganization} from "@/lib/fetchers";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import {PAGProfileAssetsAndRFPsHoverableCard} from "@/components/pag-profile-assets-and-projects-hoverable-card";
import {ProfilePhoto} from "@/components/profile-photo";
import {PAGBannerPhoto} from "@/components/pag-banner-photo";
import {NoResearchPlanCard, RoadmapCard, RoadmapsCard} from "@/components/public-roadmap-card";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import NoOrganization from "@/components/no-organization";
import ComendVerifiedBadge from "@/components/comend-verified-badge";
import {PublishOrganizationSwitch} from "@/components/publish-organization-switch";
import {BiopharmaConsentSwitch} from "@/components/biopharma-consent-switch";
import EditPAGProfileHeaderDialog from "@/components/edit-pag-profile-header-dialog";
import {ProfileCompletionCard} from "@/components/profile-completion-card";
import EditPagProfileSubdomainDialog from "@/components/edit-pag-profile-subdomain-dialog";
import EditPAGContactEmailDialog from "@/components/edit-pag-contact-email-dialog";
import { Building2, Calendar, ExternalLink, HandCoins } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function ProfilePage() {
    const session = await getSession()

    let organization = null
    if (session?.user.organizationId) {
        const response = await getOrganizationFromOrganizationId(session?.user.organizationId)
        if (response.success) {
            organization = response.data
        } else {
            console.error(response.error)
        }
    }

    let conditions = null
    if (session?.user.organizationId) {
        console.log(`GET CONDITION FROM ORG ID`, session?.user.organizationId)
        const response = await getConditionsDataFromOrgId(session?.user.organizationId)
        if (response.success) {
            conditions = response.data
        } else {
            console.error(response.error)
        }
    }

    if (organization && organization?.subdomain) {
        const [roadmaps, assets, rfps] = await Promise.all([
            getPublicRoadmapsForOrganization(organization.subdomain),
            getPublicAssetsForOrganization(organization.subdomain),
            getPublicRFPsForOrganization(organization.subdomain)
        ])

        // Existing verified organization rendering logic
        return (
            <div className="grid grid-cols-5 px-4 w-full max-w-7xl my-4 mx-auto gap-4">
                <main className="col-span-4 flex flex-col items-center">
                    <ScrollArea id="profile-scroll-area" className="w-full flex flex-col mx-4 space-y-2">
                        <div className="w-full h-fit flex flex-col space-y-4">
                            <Card className="pb-4 flex flex-col gap-4 overflow-hidden">
                                <PAGBannerPhoto
                                    img={organization.headerImage}
                                    name={organization.headerImage}
                                    className="rounded-full ring-4 ring-white w-full"
                                    editable={true}
                                /> 

                                <div className="w-full flex flex-col md:flex-row mx-auto px-8 gap-4 items-start">
                                    <div className="h-fit w-fit -mt-16">
                                        <ProfilePhoto
                                            img={organization.image}
                                            name={organization.name}
                                            className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                            textSize="large"
                                            editable={true}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex gap-4 justify-between">
                                            <h1 className="text-wrap text-2xl lg:text-3xl font-semibold">
                                                {organization?.name}
                                            </h1>
                                            {/*<ComendVerifiedBadge verified={organization.verified}/>*/}
                                            <EditPAGProfileHeaderDialog organization={organization}/>
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
                            </Card>

                            <div className="grid grid-cols-6 gap-4 pb-8">
                                <div className="relative col-span-2 space-y-4">
                                    <div className="sticky top-4 space-y-4">
                                        <PagProfileAboutCard
                                            organization={organization}
                                            editable={true}
                                            isPrivate={true}
                                        />
                                        <PAGProfileConditionsCard
                                            conditions={conditions}
                                            organization={organization}
                                            showEditDialog={true}
                                            isPrivate={true}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-4 space-y-4">
                                    <ProfileCompletionCard/>
                                    <div className="flex flex-col gap-4 relative">
                                        <PAGProfileAssetsAndRFPsHoverableCard
                                            isPrivate={true}
                                            assets={assets}
                                            rfps={rfps}
                                        />
                                        <RoadmapsCard roadmaps={roadmaps} organization={organization}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </main>
                <Card className="col-span-1 flex flex-col space-y-4 h-fit">
                    <CardHeader className="flex flex-col gap-4 pb-0">
                        {/*<PublishOrganizationSwitch organization={organization}/>*/}
                        <BiopharmaConsentSwitch organization={organization} />

                        <div className="flex flex-col gap-2 pb-0">
                            <div
                                className="flex flex-row items-center justify-between"
                            >
                                Public URL
                                <EditPagProfileSubdomainDialog organization={organization}/>
                            </div>
                            <Link
                                href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-min inline-flex flex-row justify-start items-center gap-x-2 text-base truncate rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                            >
                                <span className="truncate block max-w-[150px] overflow-hidden whitespace-nowrap">
                                    {organization.subdomain}.comend.io
                                </span>
                                <ExternalLink className="flex-shrink-0 h-4 w-4"/>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2 pb-0">
                            <div className="flex flex-row items-center justify-between">
                                Contact Email
                                <EditPAGContactEmailDialog organization={organization}/>
                            </div>
                            {organization.contactEmail && organization.contactEmail.trim() !== "" ?
                                <p className="truncate">
                                    {organization.contactEmail}
                                </p>
                                :
                                <p className="text-muted-foreground">
                                    No contact email set
                                </p>
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    } else {
        return (
            <NoOrganization/>
        );
    }
}

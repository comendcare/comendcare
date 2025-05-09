"use client"

import ComendVerifiedBadge from "./comend-verified-badge";
import EditPAGProfileHeaderDialog from "./edit-pag-profile-header-dialog";
import { PAGBannerPhoto } from "./pag-banner-photo";
import { ProfilePhoto } from "./profile-photo";
import { Card, CardContent, CardHeader } from "./ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { formatMoney, standardizeYear } from "@/lib/utils";
import { PagProfileAboutCard } from "./pag-profile-about-card";
import { PAGProfileConditionsCard } from "./pag-profile-conditions-card";
// import { ProfileCompletionCard } from "./profile-completion-card";
import { PAGProfileAssetsAndRFPsHoverableCard } from "./pag-profile-assets-and-projects-hoverable-card";
import { RoadmapsCard } from "./public-roadmap-card";
import { PublishOrganizationSwitch } from "./publish-organization-switch";
import { BiopharmaConsentSwitch } from "./biopharma-consent-switch";
import EditPagProfileSubdomainDialog from "./edit-pag-profile-subdomain-dialog";
import Link from "next/link";
import EditPAGContactEmailDialog from "./edit-pag-contact-email-dialog";
import { Building2, Calendar, ExternalLink, HandCoins } from "lucide-react";

export function ProfilePageClient({organization, conditions, roadmaps, assets, rfps}: {organization: any, conditions: any[] | null, roadmaps: any[], assets: any[], rfps: any[]}) {
    return (
        <div className="grid grid-cols-5 px-4 w-full max-w-7xl my-4 mx-auto gap-4">
        <main className="col-span-4 flex flex-col items-center">
            <div className="w-full flex flex-col mx-4 space-y-2">
                <div className="w-full h-fit flex flex-col space-y-4">
                    <Card className="pb-4 flex flex-col gap-4">
                        <PAGBannerPhoto
                            img={organization.headerImage}
                            name={organization.headerImage}
                            className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
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
                    </Card>

                    <div className="grid grid-cols-6 gap-4 pb-8">
                        <div className="relative col-span-2 space-y-4">
                            <div className="sticky top-4 space-y-4">
                                <PagProfileAboutCard
                                    organization={organization}
                                    editable={true}
                                />
                                <PAGProfileConditionsCard
                                    conditions={conditions}
                                    organization={organization}
                                    showEditDialog={true}
                                />
                            </div>
                        </div>
                        <div className="col-span-4 space-y-4">
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
            </div>
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
                        className="w-full inline-flex flex-row justify-start items-center gap-x-2 text-base truncate rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                    >
                        <span className="truncate">{organization.subdomain}.comend.io</span>
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
    )
}

"use client"

import { FaArrowUpRightFromSquare, FaCalendar, FaCircleDollarToSlot, FaCity } from "react-icons/fa6";
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
import { NoResearchPlanCard, RoadmapCard } from "./public-roadmap-card";
import { PublishOrganizationSwitch } from "./publish-organization-switch";
import { BiopharmaConsentSwitch } from "./biopharma-consent-switch";
import EditPagProfileSubdomainDialog from "./edit-pag-profile-subdomain-dialog";
import Link from "next/link";
import EditPAGContactEmailDialog from "./edit-pag-contact-email-dialog";

export function ProfilePageClient({organization, conditions, roadmaps}: {organization: any, conditions: any[] | null, roadmaps: any[]}) {
    return (
        <div className="grid grid-cols-5 px-4 w-full max-w-7xl my-4 mx-auto gap-4">
        <main className="col-span-4 flex flex-col items-center">
            <div className="w-full flex flex-col mx-4 space-y-2">
                <div className="w-full flex flex-col space-y-4">
                    <Card className="pb-4">
                        <PAGBannerPhoto
                            img={organization.headerImage}
                            name={organization.headerImage}
                            className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                            editable={true}
                        />

                        <div
                            className="flex flex-row justify-between mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 gap-x-4">
                            <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                                <div className="flex bg-white rounded-full">
                                    {/* <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                src={getOrgPhoto(organization)}
                                alt=""/> */}
                                    <ProfilePhoto
                                        img={organization.image}
                                        name={organization.name}
                                        className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                        textSize="large"
                                        editable={true}
                                    />
                                </div>

                                <div
                                    className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                                    <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                        <div
                                            className="flex flex-col xl:flex-row items-baseline mt-6 min-w-0 flex-1 truncate text-3xl font-bold text-gray-900 gap-x-2">
                                            <HoverCard openDelay={0} closeDelay={0}>
                                                <HoverCardTrigger asChild>
                                                    <h1 className="truncate w-3/5">
                                                        {organization?.name}
                                                    </h1>
                                                </HoverCardTrigger>
                                                <HoverCardContent
                                                    side="top"
                                                    className="w-fit"
                                                >
                                                    <div className="space-y-2">
                                                        <h4 className="text-lg font-semibold">
                                                            {organization?.name}
                                                        </h4>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>

                                            <ComendVerifiedBadge verified={organization.verified}/>

                                            <EditPAGProfileHeaderDialog organization={organization}/>

                                        </div>
                                        <div
                                            className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                                            {organization?.moneyRaised !== null && organization?.moneyRaised > 0 &&
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <FaCircleDollarToSlot
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                    {formatMoney(organization?.moneyRaised)} raised
                                                </div>
                                            }
                                            {organization?.yearFounded && (
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <FaCalendar
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>
                                                    Founded
                                                    in {standardizeYear(organization?.yearFounded ?? "")}
                                                </div>
                                            )}
                                            {organization?.incorporationStatus === "YES" &&
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <FaCity
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>
                                                    {`501c3`}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
                                <h1 className="truncate text-2xl font-bold text-gray-900">{organization?.name}</h1>
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
                            {/*<PAGProfileAssetsCard/>*/}
                            {/*<PAGProfileOpenRFPsCard/>*/}
                        </div>
                        <div className="col-span-4 space-y-4">
                            {/*<Tabs defaultValue="roadmap" className="w-full">*/}
                            {/*    <TabsList className="grid w-full grid-cols-2">*/}
                            {/*        <TabsTrigger value="roadmap">*/}
                            {/*            Roadmap*/}
                            {/*        </TabsTrigger>*/}
                            {/*        <TabsTrigger*/}
                            {/*            value="activity"*/}
                            {/*            className="organization-profile-tour-step6"*/}
                            {/*        >*/}
                            {/*            Activity*/}
                            {/*        </TabsTrigger>*/}
                            {/*    </TabsList>*/}
                            {/*    <TabsContent value="roadmap" className="flex flex-col space-y-4">*/}
                            {/* <ProfileCompletionCard/> */}
                            <div className="flex flex-col gap-4 relative">
                                <PAGProfileAssetsAndRFPsHoverableCard
                                    isPrivate={true}
                                    assets={(roadmaps?.[0]?.milestones || []).filter((milestone: any) => milestone?.nodeType === "ASSET")}
                                    rfps={(roadmaps?.[0]?.milestones || []).filter((milestone: any) => milestone?.nodeType === "RFP")}
                                    // assets={roadmaps[0]?.milestones?.filter(milestone => milestone.asset).map(milestone => milestone.asset) || []}
                                    // rfps={roadmaps[0]?.milestones?.filter(milestone => milestone.RFP).map(milestone => milestone.RFP) || []}
                                />
                                <RoadmapCard
                                    roadmap={roadmaps[0]}
                                    subdomain={organization?.subdomain || undefined}
                                    isPublic={false}
                                    externalLinks={true}
                                />
                                {roadmaps.length <= 0 && (
                                    <div
                                        className="absolute inset-0 bg-black/10 backdrop-blur flex items-center justify-center p-4 rounded-md">
                                        <NoResearchPlanCard isPublic={false}/>
                                    </div>
                                )}
                            </div>
                            {/*    </TabsContent>*/}
                            {/*    <TabsContent value="activity" className="mt-0">*/}
                            {/*        <PAGProfileActivityCard/>*/}
                            {/*    </TabsContent>*/}
                            {/*</Tabs>*/}
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <Card className="col-span-1 flex flex-col space-y-4 h-fit">
            <CardHeader className="flex flex-col gap-4 pb-0">
                <PublishOrganizationSwitch organization={organization}/>
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
                        <FaArrowUpRightFromSquare className="flex-shrink-0 h-4 w-4"/>
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

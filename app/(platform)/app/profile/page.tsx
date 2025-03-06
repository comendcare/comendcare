import {
    FaArrowUpRightFromSquare,
    FaCalendar, FaCircleDollarToSlot, FaCity, FaEllipsis, FaEye, FaPen,
    FaPencil, FaPeopleGroup, FaPhone, FaPlus,
} from "react-icons/fa6";
import {Button, buttonVariants} from "@/components/ui/button";
import {LineChartCard} from "@/components/line-chart-card";
import {DonutChartCard} from "@/components/donut-chart-card";
import {UserFeedTextCard} from "@/components/user-feed-text-card";
import {UserNewPostCard} from "@/components/user-new-post-card";
import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {cn, formatMoney, standardizeYear} from "@/lib/utils";
import PrivateProfileDropdown from "@/components/private-profile-dropdown";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {getSession} from "@/lib/auth";
import Image from "next/image"
import Link from "next/link";
import {PAGProfileAssetsCard} from "@/components/pag-profile-assets-card";
import {PAGProfileActivityCard} from "@/components/pag-profile-activity-card";
import prisma from "@/lib/prisma"
import {PAGProfileOpenRFPsCard} from "@/components/pag-profile-open-rfps-card";
import EditPAGProfileDialog from "@/components/edit-pag-profile-page-dialog";
import {getConditionsDataFromOrgId, getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {toast} from "sonner";
import {PAGProfileAssetsAndRFPsHoverableCard} from "@/components/pag-profile-assets-and-projects-hoverable-card";
import {ProfilePhoto} from "@/components/profile-photo";
import {PAGBannerPhoto} from "@/components/pag-banner-photo";
import {RoadmapCard} from "@/components/public-roadmap-card";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import NoOrganization from "@/components/no-organization";
import ComendVerifiedBadge from "@/components/comend-verified-badge";
import {PublishOrganizationSwitch} from "@/components/publish-organization-switch";
import EditPAGProfileHeaderDialog from "@/components/edit-pag-profile-header-dialog";
import {ProfileCompletionCard} from "@/components/profile-completion-card";
import EditPagProfileSubdomainDialog from "@/components/edit-pag-profile-subdomain-dialog";

export default async function ProfilePage() {
    const session = await getSession()

    let organization = null
    // let dbMilestones = []
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
        const response = await getConditionsDataFromOrgId(session?.user.organizationId)
        if (response.success) {
            conditions = response.data
        } else {
            console.error(response.error)
        }
    }

    if (organization) {

        let roadmaps = await prisma.roadmap.findMany({
            where: {organizationId: organization?.id},
            include: {
                nodes: {
                    include: {
                        data: {
                            include: {
                                node: true,
                                contacts: true,
                                attachments: true
                            }
                        }
                    }
                },
                edges: true,
                milestones: {
                    include: {
                        node: true,
                        contacts: true,
                        attachments: true
                    }
                }
            }
        })

        // Existing verified organization rendering logic
        return (
            <div className="grid grid-cols-5 px-4 w-full max-w-7xl my-2 mx-auto gap-4">
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
                                                    className="flex flex-row items-baseline mt-6 min-w-0 flex-1 truncate text-3xl font-bold text-gray-900 gap-x-2">
                                                    <HoverCard openDelay={0} closeDelay={0}>
                                                        <HoverCardTrigger asChild>
                                                            <h1 className="truncate">
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
                                                    {organization?.moneyRaised &&
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
                                    <ProfileCompletionCard />
                                    <PAGProfileAssetsAndRFPsHoverableCard
                                        isPrivate={true}
                                        assets={(roadmaps?.[0]?.milestones || []).filter((milestone) => milestone?.node?.type === "ASSET")}
                                        rfps={(roadmaps?.[0]?.milestones || []).filter((milestone) => milestone?.node?.type === "RFP")}
                                        // assets={roadmaps[0]?.milestones?.filter(milestone => milestone.asset).map(milestone => milestone.asset) || []}
                                        // rfps={roadmaps[0]?.milestones?.filter(milestone => milestone.RFP).map(milestone => milestone.RFP) || []}
                                    />
                                    <RoadmapCard
                                        roadmap={roadmaps[0]}
                                        subdomain={organization?.subdomain || undefined}
                                        isPublic={false}
                                        externalLinks={true}
                                    />
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
                    <CardHeader className="flex flex-col gap-2 pb-0">
                        <PublishOrganizationSwitch organization={organization}/>
                        <CardTitle
                            className="text-xl flex flex-row items-center justify-between"
                        >
                            Public URL
                            <EditPagProfileSubdomainDialog organization={organization}/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link
                            href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-min inline-flex flex-row justify-start items-center gap-x-2 text-base truncate rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                        >
                            {organization.subdomain}.comend.io
                            <FaArrowUpRightFromSquare/>
                        </Link>
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

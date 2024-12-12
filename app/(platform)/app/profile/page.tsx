import {cookies} from "next/headers"
import {
    FaCalendar, FaCircleDollarToSlot, FaCity, FaEllipsis, FaPen,
    FaPencil, FaPeopleGroup, FaPhone, FaPlus,
} from "react-icons/fa6";
import {Button, buttonVariants} from "@/components/ui/button";
import {LineChartCard} from "@/components/line-chart-card";
import {DonutChartCard} from "@/components/donut-chart-card";
import {UserFeedTextCard} from "@/components/user-feed-text-card";
import {UserNewPostCard} from "@/components/user-new-post-card";
import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {cn, formatMoney} from "@/lib/utils";
import PrivateProfileDropdown from "@/components/private-profile-dropdown";
import EditPAGProfileHeaderDialog from "@/components/edit-pag-profile-header-dialog";
import {PAGProfileResearchPlanCard} from "@/components/pag-profile-research-plan-card";
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
import {PAGProfileAssetsAndProjectsCard} from "@/components/pag-profile-assets-and-projects-card";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {toast} from "sonner";
import {PAGProfileAssetsAndProjectsHoverableCard} from "@/components/pag-profile-assets-and-projects-hoverable-card";
import { ProfilePhoto } from "@/components/profile-photo";
import { PublicRoadmapCard } from "@/components/public-roadmap-card";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

export default async function ProfilePage() {
    const session = await getSession()
    const layout = cookies().get("react-resizable-panels:layout:platform")
    const collapsed = cookies().get("react-resizable-panels:collapsed")

    const defaultLayout = layout ? JSON.parse(layout.value) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

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
        if (!organization.verified) {
            // Render unverified organization state
            return (
                <div className="h-full flex flex-col items-center justify-center py-20">
                    <Image
                        alt="Organization not verified"
                        src="https://illustrations.popsy.co/gray/abstract-art-6.svg"
                        width={400}
                        height={400}
                        className="dark:hidden"
                    />
                    <Image
                        alt="Organization not verified"
                        src="https://illustrations.popsy.co/white/abstract-art-6.svg"
                        width={400}
                        height={400}
                        className="hidden dark:block"
                    />
                    <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                        {`Your organization is not verified yet.`}
                    </p>
                    <p className="mt-4 text-stone-500 dark:text-stone-300">
                        {`We're currently verifying your organization. If this is taking too long, please contact support.`}
                    </p>
                </div>
            );
        }

        let roadmaps = await prisma.roadmap.findMany({
            where: { organizationId: organization?.id },
            include: {
                nodes: {
                    include: { data: true }
                },
                edges: true,
                milestones: {
                    include: {
                        asset: {
                            include: {
                                contacts: true,
                                attachments: true
                            }
                        },
                        RFP: {
                            include: {
                                contacts: true,
                                attachments: true
                            }
                        }
                    }
                }
            }
        })

        // Existing verified organization rendering logic
        return (
            <main className="flex flex-col items-center w-full max-w-7xl mx-auto px-4">
                <div className="flex flex-col space-y-8 my-8">
                    <div>
                        <div>
                            <img className="h-32 w-full object-cover lg:h-48"
                                 src={'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}
                                 alt=""/>
                        </div>

                        <div className="flex flex-row justify-between mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                                    />
                                </div>
                                <div
                                    className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                                    <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                        <div className="mt-6 min-w-0 flex-1 truncate text-4xl font-bold text-gray-900 max-w-xl">
                                            <HoverCard>
                                                <HoverCardTrigger asChild>
                                                    <h1 className="truncate cursor-pointer">
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
                                        </div>
                                        <div
                                            className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                                            {organization?.numberOfIdentifiedPatients &&
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <FaPeopleGroup
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>
                                                    {organization?.numberOfIdentifiedPatients}+ patients
                                                </div>
                                            }
                                            {organization?.moneyRaised &&
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <FaCircleDollarToSlot
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                    ${formatMoney(organization?.moneyRaised)} raised
                                                </div>
                                            }
                                            <div className="mt-2 flex items-center text-gray-500">
                                                <FaCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                            aria-hidden="true"/>
                                                Founded in {new Date(organization?.createdAt ?? "").getFullYear()}
                                            </div>
                                            {organization?.incorporationStatus === "YES" &&
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <FaCity className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                            aria-hidden="true"/>
                                                    {`501c3`}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <div className="flex flex-row space-x-2">
                                    {/*<EditPAGProfileHeaderDialog/>*/}
                                    <EditPAGProfileDialog/>
                                    <Button
                                        className="gap-x-2"
                                    >
                                        <FaPlus/>
                                        Add post
                                    </Button>
                                    <PrivateProfileDropdown subdomain={organization.subdomain}/>
                                </div>
                            </div>
                            <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
                                <h1 className="truncate text-2xl font-bold text-gray-900">{organization?.name}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4">
                        <div className="relative col-span-2 space-y-4">
                            <div className="sticky top-4 space-y-4">
                                <PagProfileAboutCard organization={organization}/>
                                <PAGProfileConditionsCard conditions={conditions}/>
                            </div>
                            {/*<PAGProfileAssetsCard/>*/}
                            {/*<PAGProfileOpenRFPsCard/>*/}
                        </div>
                        <div className="col-span-4">
                            <Tabs defaultValue="roadmap" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="roadmap">
                                        Roadmap
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="activity"
                                        className="organization-profile-tour-step6"
                                    >
                                        Activity
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="roadmap" className="flex flex-col space-y-4">
                                    <PAGProfileAssetsAndProjectsHoverableCard 
                                        assets={roadmaps[0]?.milestones?.filter(milestone => milestone.asset).map(milestone => milestone.asset) || []}
                                        rfps={roadmaps[0]?.milestones?.filter(milestone => milestone.RFP).map(milestone => milestone.RFP) || []}
                                    />
                                    <PublicRoadmapCard roadmap={roadmaps[0]} subdomain={organization?.subdomain || undefined}/>
                                </TabsContent>
                                <TabsContent value="activity" className="mt-0">
                                    <PAGProfileActivityCard/>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>
        );
    } else {
        return (
            <div className="h-full flex flex-col items-center justify-center py-20">
                <Image
                    alt="No organization"
                    src="https://illustrations.popsy.co/gray/success.svg"
                    width={400}
                    height={400}
                    className="dark:hidden"
                />
                <Image
                    alt="No organization"
                    src="https://illustrations.popsy.co/white/success.svg"
                    width={400}
                    height={400}
                    className="hidden dark:block"
                />
                <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                    {`You're not part of an organization yet.`}
                </p>
                <Link
                    href="/onboarding/organization"
                    className={cn(buttonVariants({variant: "default"}), "gap-x-2 mt-8")}
                >
                    <FaPlus/>
                    Join an organization
                </Link>
            </div>
        );
    }
}
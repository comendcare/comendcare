import {cookies} from "next/headers"
import {
    FaCalendar, FaCircleDollarToSlot, FaEllipsis, FaPen,
    FaPencil, FaPeopleGroup, FaPhone, FaPlus,
} from "react-icons/fa6";
import {Button, buttonVariants} from "@/components/ui/button";
import {LineChartCard} from "@/components/line-chart-card";
import {DonutChartCard} from "@/components/donut-chart-card";
import {UserFeedTextCard} from "@/components/user-feed-text-card";
import {UserNewPostCard} from "@/components/user-new-post-card";
import {PAGProfileDetailsCard} from "@/components/pag-profile-details-card";
import {cn, createDicebearAvatar} from "@/lib/utils";
import PrivateProfileDropdown from "@/components/private-profile-dropdown";
import EditPAGProfileHeaderDialog from "@/components/edit-pag-profile-header-dialog";
import {PAGProfileResearchPlanCard} from "@/components/pag-profile-research-plan-card";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {getOrganizationFromOrganizationId} from "@/lib/actions";
import {getSession} from "@/lib/auth";
import Image from "next/image"
import Link from "next/link";
import {AssetsCard} from "@/components/assets-card";
import {PAGProfileActivityCard} from "@/components/pag-profile-activity-card";
import {OpenRFPsCard} from "@/components/open-rfps-card";
import EditPAGProfileDialog from "@/components/edit-pag-profile-page";


export default async function ProfilePage() {
    const session = await getSession()
    const layout = cookies().get("react-resizable-panels:layout:platform")
    const collapsed = cookies().get("react-resizable-panels:collapsed")

    const defaultLayout = layout ? JSON.parse(layout.value) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

    let organization = null
    if (session?.user.organizationId) {
        organization = await getOrganizationFromOrganizationId(session?.user.organizationId)
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
                                <div className="flex">
                                    <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                         src={createDicebearAvatar(organization?.createdAt.toLocaleString() ?? "", 50, 40, "identicon")}
                                         alt=""/>
                                </div>
                                <div
                                    className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                                    <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                        <h1 className="mt-6 min-w-0 flex-1 truncate text-4xl font-bold text-gray-900">
                                            {organization?.name}
                                        </h1>
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
                                                    ${organization?.moneyRaised?.toLocaleString()} raised
                                                </div>
                                            }
                                            <div className="mt-2 flex items-center text-gray-500">
                                                <FaCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                            aria-hidden="true"/>
                                                Founded in {new Date(organization?.createdAt ?? "").getFullYear()}
                                            </div>
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
                        <div className="col-span-2 space-y-4">
                            <PAGProfileDetailsCard organization={organization}/>
                            <AssetsCard/>
                            <OpenRFPsCard/>
                        </div>
                        <div className="col-span-4 flex flex-col space-y-4">
                            <PAGProfileResearchPlanCard/>
                            <PAGProfileActivityCard/>
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
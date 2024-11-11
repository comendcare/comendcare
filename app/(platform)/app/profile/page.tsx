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
import ProfileDropdown from "@/components/profile-dropdown";
import EditProfileHeaderDialog from "@/components/edit-profile-header-dialog";
import {PAGProfileRoadmapCard} from "@/components/pag-profile-roadmap-card";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {getOrganizationFromOrganizationId} from "@/lib/actions";
import {getSession} from "@/lib/auth";
import Image from "next/image"
import Link from "next/link";

const profile = {
    name: 'Ricardo Cooper',
    email: 'ricardo.cooper@example.com',
    avatar:
        'https://github.com/shadcn.png',
    backgroundImage:
        'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    fields: [
        ['Phone', '(555) 123-4567'],
        ['Email', 'ricardocooper@example.com'],
        ['Title', 'Senior Front-End Developer'],
        ['Team', 'Product Development'],
        ['Location', 'San Francisco'],
        ['Sits', 'Oasis, 4th floor'],
        ['Salary', '$145,000'],
        ['Birthday', 'June 8, 1990'],
    ],
}

const pag = {
    "groupName": "Myhre Syndrome Foundation",
    "description": "The Myhre Syndrome Foundation is dedicated to improving the lives of individuals affected by Myhre Syndrome, a rare genetic disorder characterized by distinctive facial features, skeletal anomalies, and developmental delays. The foundation provides support to families, promotes awareness, and funds critical research to uncover potential treatments.",
    "numberOfPatients": 150,
    "amountRaised": 350000,
    "dateJoined": "2023-01-15",
    "dateFounded": "2015-03-12",
    "topics": ["monogenic", "basic science", "gene replacement"],
    "teamMembers": [
        {
            "name": "Dr. Sarah Johnson",
            "title": "Chief Medical Officer",
            "description": "Dr. Sarah Johnson has been a medical research wizard for over 20 years and has brought her magic to the Rare Disease Foundation for the past 8 years. She’s the heartbeat of our medical team, leading us with passion and a focus on innovation and patient care.",
            "dateJoined": "2015-04-10"
        },
        {
            "name": "Michael Brown",
            "title": "Executive Director",
            "description": "Michael Brown has been steering the ship at the Rare Disease Foundation for 5 years, after 15 years of leading non-profits to success. He’s our strategic mastermind, ensuring everything runs smoothly and we stay on course.",
            "dateJoined": "2018-06-15"
        }
    ]
}


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
        return (
            <main className="flex flex-col items-center w-full max-w-7xl mx-auto">
                <div className="flex flex-col space-y-8 my-8">
                    <div>
                        <div>
                            <img className="h-32 w-full object-cover lg:h-48" src={profile.backgroundImage} alt=""/>
                        </div>

                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">

                                <div className="flex">
                                    <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                         src={createDicebearAvatar(organization?.createdAt.toLocaleString() ?? "", 50, 40, "identicon")}
                                         alt=""/>
                                </div>

                                <div
                                    className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"
                                >
                                    <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                        <h1 className="mt-6 min-w-0 flex-1 truncate text-2xl font-bold text-gray-900">
                                            {organization?.name}
                                        </h1>
                                        <div
                                            className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                                            {organization?.numberOfIdentifiedPatients &&
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <FaPeopleGroup
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>
                                                    {organization?.numberOfIdentifiedPatients}+ patients
                                                </div>
                                            }
                                            {organization?.moneyRaised &&
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <FaCircleDollarToSlot
                                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                    ${organization?.moneyRaised?.toLocaleString()} raised
                                                </div>
                                            }
                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                <FaCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                            aria-hidden="true"/>
                                                Founded on {new Date(organization?.createdAt ?? "").toDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                                    <div className="flex flex-row space-x-2">
                                        <EditProfileHeaderDialog/>
                                        <Button
                                            className="gap-x-2"
                                        >
                                            <FaPlus/>
                                            Add post
                                        </Button>
                                        <ProfileDropdown subdomain={organization.subdomain}/>
                                    </div>
                                </div>

                            </div>
                            <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
                                <h1 className="truncate text-2xl font-bold text-gray-900">{profile.name}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4">
                        <div className="col-span-2 space-y-4">
                            <PAGProfileDetailsCard organization={organization}/>
                            <LineChartCard/>
                            <DonutChartCard/>
                        </div>

                        <div className="col-span-4 flex flex-col space-y-4">
                            <PAGProfileRoadmapCard/>
                            <Card>
                                <CardHeader>
                                    <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                                        Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <UserNewPostCard/>
                                    <UserFeedTextCard
                                        content={"Some patients with LGMD2I or MDC1C have trouble with their breathing. To support their breathing, they get a ventilation device that they either use full-time, i.e. 24 hours a day, or only for several hours a day or at night. “Non-invasive” means that they use this device without having had an operation. Usually this means they wear a mask that can be removed at any time."}
                                    />
                                    <UserFeedTextCard
                                        content={"I'm wondering if this applies to me? I can move unassisted but not without a lot of stiffness."}
                                        blockquote={"Motor function describes a person’s ability to move his or her body. Sitting independently means that you can stay in the sitting position for several minutes, without being supported by either another position or stabilizing device (chair back, corset or brace)." +
                                            "- I am able to run " +
                                            "- I am currently able to climb stairs without assistance"}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </main>
        )
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
        )
    }
}

import {
    FaCalendar, FaCircleDollarToSlot,
    FaPeopleGroup, FaPlus,
} from "react-icons/fa6";
import {buttonVariants} from "@/components/ui/button";
import {cn, createDicebearAvatar, formatMoney} from "@/lib/utils";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {getOrganizationFromOrganizationId} from "@/lib/actions";
import {getSession} from "@/lib/auth";
import Image from "next/image"
import Link from "next/link";
import {Skeleton} from "@/components/ui/skeleton";
import {Badge} from "@/components/ui/badge";


export default async function PAGProfilePagePreview() {
    const session = await getSession()

    let organization = null
    if (session?.user.organizationId) {
        organization = await getOrganizationFromOrganizationId(session?.user.organizationId)
    }

    if (organization) {
        return (
            <main className="flex flex-col items-center w-full max-w-7xl mx-auto px-4">
                <div className="flex flex-col space-y-8 my-8">
                    <div>
                        <div>
                            <img className="h-24 w-full object-cover lg:h-36"
                                 src={'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}
                                 alt=""/>
                        </div>

                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">

                                <div className="flex">
                                    <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-18 sm:w-18"
                                         src={createDicebearAvatar(organization?.createdAt.toLocaleString() ?? "", 50, 40, "identicon")}
                                         alt=""/>
                                </div>

                                <div
                                    className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"
                                >
                                    <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                        <h1 className="mt-6 min-w-0 flex-1 truncate text-xl font-bold text-gray-900">
                                            {organization?.name}
                                        </h1>
                                        <div
                                            className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-xs">
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
                                                    {formatMoney(organization?.moneyRaised)} raised
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
                            <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
                                <h1 className="truncate text-2xl font-bold text-gray-900">{organization?.name}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4">
                        <div className="col-span-2 space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>
                                        About
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex-shrink-0 space-y-4">
                                            <div className="flex-grow space-y-4">
                                                <div className="space-y-2">
                                                    <h3 className={cn("scroll-m-20 text-md tracking-tight font-semibold")}>
                                                        Description
                                                    </h3>
                                                    <p className="text-sm">
                                                        {organization?.description}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex flex-row items-center justify-between w-full">
                                                        <h3 className={cn("scroll-m-20 text-md tracking-tight font-semibold")}>
                                                            Relevant topics
                                                        </h3>
                                                    </div>
                                                    {/*<div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-1">*/}
                                                    {/*    {pag?.topics.map((item, index) =>*/}
                                                    {/*        <Badge key={index} className="flex text-sm">*/}
                                                    {/*            {item.charAt(0).toUpperCase() + item.slice(1)}*/}
                                                    {/*        </Badge>*/}
                                                    {/*    )}*/}
                                                    {/*</div>*/}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>
                            {/*<AssetsCard/>*/}
                            {/*<OpenRFPsCard/>*/}
                        </div>

                        <div className="col-span-4 flex flex-col space-y-4">
                            {/*<PAGProfileRoadmapCard/>*/}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>
                                        Activity
                                    </CardTitle>
                                    <Skeleton className="w-full"/>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-4 w-full"/>
                                    <Skeleton className="h-4 w-[200px]"/>
                                    <Skeleton className="h-4 w-[200px]"/>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </main>
        )
    } else {
        return (
            <div className="h-full flex flex-col items-center justify-center">
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

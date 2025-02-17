import prisma from "@/lib/prisma"
import {notFound} from "next/navigation"
import {getRoadmapsForOrganization, getOrganizationData, getConditionsDataFromOrgId, getCROData} from "@/lib/fetchers"
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import Link from "next/link";
import {
    FaArrowLeftLong,
    FaBuilding,
    FaCalendar,
    FaCircleDollarToSlot, FaCity,
    FaIndustry,
    FaRocket,
    FaUserTie,
    FaArrowUpRightFromSquare,
} from "react-icons/fa6";
import {companyTypeMap} from "@/components/marketplace-cro-card";
import {FaUniversity} from "react-icons/fa";
import React from "react";
import {buttonVariants} from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

const companyTypeIcons: Record<string, JSX.Element> = {
    "Mid-Sized Business (10-100M TTM Revenue)": <FaIndustry className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Small Business (1-10M TTM Revenue)": <FaBuilding className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Academic Core Facility": <FaUniversity className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "New Startup (0-1M TTM Revenue)": <FaRocket className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Consultant (5 or more employees)": <FaUserTie className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Large Business (>100M TTM Revenue)": <FaCity className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Consultant (<5 employees)": <FaUserTie className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
};

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
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)
    const cro = await getCROData(id)

    if (!cro) {
        notFound()
    }

    return (
        <div
            className="flex flex-col w-full max-w-7xl mx-auto p-4 gap-4"
        >
            <Link
                href={
                    process.env.NEXT_PUBLIC_VERCEL_ENV
                        ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/patient-groups`
                        : `http://localhost:3000/app/marketplace/patient-groups`
                }
                className="inline-flex items-center gap-x-2 hover:underline"
            >
                <FaArrowLeftLong/>
                Back to marketplace
            </Link>
            <main className="flex flex-col w-full max-w-7xl mx-auto space-y-8">
                <div className="flex flex-row">
                    <div className="flex flex-col space-y-4">
                        <div className="min-w-0 flex-1 truncate text-4xl font-bold text-gray-900">
                            <h1 className="whitespace-nowrap leading-normal">
                                {cro.title}
                            </h1>
                        </div>
                        <div
                            className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                            {cro.headquarters &&
                                <div className="mt-2 flex items-center text-gray-500">
                                    <FaCircleDollarToSlot
                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                        aria-hidden="true"
                                    />
                                    Headquartered in {cro.headquarters}
                                </div>
                            }
                            {cro.yearEstablished && (
                                <div className="mt-2 flex items-center text-gray-500">
                                    <FaCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                aria-hidden="true"/>
                                    Founded in {cro.yearEstablished}
                                </div>
                            )}
                            {cro.companyType && (
                                <div className="mt-2 flex items-center text-gray-500">
                                    {companyTypeIcons[cro.companyType] ||
                                        <FaBuilding className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"/>}
                                    {companyTypeMap[cro.companyType] || cro.companyType}
                                </div>
                            )}
                        </div>
                        {cro.description && cro.description.trim() && (
                            <div className="w-1/2">
                                {cro.description}
                            </div>
                        )}
                    </div>
                    <Link
                        href={cro.website || ""}
                        className={buttonVariants({variant: "default"})}
                        target="_blank"
                    >
                        <FaArrowUpRightFromSquare />
                        Visit website
                    </Link>
                </div>
                <Tabs defaultValue="services" className="space-y-4 w-full">
                    <TabsList variant="outline">
                        <TabsTrigger value="services" variant="outline" className="px-8">
                            Services
                        </TabsTrigger>
                        <TabsTrigger value="sites" variant="outline" className="px-8">
                            Sites
                        </TabsTrigger>
                        <TabsTrigger value="rfis" variant="outline" className="px-8">
                            RFIs
                        </TabsTrigger>
                        <TabsTrigger value="reviews" variant="outline" className="px-8">
                            Reviews
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="services" className="space-y-4 w-full">

                    </TabsContent>
                </Tabs>
            </main>

        </div>
    )
}

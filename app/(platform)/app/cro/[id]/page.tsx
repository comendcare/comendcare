import prisma from "@/lib/prisma"
import {notFound} from "next/navigation"
import {getCROData} from "@/lib/fetchers"
import Link from "next/link";
import {
    FaArrowLeftLong,
    FaBuilding,
    FaCalendar,
    FaCircleDollarToSlot, FaCity,
    FaIndustry,
    FaRocket,
    FaUserTie,
    FaArrowUpRightFromSquare, FaBriefcase, FaPencil, FaFileContract, FaMap, FaUsers, FaListCheck, FaLocationPin,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import CROMarketplaceProfileServicesTab from "@/components/cro-marketplace-profile-services-tab";
import CROMarketplaceProfileSitesTab from "@/components/cro-marketplace-profile-sites-tab";
import CROMarketplaceProfileRFIsTab from "@/components/cro-marketplace-profile-rfis-tab";
import CROMarketplaceProfileCertificationsTab from "@/components/cro-marketplace-profile-certifications-tab";

const companyTypeIcons: Record<string, JSX.Element> = {
    "Mid-Sized Business (10-100M TTM Revenue)": <FaIndustry className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Small Business (1-10M TTM Revenue)": <FaBuilding className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Academic Core Facility": <FaUniversity className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "New Startup (0-1M TTM Revenue)": <FaRocket className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Consultant (5 or more employees)": <FaUserTie className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Large Business (>100M TTM Revenue)": <FaCity className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Consultant (<5 employees)": <FaUserTie className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
};

export default async function CompanyHomePage({
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
        <TooltipProvider>
            <div
                className="flex flex-col w-full max-w-7xl mx-auto p-4 gap-4"
            >
                <Link
                    href={
                        process.env.NEXT_PUBLIC_VERCEL_ENV
                            ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/cro`
                            : `http://localhost:3000/app/marketplace/cro`
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
                                        <FaLocationPin
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
                            <FaArrowUpRightFromSquare/>
                            Visit website
                        </Link>
                    </div>
                    <Tabs defaultValue="services" className="space-y-4 w-full">
                        <TabsList variant="outline">
                            <TabsTrigger value="services" variant="outline" className="px-8">
                                <FaBriefcase className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                                Services
                                {cro.services.length && (
                                    <div
                                        className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'
                                    >
                                        {cro.services.length}
                                    </div>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="sites" variant="outline" className="px-8">
                                <FaMap className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                                Sites
                                {cro.sites.length && (
                                    <div
                                        className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'
                                    >
                                        {cro.sites.length}
                                    </div>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="rfis" variant="outline" className="px-8">
                                <FaFileContract className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                                RFIs
                                {cro.rfis.length && (
                                    <div
                                        className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'
                                    >
                                        {cro.rfis.length}
                                    </div>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="certifications" variant="outline" className="px-8">
                                <FaListCheck className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                                Certifications
                                {cro.certifications.length && (
                                    <div
                                        className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'
                                    >
                                        {cro.certifications.length}
                                    </div>
                                )}
                            </TabsTrigger>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger>
                                    <TabsTrigger value="reviews" variant="outline" className="px-8" disabled>
                                        <FaUsers className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                                        Reviews
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Coming soon!
                                </TooltipContent>
                            </Tooltip>
                        </TabsList>
                        <TabsContent value="services" className="space-y-4 w-full">
                            <CROMarketplaceProfileServicesTab croServices={cro.services}/>
                        </TabsContent>
                        <TabsContent value="sites" className="space-y-4 w-full">
                            <CROMarketplaceProfileSitesTab croSites={cro.sites}/>
                        </TabsContent>
                        <TabsContent value="rfis" className="space-y-4 w-full">
                            <CROMarketplaceProfileRFIsTab croRFIs={cro.rfis}/>
                        </TabsContent>
                        <TabsContent value="certifications" className="space-y-4 w-full">
                            <CROMarketplaceProfileCertificationsTab croCertifications={cro.certifications}/>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </TooltipProvider>
    )
}

"use client"

import {useEffect, useState} from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@comend/components/ui/tabs"
import { Briefcase, Users } from "lucide-react";
import CROMarketplaceProfileServicesTab from "@comend/components/cro-marketplace-profile-services-tab";
import CROMarketplaceProfileReviewsTab from "~web/components/marketplace/cro-marketplace-profile-reviews-tab";
import {CompanyWithReviewsAndServices} from "@comend/lib/types";
import { Skeleton } from "@comend/components/ui/skeleton";

export default function CROPageTabs({company}: {company: CompanyWithReviewsAndServices}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [selectedTab, setSelectedTab] = useState("services")

    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "services"
        setSelectedTab(tabFromUrl)
    }, [searchParams])

    return (
        <Tabs
            value={selectedTab}
            onValueChange={(value) => {
                setSelectedTab(value)
                const params = new URLSearchParams(searchParams.toString())
                params.set("tab", value)
                router.replace(`${pathname}?${params.toString()}`)
            }}
            className="space-y-4 w-full py-4"
        >
            <TabsList variant="outline">
                <TabsTrigger value="services" variant="outline" className="px-8">
                    <Briefcase className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                    Services
                    {company.services?.length !== undefined && (
                        <div
                            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'
                        >
                            {company.services.length}
                        </div>
                    )}
                </TabsTrigger>
                {/*<TabsTrigger value="sites" variant="outline" className="px-8">*/}
                {/*    <Map className="mr-1.5 h-4 w-4 flex-shrink-0"/>*/}
                {/*    Sites*/}
                {/*    {company.sites.length && (*/}
                {/*        <div*/}
                {/*            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'*/}
                {/*        >*/}
                {/*            {company.sites.length}*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</TabsTrigger>*/}
                {/*<TabsTrigger value="rfis" variant="outline" className="px-8">*/}
                {/*    <FaFileContract className="mr-1.5 h-4 w-4 flex-shrink-0"/>*/}
                {/*    RFIs*/}
                {/*    {company.rfis.length && (*/}
                {/*        <div*/}
                {/*            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'*/}
                {/*        >*/}
                {/*            {company.rfis.length}*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</TabsTrigger>*/}
                {/*<TabsTrigger value="certifications" variant="outline" className="px-8">*/}
                {/*    <FaListCheck className="mr-1.5 h-4 w-4 flex-shrink-0"/>*/}
                {/*    Certifications*/}
                {/*    {company.certifications.length && (*/}
                {/*        <div*/}
                {/*            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'*/}
                {/*        >*/}
                {/*            {company.certifications.length}*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</TabsTrigger>*/}
                <TabsTrigger value="reviews" variant="outline" className="px-8">
                    <Users className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                    Reviews
                    {company?.reviews?.length !== undefined && (
                        <div
                            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'
                        >
                            {company.reviews.length}
                        </div>
                    )}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="services" className="space-y-4 w-full">
                {(!company) ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-[32px] w-[250px]" />
                            <Skeleton className="h-[32px] w-[82px]" />
                        </div>
                        <Skeleton className="w-full h-[200px]" />
                    </div>
                ): (
                    <CROMarketplaceProfileServicesTab croServices={company.services}/>
                )}
            </TabsContent>
            {/*<TabsContent value="sites" className="space-y-4 w-full">*/}
            {/*    <CROMarketplaceProfileSitesTab croSites={company.sites}/>*/}
            {/*</TabsContent>*/}
            {/*<TabsContent value="rfis" className="space-y-4 w-full">*/}
            {/*    <CROMarketplaceProfileRFIsTab croRFIs={company.rfis}/>*/}
            {/*</TabsContent>*/}
            {/*<TabsContent value="certifications" className="space-y-4 w-full">*/}
            {/*    <CROMarketplaceProfileCertificationsTab croCertifications={company.certifications}/>*/}
            {/*</TabsContent>*/}
            <TabsContent value="reviews" className="space-y-4 w-full">
                <CROMarketplaceProfileReviewsTab cro={company as CompanyWithReviewsAndServices}/>
            </TabsContent>
        </Tabs>
    )
}

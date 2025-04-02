"use client"

import {useEffect, useState } from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Briefcase, Users } from "lucide-react";
import CROMarketplaceProfileServicesTab from "@/components/cro-marketplace-profile-services-tab";
import {Company} from "@prisma/client";
import CROMarketplaceProfileReviewsTab from "@/components/cro-marketplace-profile-reviews-tab";
import {CompanyWithReviewsAndServices} from "@/lib/types";

export default function CROPageTabs({cro}: {cro: CompanyWithReviewsAndServices}) {
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
            className="space-y-4 w-full"
        >
            <TabsList variant="outline">
                <TabsTrigger value="services" variant="outline" className="px-8">
                    <Briefcase className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                    Services
                    {cro.services.length !== undefined && (
                        <div
                            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'
                        >
                            {cro.services.length}
                        </div>
                    )}
                </TabsTrigger>
                {/*<TabsTrigger value="sites" variant="outline" className="px-8">*/}
                {/*    <Map className="mr-1.5 h-4 w-4 flex-shrink-0"/>*/}
                {/*    Sites*/}
                {/*    {cro.sites.length && (*/}
                {/*        <div*/}
                {/*            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'*/}
                {/*        >*/}
                {/*            {cro.sites.length}*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</TabsTrigger>*/}
                {/*<TabsTrigger value="rfis" variant="outline" className="px-8">*/}
                {/*    <FaFileContract className="mr-1.5 h-4 w-4 flex-shrink-0"/>*/}
                {/*    RFIs*/}
                {/*    {cro.rfis.length && (*/}
                {/*        <div*/}
                {/*            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'*/}
                {/*        >*/}
                {/*            {cro.rfis.length}*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</TabsTrigger>*/}
                {/*<TabsTrigger value="certifications" variant="outline" className="px-8">*/}
                {/*    <FaListCheck className="mr-1.5 h-4 w-4 flex-shrink-0"/>*/}
                {/*    Certifications*/}
                {/*    {cro.certifications.length && (*/}
                {/*        <div*/}
                {/*            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'*/}
                {/*        >*/}
                {/*            {cro.certifications.length}*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</TabsTrigger>*/}
                <TabsTrigger value="reviews" variant="outline" className="px-8">
                    <Users className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                    Reviews
                    {cro.reviews.length !== undefined && (
                        <div
                            className='bg-gray-100 text-gray-900 ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'
                        >
                            {cro.reviews.length}
                        </div>
                    )}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="services" className="space-y-4 w-full">
                <CROMarketplaceProfileServicesTab croServices={cro.services}/>
            </TabsContent>
            {/*<TabsContent value="sites" className="space-y-4 w-full">*/}
            {/*    <CROMarketplaceProfileSitesTab croSites={cro.sites}/>*/}
            {/*</TabsContent>*/}
            {/*<TabsContent value="rfis" className="space-y-4 w-full">*/}
            {/*    <CROMarketplaceProfileRFIsTab croRFIs={cro.rfis}/>*/}
            {/*</TabsContent>*/}
            {/*<TabsContent value="certifications" className="space-y-4 w-full">*/}
            {/*    <CROMarketplaceProfileCertificationsTab croCertifications={cro.certifications}/>*/}
            {/*</TabsContent>*/}
            <TabsContent value="reviews" className="space-y-4 w-full">
                <CROMarketplaceProfileReviewsTab cro={cro as CompanyWithReviewsAndServices}/>
            </TabsContent>
        </Tabs>
    )
}

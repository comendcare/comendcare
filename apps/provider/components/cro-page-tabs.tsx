"use client"

import {useEffect, useState } from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@comend/components/ui/tabs"
import { Briefcase, Users } from "lucide-react";
import CROMarketplaceProfileServicesTab from "@comend/components/cro-marketplace-profile-services-tab";
import {Company} from "@prisma/client";
import {CompanyWithReviewsAndServices} from "@comend/lib/types";
import {getCROData} from "@comend/lib/fetchers";
import { Skeleton } from "@comend/components/ui/skeleton";

export default function CROPageTabs() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [selectedTab, setSelectedTab] = useState("services")
    const [cro, setCRO] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "services"
        setSelectedTab(tabFromUrl)
    }, [searchParams])

    useEffect(() => {
        const fetchCRO = async () => {
            setLoading(true)
            const pathParts = pathname.split("/")
            const id = decodeURIComponent(pathParts[pathParts.length - 1])
            const data = await getCROData(id, {
                services: true,
                reviews: true,
            })
            setCRO(data)
            setLoading(false)
        }

        fetchCRO()
    }, [pathname])

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
                    {cro?.services?.length !== undefined && (
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
            </TabsList>
            <TabsContent value="services" className="space-y-4 w-full">
                {(loading || !cro) ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-[32px] w-[250px]" />
                            <Skeleton className="h-[32px] w-[82px]" />
                        </div>
                        <Skeleton className="w-full h-[200px]" />
                    </div>
                ): (
                    <CROMarketplaceProfileServicesTab croServices={cro.services}/>
                )}
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
        </Tabs>
    )
}

"use client"

import {useEffect, useState} from "react";
import {
    Pencil,
    Briefcase,
    MapPin,
    DollarSign,
    CalendarIcon, Users
} from "lucide-react";
import {GroupAvatar} from "@/components/ui/group-avatar";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {getCROData} from "@/lib/fetchers";
import PharmaProjectBiosamplesTab from "@/components/pharma-project-biosamples-tab";

export default function Example() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [selectedTab, setSelectedTab] = useState("analytics")
    const [cro, setCRO] = useState<any | null>(null)

    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "analytics"
        setSelectedTab(tabFromUrl)
    }, [searchParams])

    return (
        <div className="h-full flex-1 space-y-8 px-8">
            <div className="flex items-start">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        ASO Therapy Development – Arcadion Syndrome
                    </h2>
                    <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Briefcase aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400"/>
                            Preclinical Stage
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <MapPin aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400"/>
                            Global (Lead Site: Toronto, Canada)
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <DollarSign aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400"/>
                            Budget: $2M
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <CalendarIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400"/>
                            Proposal Deadline: June 30, 2025
                        </div>
                    </div>
                </div>
                <div className="flex flex-row space-x-4">
                    <GroupAvatar users={[
                        {id: 1, name: 'Dr. Alice Nguyen'},
                        {id: 2, name: 'Samir Patel'}
                    ]}/>

                    <div className="hidden sm:block">
                        <Button variant="secondary">
                            <Pencil aria-hidden="true" className="-ml-0.5 mr-1.5 size-5 text-gray-400"/>
                            Edit
                        </Button>
                    </div>
                </div>

            </div>
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
                    <TabsTrigger value="analytics" variant="outline" className="px-8">
                        <Briefcase className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="biosamples" variant="outline" className="px-8">
                        <Users className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        Biosamples
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="analytics" className="space-y-4 w-full">
                    {/*<CROMarketplaceProfileServicesTab croServices={cro.services}/>*/}
                </TabsContent>
                <TabsContent value="biosamples" className="space-y-4 w-full">
                    <PharmaProjectBiosamplesTab/>
                </TabsContent>
            </Tabs>
        </div>
    )
}

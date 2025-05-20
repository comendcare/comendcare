"use client"

import {useEffect, useState} from "react";
import {
    Pencil,
    Briefcase,
    MapPin,
    DollarSign,
    CalendarIcon,
    BarChart3,
    Database,
    Stethoscope,
    FlaskConical,
    FileSignature,
    ActivitySquare,
    Workflow,
    Share2
} from "lucide-react";
import {GroupAvatar} from "@/components/ui/group-avatar";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {getPharmaProjectData} from "@/lib/fetchers";
import PharmaProjectBiorepositoryTab from "@/components/pharma-project-biorepository-tab";
import Loading from "@/app/loading";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import PharmaProjectAnalyticsTab from "@/components/pharma-project-analytics-tab";
import PharmaProjectClinicalTab from "@/components/pharma-project-clinical-tab";
import PharmaProjectPreclinicalTab from "@/components/pharma-project-preclinical-tab";
import PharmaProjectIPTab from "@/components/pharma-project-ip-tab";


export default function PharmaProjectPage() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [selectedTab, setSelectedTab] = useState("analytics")
    const [pharmaProject, setPharmaProject] = useState<any | null>(null)

    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "analytics"
        setSelectedTab(tabFromUrl)
    }, [searchParams])

    useEffect(() => {
        const fetchCRO = async () => {
            const pathParts = pathname.split("/")
            const id = decodeURIComponent(pathParts[pathParts.length - 1])
            const data = await getPharmaProjectData(id)
            setPharmaProject(data)
        }

        fetchCRO()
    }, [pathname])

    if (!pharmaProject) return <Loading />

    return (
        <div className="h-full flex-1 space-y-8 px-8">
            <div className="flex items-start">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        {pharmaProject.name}
                    </h2>
                    {/*<div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">*/}
                    {/*    <div className="mt-2 flex items-center text-sm text-gray-500">*/}
                    {/*        <Briefcase aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400"/>*/}
                    {/*        Preclinical Stage*/}
                    {/*    </div>*/}
                    {/*    <div className="mt-2 flex items-center text-sm text-gray-500">*/}
                    {/*        <MapPin aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400"/>*/}
                    {/*        Global (Lead Site: Toronto, Canada)*/}
                    {/*    </div>*/}
                    {/*    <div className="mt-2 flex items-center text-sm text-gray-500">*/}
                    {/*        <DollarSign aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400"/>*/}
                    {/*        Budget: $2M*/}
                    {/*    </div>*/}
                    {/*    <div className="mt-2 flex items-center text-sm text-gray-500">*/}
                    {/*        <CalendarIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400"/>*/}
                    {/*        Proposal Deadline: June 30, 2025*/}
                    {/*    </div>*/}
                    {/*</div>*/}
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
                    <TabsTrigger value="analytics" variant="outline" className="px-4">
                        <BarChart3 className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="biorepository" variant="outline" className="px-4">
                        <Database className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        Biorepository
                    </TabsTrigger>
                    <TabsTrigger value="clinical" variant="outline" className="px-4">
                        <Stethoscope className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        Clinical
                    </TabsTrigger>
                    <TabsTrigger value="pre-clinical" variant="outline" className="px-4">
                        <FlaskConical className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        Pre-clinical
                    </TabsTrigger>
                    <TabsTrigger value="ip" variant="outline" className="px-4">
                        <FileSignature className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        IP repository
                    </TabsTrigger>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <TabsTrigger value="epidemiology" variant="outline" className="px-4" disabled>
                                        <ActivitySquare className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                                        Epidemiology
                                    </TabsTrigger>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Coming soon</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <TabsTrigger value="pipelines" variant="outline" className="px-4" disabled>
                                        <Workflow className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                                        Pipelines
                                    </TabsTrigger>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Coming soon</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <TabsTrigger value="networks" variant="outline" className="px-4" disabled>
                                        <Share2 className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                                        Networks
                                    </TabsTrigger>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Coming soon</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </TabsList>
                <TabsContent value="analytics" className="space-y-4 w-full">
                    <PharmaProjectAnalyticsTab/>
                </TabsContent>
                <TabsContent value="biorepository" className="space-y-4 w-full">
                    <PharmaProjectBiorepositoryTab/>
                </TabsContent>
                <TabsContent value="clinical" className="space-y-4 w-full">
                    <PharmaProjectClinicalTab/>
                </TabsContent>
                <TabsContent value="pre-clinical" className="space-y-4 w-full">
                    <PharmaProjectPreclinicalTab/>
                </TabsContent>
                <TabsContent value="ip" className="space-y-4 w-full">
                    <PharmaProjectIPTab/>
                </TabsContent>
            </Tabs>
        </div>
    );
}

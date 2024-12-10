"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useRouter, useSearchParams} from "next/navigation";
import {cn} from "@/lib/utils";
import "@xyflow/react/dist/base.css"
import { PublicFlowView } from "./public-flow";
import { PublicTimelineView } from "./public-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const PublicRoadmap = ({roadmap, subdomain}: {roadmap: any, subdomain: string | undefined}) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlView = searchParams.get("view")

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    {roadmap.title}
                </CardTitle>
                <CardDescription>
                    {roadmap.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="px-8">

            <Tabs defaultValue={urlView === 'flow' ? 'flow' : 'timeline'} className="space-y-4 w-full">
                <TabsList>
                    <TabsTrigger value="timeline">
                        Timeline View
                    </TabsTrigger>
                    <TabsTrigger value="flow">
                        Flow View
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="timeline" className="space-y-4 w-full">
                    <PublicTimelineView roadmap={roadmap} />
                </TabsContent>
                <TabsContent value="flow" className="space-y-4 w-full">
                    <div className="h-[600px]">
                        <PublicFlowView roadmap={roadmap} subdomain={subdomain} />
                    </div>
                </TabsContent>
            </Tabs>
            </CardContent>
        </Card>
    );
};

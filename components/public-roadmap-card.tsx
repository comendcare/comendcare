"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {cn} from "@/lib/utils";
import "@xyflow/react/dist/base.css"
import {PublicFlowView} from "./public-flow";
import {PublicTimelineView} from "./public-timeline";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./ui/tabs";
import Image from "next/image"
import {Button} from "@/components/ui/button";
import {FaArrowUpRightFromSquare} from "react-icons/fa6";

export const PublicRoadmapCard = ({roadmap, subdomain}: { roadmap: any, subdomain: string | undefined }) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const urlView = searchParams.get("view")
    const urlMilestone = searchParams.get("milestone")

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())

        params.delete("view")
        params.set("view", value)

        router.push(`${pathname}?${params.toString()}`, {scroll: false})
    }

    if (!roadmap) {
        return <Card>
            <CardContent>
                <div className="flex flex-col items-center justify-center space-x-4 my-8">
                    <h1 className="font-cal text-4xl">No research plan yet</h1>
                    <Image
                        alt="missing roadmap"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        width={400}
                        height={400}
                    />
                    <p className="text-lg text-stone-500">
                        You do not have any research plans yet. Create one to get started.
                    </p>
                </div>
            </CardContent>
        </Card>
    }

    return (

        <Tabs
            defaultValue={urlView === 'flow' ? 'flow' : 'timeline'}
            className="w-full"
            onValueChange={handleTabChange}
        >
            <Card>
                <CardHeader className="w-full pt-6 pb-2 space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-0">
                        <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                            Research Plan
                        </CardTitle>
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/app/research-plan")}
                            className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                        >
                            Edit research plan
                            <FaArrowUpRightFromSquare/>
                        </Button>
                    </div>
                    <TabsList className="w-min">
                        <TabsTrigger value="timeline">
                            Timeline View
                        </TabsTrigger>
                        <TabsTrigger value="flow">
                            Flow View
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>

                <CardContent className="px-8">
                    <TabsContent value="timeline" className="space-y-4 w-full">
                        <PublicTimelineView roadmap={roadmap} subdomain={subdomain}
                                            urlMilestone={urlMilestone || undefined}/>
                    </TabsContent>
                    <TabsContent value="flow" className="space-y-4 w-full">
                        <div className="h-[800px]">
                            <PublicFlowView roadmap={roadmap} subdomain={subdomain}
                                            urlMilestone={urlMilestone || undefined}/>
                        </div>
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
};

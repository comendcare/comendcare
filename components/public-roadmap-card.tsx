"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {usePathname, useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import "@xyflow/react/dist/base.css"
import {PublicFlowView} from "./public-flow";
import {PublicTimelineView} from "./public-timeline";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./ui/tabs";
import Image from "next/image"
import {Button} from "@/components/ui/button";
import Link from "next/link";
import { buttonVariants } from "./plate-ui/button";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { columns } from "@/components/research-plans-data-table/research-plans-data-columns"
import { ResearchPlansDataTable } from "./research-plans-data-table/research-plans-data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { RESEARCH_PLAN_TYPES } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

export const RoadmapCard = ({
    roadmaps, 
    urlMilestone, 
    setUrlMilestone, 
    urlView,
    setUrlView,
    subdomain, 
    isPublic,
    externalLinks
}: { 
    roadmaps: any[], 
    urlMilestone?: string | undefined,
    setUrlMilestone?: (id: string | undefined) => void,
    urlView?: string | undefined,
    setUrlView?: (view: string | undefined) => void,
    subdomain: string | undefined, 
    isPublic: boolean ,
    externalLinks: boolean
}) => {
    const router = useRouter()
    const pathname = usePathname()

    if (!roadmaps || roadmaps.length <= 0) {
        return <NoResearchPlanCard isPublic={isPublic} />
    }

    // if (roadmaps?.milestones && roadmap.milestones.length <= 0) {
    //     return <UnderDevelopmentCard isPublic={isPublic} />
    // }

    return (
        <Tabs
            defaultValue={urlView === 'flow' ? 'flow' : 'timeline'}
            className="w-full"
            onValueChange={setUrlView ? setUrlView: () => {}}
        >
            <Card className="organization-profile-tour-step4">
                <CardHeader className="w-full pt-6 pb-2 space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-0">
                        <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">
                            Research Plan
                        </CardTitle>
                        {pathname === "/app/profile" &&
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/app/research-plan")}
                                className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                            >
                                Edit research plan
                                <Pencil />
                            </Button>
                        }
                    </div>
                    {/* <TabsList className="w-min">
                        <TabsTrigger value="timeline">
                            Timeline View
                        </TabsTrigger>
                        <TabsTrigger value="flow">
                            Flow View
                        </TabsTrigger>
                    </TabsList> */}
                </CardHeader>

                <CardContent className="px-8">
                    {/* <TabsContent value="timeline" className="space-y-4 w-full">
                        <PublicTimelineView 
                            roadmap={roadmap} 
                            subdomain={subdomain}
                            externalLinks={externalLinks}
                            urlMilestone={urlMilestone}
                            setUrlMilestone={setUrlMilestone}
                        />
                    </TabsContent>
                    <TabsContent value="flow" className="space-y-4 w-full">
                        <div className="h-[40vh] w-full">
                            <PublicFlowView 
                                roadmap={roadmap} 
                                subdomain={subdomain}
                                urlMilestone={urlMilestone || undefined} 
                                setUrlMilestone={setUrlMilestone || undefined}
                                externalLinks={externalLinks}
                            />
                        </div>
                    </TabsContent> */}
                    {/* <ResearchPlansDataTable data={roadmaps} columns={columns}/> */}
                    <Table>
                        <TableHeader>
                            <TableRow className="pointer-events-none">
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roadmaps.map((roadmap) => (
                                <TableRow key={roadmap.id} className="cursor-pointer" onClick={() => router.push(`http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmap.id}`)}>
                                    <TableCell>
                                        <div>
                                            {roadmap.title || 'Untitled Research Plan'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="line-clamp-3">
                                            {roadmap.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                    <ul className="flex flex-col gap-2">
                                        {RESEARCH_PLAN_TYPES.filter(modality => roadmap.modalities.includes(modality.value)).map(modality => (
                                            <li>
                                                <Badge variant={"secondary"}>{modality.label}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Tabs>
    );
};

export const NoResearchPlanCard = ({isPublic}: {isPublic: Boolean}) => {
    return (
        <Card className="organization-profile-tour-step4">
            <CardContent>
                <div className="flex flex-col items-center justify-center space-x-4 my-8">
                    <h1 className="font-cal text-4xl">No research plan yet</h1>
                    <Image
                        alt="missing roadmap"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        width={300}
                        height={300}
                    />
                    <p className="text-lg text-stone-500">
                        You do not have a research plan yet. Create one to get started.
                    </p>
                    {!isPublic && (
                        <a 
                            href={"/app/research-plan"}
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "h-10 mt-4"
                            )}
                        >
                                <Plus />
                                Create a research plan
                        </a>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export const UnderDevelopmentCard = ({isPublic}: {isPublic: Boolean}) => {
    const router = useRouter()
    
    return (
        <Card className="organization-profile-tour-step4">
            <CardHeader className="w-full pt-6 pb-2 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-0">
                    <CardTitle className="scroll-m-20 text-3xl font-bold tracking-tight">
                        Research Plan
                    </CardTitle>
                    {!isPublic &&
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/app/research-plan")}
                            className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                        >
                            Edit research plan
                            <Pencil />
                        </Button>
                    }
                </div>
            </CardHeader>

            <CardContent className="px-8">
                <div className="flex flex-col items-center justify-center space-x-4 my-8 gap-2">
                    <h1 className="font-cal text-4xl text-center">This research plan is under development</h1>
                    <Image
                        alt="missing roadmap"
                        src="https://illustrations.popsy.co/gray/creative-work.svg"
                        width={400}
                        height={400}
                    />
                    <p className="text-lg text-stone-500">
                        {isPublic 
                            ? "This research plan does not have any public projects."
                            : "Your research plan does not have any public projects."
                        }
                    </p>
                    {!isPublic && (
                        <Link 
                            href={"/app/research-plan"}
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "h-10"
                            )}
                        >
                                <Plus />
                                Create a project
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

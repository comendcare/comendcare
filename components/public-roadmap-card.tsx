"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
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
import { ChevronsUpDown, Pencil, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { MODALITIES, RESEARCH_PLAN_TYPES, Roadmap } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Organization } from "@prisma/client";
import { PrivateNoResearchPlansColumn, PublicNoResearchPlans } from "./no-research-plans";
import { NoProjects } from "./no-projects";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { FunctionComponent, ReactElement, useState } from "react";
import { labels } from "@/lib/data";

export const RoadmapsCard = ({
    roadmaps,
    organization,
}: {
    roadmaps: any[],
    organization: Organization,
}) => {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <Card className="organization-profile-tour-step4">
            <CardHeader className="w-full pt-6 pb-2 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-0">
                    <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">
                        Research Plans
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
            </CardHeader>

            <CardContent className="px-8">
                {(roadmaps && roadmaps.length > 0) 
                    ? <RoadmapsTable 
                        roadmaps={roadmaps} 
                        rowClickCallback={(roadmap) => 
                            router.push(organization.subdomain ? `http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmap.id}` : '#')
                        }
                    />
                    : (pathname === "/app/profile" 
                        ? <PrivateNoResearchPlansColumn />
                        : <PublicNoResearchPlans organizationName={organization.name}/>
                    )
                }
            </CardContent>
        </Card>
    )
}

export const RoadmapCard = ({
    roadmap, 
    urlMilestone, 
    setUrlMilestone, 
    urlView,
    setUrlView,
    subdomain, 
    isPublic,
    externalLinks
}: { 
    roadmap: any, 
    urlMilestone?: string | undefined,
    setUrlMilestone?: (id: string | undefined) => void,
    urlView?: string | undefined,
    setUrlView?: (view: string | undefined) => void,
    subdomain: string | undefined, 
    isPublic: boolean ,
    externalLinks: boolean
}) => {
    if (!roadmap) {
        return <PublicNoResearchPlans />
    }

    if (roadmap?.milestones && roadmap.milestones.length <= 0) {
        return <NoProjectsCard isPublic={isPublic} />
    }

    return (
        <Tabs
            defaultValue={urlView === 'flow' ? 'flow' : 'timeline'}
            className="w-full"
            onValueChange={setUrlView ? setUrlView: () => {}}
        >
            <Card className="organization-profile-tour-step4">
                <CardHeader className="w-full pt-6 pb-2 space-y-4">
                    <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">
                        {roadmap.title || 'Untitled Research Plan'}
                    </CardTitle>
                    <CardDescription>
                        {roadmap.description}
                    </CardDescription>
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
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
};

export const NoProjectsCard = ({isPublic}: {isPublic: Boolean}) => {
    const router = useRouter()
    
    return (
        <Card className="organization-profile-tour-step4">
            <CardContent className="px-8 pt-4">
                <NoProjects />
            </CardContent>
        </Card>
    )
}

export const RoadmapsTable = ({roadmaps, rowClickCallback}: {roadmaps: any[], rowClickCallback: (roadmap: any) => void}) => {
    const router = useRouter()

    return (
        <Table>
            <TableHeader>
                <TableRow className="pointer-events-none">
                <TableHead className="w-full">Title & Description</TableHead>
                <TableHead className="w-fit text-nowrap">Stage of Activity</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {RESEARCH_PLAN_TYPES.map(type => {
                    const roadmapsForModality = roadmaps.filter(roadmap => roadmap.modalities.includes(type.value))
                    if (roadmapsForModality.length <= 0) return <></>

                    return (
                        <CollapsibleTableGroup 
                            label={type.label}
                            colSpan={2}
                        >
                            {roadmapsForModality.map(roadmap => (
                                <TableRow key={roadmap.id} className="cursor-pointer" onClick={() => rowClickCallback(roadmap)}>
                                    <TableCell>
                                        <p className="font-semibold">{roadmap.title || 'Untitled Research Plan'}</p>
                                        {roadmap.description && (
                                            <p className="line-clamp-2 text-muted-foreground">{roadmap.description}</p>
                                        )}
                                    </TableCell>
                                    <TableCell className="flex justify-end items-center">
                                        <StageOfActivityBadge milestones={roadmap.milestones} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </CollapsibleTableGroup>
                    )
                })}
                {roadmaps.filter(roadmap => roadmap.modalities.length === 0).length > 0 && (
                    <CollapsibleTableGroup 
                        label={'No type'}
                        colSpan={2}
                    >
                        {roadmaps.filter(roadmap => roadmap.modalities.length === 0).map(roadmap => (
                            <TableRow key={roadmap.id} className="cursor-pointer" onClick={() => rowClickCallback(roadmap)}>
                                <TableCell>
                                    <p className="font-semibold">{roadmap.title || 'Untitled Research Plan'}</p>
                                    {roadmap.description && (
                                        <p className="line-clamp-2 text-muted-foreground">{roadmap.description}</p>
                                    )}
                                </TableCell>
                                <TableCell className="flex justify-end items-center">
                                    <StageOfActivityBadge milestones={roadmap.milestones} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </CollapsibleTableGroup>
                )}
            </TableBody>
        </Table>
    )
}

export const CollapsibleTableGroup = ({label, colSpan, children}: {label: string, colSpan: number, children?: React.ReactNode}) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <>
            <TableRow 
                data-state={undefined} 
                className="!appearance-none cursor-pointer bg-gray-50"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <TableCell colSpan={colSpan} className="p-2">
                    <div className="flex gap-2 justify-between items-center">
                        {label}
                        <ChevronsUpDown className="h-4 w-4"/>
                    </div>
                </TableCell>
            </TableRow>
            {isOpen && (children)}
        </>
    )
}

export const getStage = (milestones: any[]): {value: string, label: string, variant: string} => {
    if (milestones.length <= 2) return {value: 'IDEA', label: 'Idea Stage', variant: 'amber'}
    if (milestones.length <= 4) return {value: 'EARLY_RESEARCH', label: 'Early Research', variant: 'lime'}
    if (milestones.length <= 6) return {value: 'LAB_TESTING', label: 'Lab Testing', variant: 'emerald'}
    if (milestones.length <= 8) return {value: 'TRIAL_READY', label: 'Trial Ready', variant: 'cyan'}
    if (milestones.length <= 10) return {value: 'IN_TRIALS', label: 'In Trials', variant: 'indigo'}
    if (milestones.length <= 12) return {value: 'POST_TRIAL', label: 'Post Trial', variant: 'purple'}
    
    return {value: 'UNKNOWN', label: 'Unknown Stage', variant: 'secondary'}
}

export const StageOfActivityBadge = ({milestones}: {milestones: any[]}) => {
    const stage = getStage(milestones)
    return (
        <Badge variant={stage.variant as any}>{stage.label}</Badge>
    )
}

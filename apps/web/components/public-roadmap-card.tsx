"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {cn, getStage} from "@comend/lib/utils";
import "@xyflow/react/dist/base.css"
import {PublicFlowView} from "./public-flow";
import {PublicTimelineView} from "./public-timeline";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@comend/components/ui/tabs";
import {Button} from "@comend/components/ui/button";
import {ChevronsUpDown, Pencil, Plus, Variable} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@comend/components/ui/table";
import {Milestone, milestoneCategories, MODALITIES, Option, RESEARCH_PLAN_TYPES, Roadmap} from "@comend/lib/types";
import {Badge} from "@comend/components/ui/badge";
import type {Organization} from "@prisma/client";
import {PrivateNoResearchPlansColumn, PrivateNoResearchPlansRow, PublicNoResearchPlans} from "./no-research-plans";
import {NoProjects} from "./no-projects";
import {FunctionComponent, ReactElement, useState} from "react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/packages/components/ui/tooltip";

export const RoadmapsCard = ({
                                 roadmaps,
                                 organization,
                             }: {
    roadmaps: any[],
    organization: Partial<Organization>,
}) => {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <Card className="organization-profile-tour-step4" data-testid="roadmaps-card">
            <CardHeader className="w-full pt-6 pb-2 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-0">
                    <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight" data-testid="roadmaps-heading">
                        Research plans
                    </CardTitle>
                    {pathname === "/app/profile" &&
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/app/research-plan")}
                            className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                        >
                            Edit research plan
                            <Pencil/>
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
                            ? <PrivateNoResearchPlansColumn/>
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
                                organization,
                                externalLinks
                            }: {
    roadmap: any,
    urlMilestone?: string | undefined,
    setUrlMilestone?: (id: string | undefined) => void,
    urlView?: string | undefined,
    setUrlView?: (view: string | undefined) => void,
    subdomain: string | undefined,
    isPublic: boolean,
    organization?: Partial<Organization>,
    externalLinks: boolean
}) => {
    const params = useSearchParams()
    if (!roadmap) {
        return <PublicNoResearchPlans/>
    }

    if (roadmap?.milestones && roadmap.milestones.length <= 0) {
        return <NoProjectsCard isPublic={isPublic}/>
    }

    return (
        <Tabs
            // defaultValue={urlView === 'flow' || params.get('view') === 'flow' ? 'flow' : 'list'} // list default
            // defaultValue={urlView === 'list' || params.get('view') === 'list' ? 'list' : 'flow'} // flow default
            value={urlView === 'list' || params.get('view') === 'list' ? 'list' : 'flow'}
            className="w-full"
            onValueChange={setUrlView ? setUrlView : () => {
            }}
        >
            <Card className="organization-profile-tour-step4 flex flex-col gap-0">
                <CardHeader className="w-full pt-6 pb-0 space-y-4">
                    <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        {roadmap.title || 'Untitled Research Plan'}
                    </CardTitle>
                    <CardDescription>
                        {roadmap.description}
                    </CardDescription>
                    <div className="flex gap-2">
                        {RESEARCH_PLAN_TYPES.filter(typeOption => (roadmap.modalities || []).includes(typeOption.value)).map((type: Option, index) =>
                            <ResearchPlanTypeBadge key={index} label={type.label}/>)}
                        <StageOfActivityBadge milestones={roadmap.milestones}/>
                    </div>

                    <TabsList className="w-min rounded-t-md rounded-b-none z-10 -py-2">
                        <TabsTrigger value="flow" className="data-[state=active]:shadow-none rounded-b-none -mb-2 py-2.5">
                            Flow View
                        </TabsTrigger>
                        <TabsTrigger value="list" className="data-[state=active]:shadow-none rounded-b-none -mb-2 py-2.5">
                            List View
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>

                <CardContent className="bg-secondary mx-6 mb-6 rounded-b-md rounded-r-md -mt-1 p-1">
                    <TabsContent value="flow" className="w-full p-0 mt-0">
                        <div className="h-[60vh] w-full bg-white rounded-b-md rounded-r-md">
                            <PublicFlowView
                                roadmap={roadmap}
                                subdomain={subdomain}
                                urlMilestone={urlMilestone || undefined}
                                setUrlMilestone={setUrlMilestone || undefined}
                                externalLinks={externalLinks}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="list" className="w-full p-0 mt-0">
                        <PublicTimelineView
                            roadmap={roadmap}
                            subdomain={subdomain}
                            externalLinks={externalLinks}
                            urlMilestone={urlMilestone}
                            organization={organization}
                            setUrlMilestone={setUrlMilestone}
                        />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
};

export const NoProjectsCard = ({isPublic}: { isPublic: Boolean }) => {
    const router = useRouter()

    return (
        <Card className="organization-profile-tour-step4">
            <CardContent className="px-8 pt-4">
                <NoProjects/>
            </CardContent>
        </Card>
    )
}

export const RoadmapsTable = ({roadmaps, rowClickCallback}: {
    roadmaps: any[],
    rowClickCallback: (roadmap: any) => void
}) => {
    const router = useRouter()

    console.log(`roadmaps`, roadmaps)

    return (
        <Table>
            <TableHeader>
                <TableRow className="pointer-events-none">
                    <TableHead className="w-full">Therapeutic strategy</TableHead>
                    <TableHead className="self-end text-right w-fit text-nowrap">Stage</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {RESEARCH_PLAN_TYPES.map((type, index) => {
                    const roadmapsForModality = roadmaps.filter(roadmap => (roadmap.modalities || []).includes(type.value) && type.value !== "OTHER")
                    if (roadmapsForModality.length <= 0) return <></>

                    return (
                        // add a section for each roadmap type EXCEPT the OTHER type (handled below)
                        <CollapsibleTableGroup
                            key={index}
                            label={type.label}
                            colSpan={2}
                            disabled={true}
                        >
                            {roadmapsForModality.map(roadmap => (
                                <TableRow key={roadmap.id} className="cursor-pointer"
                                          onClick={() => rowClickCallback(roadmap)}>
                                    <TableCell>
                                        <p className="font-semibold">{roadmap.title || 'Untitled Research Plan'}</p>
                                        {/* {roadmap.description && (
                                            <p className="line-clamp-2 text-muted-foreground">{roadmap.description}</p>
                                        )} */}
                                    </TableCell>
                                    <TableCell className="flex justify-end items-center">
                                        <StageOfActivityBadge milestones={roadmap.milestones}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </CollapsibleTableGroup>
                    )
                })}
                {roadmaps.filter(roadmap => (roadmap.modalities || []).length === 0 || roadmap.modalities.includes("OTHER")).length > 0 && (
                    // group research plans with no type or 'other' type together in the table
                    <CollapsibleTableGroup
                        label={'Other'}
                        colSpan={2}
                        disabled={true}
                    >
                        {roadmaps.filter(roadmap => (roadmap.modalities || []).length === 0 || roadmap.modalities.includes("OTHER")).map(roadmap => (
                            <TableRow key={roadmap.id} className="cursor-pointer"
                                      onClick={() => rowClickCallback(roadmap)}>
                                <TableCell>
                                    <p className="font-semibold">{roadmap.title || 'Untitled Research Plan'}</p>
                                    {/* {roadmap.description && (
                                        <p className="line-clamp-2 text-muted-foreground">{roadmap.description}</p>
                                    )} */}
                                </TableCell>
                                <TableCell className="flex justify-end items-center">
                                    <StageOfActivityBadge milestones={roadmap.milestones}/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </CollapsibleTableGroup>
                )}
                {roadmaps.length <= 0 && (
                    <div className="p-4">
                        <PrivateNoResearchPlansRow/>
                    </div>
                )}
            </TableBody>
        </Table>
    )
}

export const CollapsibleTableGroup = ({label, colSpan, disabled = false, children}: {
    label: string,
    colSpan: number,
    disabled?: boolean
    children?: React.ReactNode
}) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <>
            <TableRow
                data-state={undefined}
                className={cn(
                    "!appearance-none bg-gray-50",
                    (!disabled && "cursor-pointer")
                )}
                onClick={() => {
                    if (!disabled) setIsOpen(prev => !prev)
                }}
            >
                <TableCell colSpan={colSpan} className="p-2">
                    <div className="flex gap-2 justify-between items-center">
                        {label}
                        {!disabled && <ChevronsUpDown className="h-4 w-4"/>}
                    </div>
                </TableCell>
            </TableRow>
            {isOpen && (children)}
        </>
    )
}

export const StageOfActivityBadge = ({milestones}: { milestones: Milestone[] }) => {
    const stage = getStage(milestones)
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger>
                    <Badge variant={stage.variant as any} className="text-sm">{stage.label}</Badge>
                </TooltipTrigger>

                <TooltipContent className="max-w-80">
                    Stage
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export const ResearchPlanTypeBadge = ({label}: { label: string }) => {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger>
                    <Badge variant={'secondary'} className="text-sm">{label}</Badge>
                </TooltipTrigger>

                <TooltipContent className="max-w-80">
                    Therapeutic approach
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

"use client"

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic"
import type { Organization } from "@prisma/client";
import { ResearchPlanTemplatesCard } from "./roadmap-templates";
import Loading from "./../../../loading";
import { initializeRoadmapState } from "@comend/lib/initialize-client-state";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@comend/components/ui/button";
import { Plus, Share } from "lucide-react";
import { Dialog, DialogContent } from "@comend/components/ui/dialog";
import ShareDialog from "./share-dialog";
import { PulsatingButton } from "@comend/components/ui/pulsating-button";
import { cn } from "@comend/lib/utils";
import { Shell } from "@comend/components/biorepo/advanced-data-table/lib/shell";
import { FeatureFlagsProvider } from "@comend/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { useSession } from "next-auth/react";
import { Row } from "@tanstack/react-table";
import { NoResultsTemplate } from "@comend/components/no-results";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@comend/components/ui/tabs";
import { DatabaseProjectsTable } from "@comend/components/biorepo/advanced-data-table/projects-table/database-projects-table"
import { useProjectsTableColumns } from "@comend/components/biorepo/advanced-data-table/projects-table/private-projects-table-columns";
import {ResearchPlanCard} from "@comend/components/research-plan-card"
import Link from "next/link";

const CreateResearchPlanDialog = dynamic(
    () => import("./create-research-plan-dialog"),
    {
        ssr: false,
        loading: () => <Button variant="cta" disabled>
            <Plus/>
            Create an empty research plan
        </Button>, // keep trigger UI unchanged
    }
)

type Props = {
    orgId: string;
    organization: Pick<Organization, "id" | "name" | "subdomain" | "customDomain">;
    // roadmaps: any[];
    researchPlansData: any;
    researchPlansPageCount: any;
    projectsData: any;
    projectsPageCount: any;
    // columns: any;
    searchParams: any;
};

export default function RoadmapsPage({ orgId, organization, researchPlansData, researchPlansPageCount, projectsData, projectsPageCount, searchParams }: Props) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [shareIsOpen, setShareIsOpen] = useState(false)
    const {data: session} = useSession()
    const projectColumns = useProjectsTableColumns({session})

    useEffect(() => {
        // un-initialize any active research plans
        initializeRoadmapState({
            roadmapId: undefined,
            details: undefined,
            nodes: [],
            edges: [],
            milestones: [],
            selectedView: null,
            selectedNodeIds: [],
        })
    }, [])

    useEffect(() => {
        if (!Array.isArray(researchPlansData)) return

        researchPlansData
            .map((r) => r?.id)
            .filter((id): id is string => typeof id === "string" && id.length > 0)
            .forEach((id) => {
                router.prefetch(`/app/research-plan/${id}`)
            })
    }, [researchPlansData, router])

    const handleShare = async () => {
        // override default delete behaviour with our custom dialog
        setShareIsOpen(true)
    }

    const currentView = searchParams?.view === "projects" ? "projects" : "researchPlans";

    if (isLoading) return <Loading />

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto p-4 gap-4">
            <ResearchPlanTemplatesCard orgId={orgId} setIsLoading={setIsLoading}/>
            <Tabs 
                value={currentView}
                className="w-full" 
                onValueChange={(value) => {
                    const params = new URLSearchParams();
                    params.set("view", value);
                    router.push(`?${params.toString()}`, { scroll: false });
                }}
            >
                <TabsList>
                    <TabsTrigger value="researchPlans">My research plans</TabsTrigger>
                    <TabsTrigger value="projects">My projects</TabsTrigger>
                </TabsList>
                <TabsContent value="researchPlans" className="w-full">
                    <div className="w-full onborda-existing-research-plans-section">
                        <div className="w-full flex justify-between items-center gap-4">
                            <h2 className="col-span-full font-semibold text-2xl">My research plans</h2>
                            <div className="flex gap-4">
                                {researchPlansData.length > 0 
                                    ? (
                                        <CreateResearchPlanDialog 
                                            trigger={
                                            <Button variant="cta">
                                                <Plus />
                                                Create an empty research plan
                                            </Button>
                                            }
                                        />
                                    ) 
                                    : (
                                        <CreateResearchPlanDialog 
                                            trigger={
                                                <PulsatingButton
                                                    className={cn(buttonVariants({variant: 'cta'}))}
                                                >
                                                    <Plus />
                                                    Create an empty research plan
                                                </PulsatingButton>
                                            }
                                        />
                                    )
                                }
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleShare()
                                    }}
                                    variant={'secondary'}
                                    className="onborda-share-research-plan"
                                >
                                    <Share />
                                    Share
                                </Button>
                            </div>
                        </div>
                        {researchPlansData.length > 0 ? (
                            <div className="pt-6 w-full h-full grid grid-cols-3 gap-4">
                                {researchPlansData.map((researchPlan: any) => (
                                    <Link href={`/app/research-plan/${researchPlan.id}`}>
                                        <ResearchPlanCard researchPlan={researchPlan}/>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full h-full flex justify-center items-center">
                            <NoResultsTemplate
                                imgAlt="No research plans"
                                src="https://illustrations.popsy.co/gray/studying.svg"
                                title="No research plans yet!"
                                description="Your organization does not have any research plans yet."
                            />
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="projects" className="w-full">
                    <div className="w-full">
                        <div className="w-full flex justify-between items-center gap-4">
                            <h2 className="col-span-full font-semibold text-2xl">My Projects</h2>
                        </div>
                        <Shell className="gap-2 w-full max-w-full">
                            <FeatureFlagsProvider showFilters={false}>
                                <Suspense
                                    fallback={
                                        <DataTableSkeleton
                                            columnCount={7}
                                            filterCount={2}
                                            cellWidths={[
                                                "10rem",
                                                "30rem",
                                                "10rem",
                                                "10rem",
                                                "6rem",
                                                "6rem",
                                                "6rem",
                                            ]}
                                            shrinkZero
                                        />
                                    }
                                >
                                    <DatabaseProjectsTable 
                                        data={projectsData} 
                                        pageCount={projectsPageCount} 
                                        columns={projectColumns}
                                        searchParams={searchParams}
                                        onRowClickCallback={(e: any, row: Row<any> | undefined) => row?.original.id && router.push(`/app/research-plan/${row.original.roadmapId}?project=${row.original.nodeId}`)}
                                        showPagination={true}
                                        noResultsOverride={(
                                            <NoResultsTemplate
                                                imgAlt="No projects"
                                                src="https://illustrations.popsy.co/gray/studying.svg"
                                                title="No projects yet!"
                                                description="Your organization does not have any projects yet."
                                            />
                                        )}
                                    />
                                </Suspense>
                            </FeatureFlagsProvider>
                        </Shell>
                    </div>
                </TabsContent>
            </Tabs>
            
            <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
                <DialogContent className="min-w-fit">
                    { "subdomain" in organization && typeof organization.subdomain === "string" ? (
                        <ShareDialog
                            url={`${process.env.NEXT_PUBLIC_VERCEL_ENV
                                ? `https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                : `http://${organization.subdomain}.localhost:3000`
                            }/research-plan`}
                            organization={organization}
                            // postMessage={`A new project ${milestone.title} has been added to ${organization.name} ${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${milestone.roadmapId}?project=${milestone.id}`}
                            // postSubject={`A new project ${milestone.title} has been added to ${organization.name}`}
                            embeddedResearchPlansData={{
                                embeddedResearchPlansLink: `${process.env.NEXT_PUBLIC_VERCEL_ENV
                                    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                    : `http://localhost:3000`
                                }/embed/${organization.subdomain}/research-plans`,                            }}
                            // trackShareEvent={(socialOption: string) => {
                            //     mixpanelTrack(`Research Plans Table Shared`, {
                            //         "Platform": socialOption,
                            //         ...(organization ? {
                            //             "Organization ID": organization.id,
                            //             "Organization Name": organization.name
                            //         } : undefined)
                            //     })
                            // }}
                            trackShareEvent={{
                                title: `Research Plans Table Shared`
                            }}
                        />
                    ) : (
                        <div className="text-sm text-muted-foreground">Loading organization...</div>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    )
}

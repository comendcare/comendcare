"use client"
import { Suspense, useEffect, useState } from "react";

import type { Organization, Roadmap } from "@prisma/client";
import { ResearchPlanTemplatesCard } from "./roadmap-templates";
import Loading from "./../../../loading";
import { initializeRoadmapState } from "@comend/lib/initialize-client-state";
import { useRouter } from "next/navigation";
import { RoadmapsTable } from "./public-roadmap-card";
import { Button, buttonVariants } from "@comend/components/ui/button";
import { Plus, Share } from "lucide-react";
import { Dialog, DialogContent } from "@comend/components/ui/dialog";
import ShareDialog from "./share-dialog";
import { PulsatingButton } from "@comend/components/ui/pulsating-button";
import { cn } from "@comend/lib/utils";
import CreateResearchPlanDialog from "./create-research-plan-dialog";
import { Shell } from "@comend/components/biorepo/advanced-data-table/lib/shell";
import { FeatureFlagsProvider } from "@comend/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { DatabaseResearchPlansTable } from "@comend/components/biorepo/advanced-data-table/research-plans-table/database-research-plans-table"
import { useResearchPlansTableColumns } from "@comend/components/biorepo/advanced-data-table/research-plans-table/private-research-plans-table-columns";
import { useSession } from "next-auth/react";
import { Row } from "@tanstack/react-table";


type Props = {
    orgId: string;
    organization: Pick<Organization, "id" | "name" | "subdomain" | "customDomain">;
    // roadmaps: any[];
    data: any;
    pageCount: any;
    // columns: any;
    searchParams: any;
};

export default function RoadmapsPage({ orgId, organization, data, pageCount, searchParams }: Props) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [shareIsOpen, setShareIsOpen] = useState(false)
    const {data: session} = useSession()
    const columns = useResearchPlansTableColumns({session})

    useEffect(() => {
        // un-initialize any active research plans
        initializeRoadmapState({
            roadmapId: undefined,
            details: undefined,
            nodes: [],
            edges: [],
            milestones: [],
            selectedView: null,
            selectedNodeIds: []
        })
    }, [])

    const handleShare = async () => {
        // override default delete behaviour with our custom dialog
        setShareIsOpen(true)
    }

    if (isLoading) return <Loading />

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto p-4 gap-4">
            <ResearchPlanTemplatesCard orgId={orgId} setIsLoading={setIsLoading}/>
            <div className="p-6 w-full onborda-existing-research-plans-section">
                <div className="w-full flex justify-between items-center gap-4">
                    <h2 className="col-span-full font-semibold text-2xl">My research plans</h2>
                    <div className="flex gap-4 ">
                        {data.length > 0 
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
                {/* <RoadmapsTable 
                    isPrivate={true}
                    roadmaps={roadmaps} 
                    rowClickCallback={(roadmap) => {
                        setIsLoading(true)
                        router.push(`/app/research-plan/${roadmap.id}`)
                    }}
                /> */}
                <Shell className="gap-2">
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
                            <DatabaseResearchPlansTable 
                                data={data} 
                                pageCount={pageCount} 
                                columns={columns}
                                searchParams={searchParams}
                                // onSelectionChange={setRowSelection}
                                onRowClickCallback={(e: any, row: Row<any> | undefined) => row?.original.id && router.push(`/app/research-plan/${row.original.id}`)}
                                showPagination={true}
                                // noResultsOverride={(
                                //     <NoResultsTemplate 
                                //         imgAlt="No biosample tools"
                                //         src="https://illustrations.popsy.co/gray/graphic-design.svg"
                                //         title="You do not have any patient biosamples"
                                //         description="A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, papers."
                                //     />
                                // )}
                            />
                        </Suspense>
                    </FeatureFlagsProvider>
                </Shell>
            </div>
            
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

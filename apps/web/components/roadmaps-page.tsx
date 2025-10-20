"use client"
import { useEffect, useState } from "react";

import type { Organization, Roadmap } from "@prisma/client";
import { ResearchPlanTemplatesCard } from "./roadmap-templates";
import Loading from "@/loading";
import { initializeRoadmapState } from "@comend/lib/initialize-client-state";
import { useRouter } from "next/navigation";
import { RoadmapsTable } from "./public-roadmap-card";
import { Button } from "@comend/components/ui/button";
import { Share } from "lucide-react";
import { Dialog, DialogContent } from "@comend/components/ui/dialog";
import ShareDialog from "./share-dialog";

type Props = {
    orgId: string;
    organization: Pick<Organization, "id" | "name" | "subdomain" | "customDomain">;
    roadmaps: any[];
};

export default function RoadmapsPage({ orgId, organization, roadmaps }: Props) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [shareIsOpen, setShareIsOpen] = useState(false)

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
                    <h2 className="col-span-full font-semibold text-2xl">My Research Plans</h2>
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
                {/* {roadmaps.length > 0 && ( */}
                    <RoadmapsTable 
                        roadmaps={roadmaps} 
                        rowClickCallback={(roadmap) => {
                            setIsLoading(true)
                            router.push(`/app/research-plan/${roadmap.id}`)
                        }}
                    />
                {/* )} */}
                {/* {roadmaps.length === 0 && (
                    <PrivateNoResearchPlansRow />
                )} */}
            </div>
            
            <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
                <DialogContent className="min-w-fit">
                    { "subdomain" in organization && typeof organization.subdomain === "string" ? (
                        <ShareDialog
                            url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`}
                            organization={organization}
                            // postMessage={`A new project ${milestone.title} has been added to ${organization.name} ${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${milestone.roadmapId}?project=${milestone.id}`}
                            // postSubject={`A new project ${milestone.title} has been added to ${organization.name}`}
                            embeddedResearchPlansData={{
                                embeddedResearchPlansLink: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/embed/${organization.subdomain}/research-plans`,
                            }}
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

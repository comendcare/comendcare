"use client"
import { useEffect, useState } from "react";
import { Organization, Roadmap } from "@prisma/client";
import { ResearchPlanTemplatesCard } from "./roadmap-templates";
import { PrivateNoResearchPlansRow } from "./no-research-plans";
import Loading from "@/app/loading";
import { initializeRoadmapState } from "@/lib/initialize-client-state";
import { useRouter } from "next/navigation";
import { RoadmapsTable } from "./public-roadmap-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Ellipsis, Share } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import ShareDialog from "./share-dialog";
import { getOrganizationFromOrganizationId } from "@/lib/fetchers";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { mixpanelTrack } from "@/app/mixpanel";

export default function RoadmapsPage({roadmaps, orgId}: {roadmaps: Roadmap[], orgId: string}) {
    const router = useRouter()
    const {data: session, status} = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [shareIsOpen, setShareIsOpen] = useState(false)
    const [organization, setOrganization] = useState<Organization | {}>({})

    useEffect(() => {
        // un-initialize any active research plans
        initializeRoadmapState({
            roadmapId: undefined,
            details: undefined,
            nodes: [],
            edges: [],
            milestones: [],
            selectedView: null,
            selectedNodeId: null 
        })
    }, [])

    useEffect(() => {
        async function fetchOrgData() {
            if (session?.user.organizationId) {
                try {
                    const response = await getOrganizationFromOrganizationId(session.user.organizationId)

                    // Map the response to the correct structure if needed
                    if (response.success && response.data) {
                        setOrganization(response.data);
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }

                } catch (error) {
                    console.error("Error fetching organizations:", error);
                    toast.error("Couldn't get organizations");
                }
            }
        }

        fetchOrgData()
    }, [session])

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
                    <h2 className="col-span-full font-semibold text-2xl">Research Plans</h2>
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
                <DialogContent>
                    { "subdomain" in organization && typeof organization.subdomain === "string" ? (
                        <ShareDialog
                            url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`}
                            organization={organization}
                            // postMessage={`A new project ${milestone.title} has been added to ${organization.name} ${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${milestone.roadmapId}?project=${milestone.id}`}
                            // postSubject={`A new project ${milestone.title} has been added to ${organization.name}`}
                            embeddedResearchPlansLink={`${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/embed/${organization.subdomain}/research-plans`}
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
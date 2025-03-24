"use client"
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {usePathname, useRouter} from "next/navigation";
import {cn, sleep} from "@/lib/utils";
import {faker} from "@faker-js/faker";
import { AssetDetails } from "./asset-details";
import { RFPDetails } from "./rfp-details.tsx";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { useStoreApi } from "@xyflow/react";
import { getNodesEdgesAndMilestones, getRoadmap } from "@/lib/fetchers";
import { useSession } from "next-auth/react";
import { createRoadmap } from "@/lib/actions";
import { initializeRoadmapState } from "@/lib/initialize-client-state";
import { toast } from "sonner";
import { Plus } from "lucide-react";

// Define types for statuses and environments
type Recency = 'Due' | 'New';

const environments: Record<Recency, string> = {
    Due: 'text-red-400 bg-red-400/10 ring-red-400/20',
    New: 'text-green-400 bg-green-400/10 ring-green-400/30',
};

const selector = (state: RoadmapState) => ({
    addMilestones: state.addMilestones
})

export const PAGProfileAssetsAndRFPsHoverableCard = ({ assets, rfps, isPrivate }: { assets: any[], rfps: any[], isPrivate: boolean }) => {
    faker.seed(123)
    const router = useRouter();
    const pathname = usePathname()
    const store = useStoreApi()
    const {
        addMilestones
    } = useRoadmapStore(useShallow(selector))
    const {data: session} = useSession()

    if (assets && rfps) {
        return (
            <Card className="organization-profile-tour-step5">
                {/*<CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-0">*/}
                {/*    <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">*/}
                {/*        Milestones*/}
                {/*    </CardTitle>*/}
                {/*</CardHeader>*/}

                <CardContent className="grid md:grid-cols-2 gap-4 mt-8">
                    <div className="flex flex-col space-y-4">
                        <span className="flex gap-2">
                            <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                {`Requests for Proposals`}
                            </h3>
                            {/* {NODE_TYPE_OPTIONS.find(value => value.value === "RFP") && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left">
                                            {NODE_TYPE_OPTIONS.find(value => value.value === "RFP")?.description}
                                    </TooltipContent>
                                </Tooltip>
                            )} */}
                        </span>
                        {rfps.length > 0 && (
                            <ul role="list" className="divide-y">
                                {rfps.map((rfp, index) =>
                                    <RFPDetails key={index} rfp={rfp} isPublic={!isPrivate}/>
                                )}
                            </ul>
                        )}
                        {isPrivate && (
                            <div className="flex flex-col gap-2">
                                <Button
                                    className="w-fit"
                                    variant={"secondary"}
                                    onClick={async () => {
                                        if (session?.user?.organizationId) {
                                            const response = await getRoadmap(session.user.organizationId)
                                            if (response.success && response.data && response.data?.id) {
                                                const newRFPs = await addMilestones([{
                                                    nodeType: "RFP",
                                                    title: "New RFP"
                                                }])

                                                if (newRFPs?.[0]?.id) {
                                                    await sleep(100)
                                                    router.push(`/app/research-plan?milestone=${newRFPs?.[0]?.id}`)
                                                    router.refresh()
                                                }
                                            } else {
                                                // no roadmap found, create roadmap first
                                                const roadmap = await createRoadmap(session.user.organizationId, {
                                                    title: '',
                                                    description: '',
                                                    milestones: [{
                                                        title: 'New RFP',
                                                        nodeType: "RFP"
                                                    }]
                                                })

                                                if (roadmap?.id) {
                                                    // setRoadmapId(response.data)
                                                    const nodesResponse = await getNodesEdgesAndMilestones(roadmap.id)
                                                    const urlNode = roadmap.nodes[0].id
                                                    if (nodesResponse.success) {
                                                        initializeRoadmapState({
                                                            roadmapId: roadmap.id,
                                                            nodes: nodesResponse.data.nodes,
                                                            edges: nodesResponse.data.edges,
                                                            milestones: nodesResponse.data.milestones,
                                                            selectedNodeId: urlNode
                                                        })
                                                    }
                                                    toast.success(`Successfully created roadmap`)
                                                } else {
                                                    console.error(response.error)
                                                    toast.error(response.error)
                                                }

                                                if (roadmap && roadmap?.nodes?.[0]?.id) {
                                                    await sleep(100)
                                                    router.push(`/app/research-plan?milestone=${roadmap.nodes[0].id}`)
                                                    router.refresh()
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <Plus />
                                    {`Create an RFP`}
                                </Button>
                            </div>
                        )}
                        {rfps.length <= 0 && !isPrivate && (
                            <p>{`No RFPs (Requests for Proposals) to show`}</p>
                        )}
                    </div>

                    <div className="flex flex-col space-y-4">
                        <span className="flex gap-2">
                            <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                {`Assets`}
                            </h3>
                            {/* {NODE_TYPE_OPTIONS.find(value => value.value === "ASSET") && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left">
                                            {NODE_TYPE_OPTIONS.find(value => value.value === "ASSET")?.description}
                                    </TooltipContent>
                                </Tooltip>
                            )} */}
                        </span>
                        {assets.length > 0 && (
                            <ul role="list" className="divide-y">
                                {faker.helpers.arrayElements(assets, faker.number.int({
                                    min: 2,
                                    max: 5
                                })).map((asset, index) =>
                                    <AssetDetails key={index} asset={asset} isPublic={!isPrivate}/>
                                )}
                            </ul>
                        )}
                        {isPrivate && (
                            <div className="flex flex-col gap-2">
                                <Button
                                    className="w-fit"
                                    variant={"secondary"}
                                    onClick={async () => {
                                        if (session?.user?.organizationId) {
                                            const response = await getRoadmap(session.user.organizationId)
                                            if (response.success && response.data && response.data?.id) {
                                                const newAssets = await addMilestones([{
                                                    nodeType: "ASSET",
                                                    title: "New Asset"
                                                }])
        
                                                if (newAssets?.[0]) {
                                                    await sleep(100)
                                                    router.push(`/app/research-plan?milestone=${newAssets?.[0]?.id}`)
                                                    router.refresh()
                                                }
                                            } else {
                                                // no roadmap found, create roadmap first
                                                const roadmap = await createRoadmap(session.user.organizationId, {
                                                    title: '',
                                                    description: '',
                                                    milestones: [{
                                                        title: 'New Asset',
                                                        nodeType: "ASSET"
                                                    }]
                                                })

                                                if (roadmap?.id) {
                                                    // setRoadmapId(response.data)
                                                    const nodesResponse = await getNodesEdgesAndMilestones(roadmap.id)
                                                    const urlNode = roadmap.nodes[0].id
                                                    if (nodesResponse.success) {
                                                        initializeRoadmapState({
                                                            roadmapId: roadmap.id,
                                                            nodes: nodesResponse.data.nodes,
                                                            edges: nodesResponse.data.edges,
                                                            milestones: nodesResponse.data.milestones,
                                                            selectedNodeId: urlNode
                                                        })
                                                    }
                                                    toast.success(`Successfully created roadmap`)
                                                } else {
                                                    console.error(response.error)
                                                    toast.error(response.error)
                                                }

                                                console.log(`created roadmap`, roadmap)

                                                if (roadmap && roadmap?.nodes?.[0]?.id) {
                                                    await sleep(100)
                                                    router.push(`/app/research-plan?milestone=${roadmap.nodes[0].id}`)
                                                    router.refresh()
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <Plus />
                                    {`Create an asset`}
                                </Button>
                            </div>
                        )}
                        {assets.length <= 0 && !isPrivate && (
                            <p>{`No assets to show`}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }
}

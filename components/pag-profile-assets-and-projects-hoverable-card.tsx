"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {FaArrowUpRightFromSquare, FaChevronRight, FaPaperclip, FaPen, FaPlus} from "react-icons/fa6";
import {usePathname, useRouter} from "next/navigation";
import {cn, setOnboarded, sleep} from "@/lib/utils";
import {faker} from "@faker-js/faker";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import { AssetDetails } from "./asset-details";
import { RFPDetails } from "./rfp-details.tsx";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { nanoid } from "nanoid";
import { useStoreApi, Node } from "@xyflow/react";
import { getNodesEdgesAndMilestones, getRoadmap } from "@/lib/fetchers";
import { useSession } from "next-auth/react";
import { createRoadmap } from "@/lib/actions";
import { FaInfoCircle } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { NODE_TYPE_OPTIONS } from "@/lib/types";
import { initializeRoadmapState } from "@/lib/initialize-client-state";
import { toast } from "sonner";

// Define types for statuses and environments
type Recency = 'Due' | 'New';

const environments: Record<Recency, string> = {
    Due: 'text-red-400 bg-red-400/10 ring-red-400/20',
    New: 'text-green-400 bg-green-400/10 ring-green-400/30',
};

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    nodes: state.nodes,
    setNodes: state.setNodes,
    edges: state.edges,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNodes: state.addNodes,
})

export const PAGProfileAssetsAndRFPsHoverableCard = ({ assets, rfps, isPrivate }: { assets: any[], rfps: any[], isPrivate: boolean }) => {
    faker.seed(123)
    const router = useRouter();
    const pathname = usePathname()
    const store = useStoreApi()
    const {
        selectedNodeId,
        setSelectedNodeId,
        milestones,
        nodes,
        setNodes: setDbNodes,
        edges,
        onEdgesChange,
        addNodes,
        onConnect,
    } = useRoadmapStore(useShallow(selector))
    const {data: session} = useSession()

    // Add a empty milestone node
    // if a position is provided, place at the given coordinates
    // if a position is not provided, place in the center
    const addMilestone = async (type: "ASSET" | "RFP", title: string) => {
        // get center of viewport: https://stackoverflow.com/questions/76349086/how-can-i-prevent-nodes-from-being-added-outside-the-view-area-in-react-flow
        const {
            height,
            width,
            transform: [transformX, transformY, zoomLevel]
        } = store.getState()

        const zoomMultiplier = 1 / zoomLevel
        // const centerX =
        //     -transformX * zoomMultiplier + (width * zoomMultiplier) / 2
        // const centerY =
        //     -transformY * zoomMultiplier + (height * zoomMultiplier) / 2
        const milestonesAlongXAxis = nodes.sort((a, b) => {
            return a.position.x - b.position.x
        })
        console.log(`milestones along XAxis`, milestonesAlongXAxis)
        // let centerX =
        //     -transformX * zoomMultiplier + (width * zoomMultiplier) / 2
        let centerX = milestonesAlongXAxis.length > 0 ? (
            milestonesAlongXAxis[milestonesAlongXAxis.length - 1].position.x + 500
        ): (
            0
        )
        // let centerY =
        //     -transformY * zoomMultiplier + (height * zoomMultiplier) / 2
        let centerY = 0

        const id = nanoid()
        const newNode = {
            id: id,
            type,
            position: {
                x: centerX,
                y: centerY
            },
            data: {
                id: nanoid(),
                nodeId: id,
                title,
                private: true,
                types: [],
                timelineOrder: milestones.length // add in last position in timeline
            }
        }

        await addNodes([newNode])
        return newNode
    }

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
                                        <FaInfoCircle />
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
                                                const newRFP = await addMilestone("RFP", "New RFP")

                                                if (newRFP?.id) {
                                                    await sleep(100)
                                                    router.push(`/app/research-plan?milestone=${newRFP.id}`)
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
                                    <FaPlus />
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
                                        <FaInfoCircle />
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
                                                const newAsset = await addMilestone("ASSET", "New Asset")
        
                                                if (newAsset) {
                                                    await sleep(100)
                                                    router.push(`/app/research-plan?milestone=${newAsset.id}`)
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
                                    <FaPlus />
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

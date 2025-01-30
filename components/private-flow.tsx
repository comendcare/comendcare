"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
    ReactFlow,
    MiniMap,
    Controls,
    useReactFlow,
    useStoreApi,
    applyNodeChanges,
} from "@xyflow/react"
import type { ConnectionState, Edge, FinalConnectionState, Node, NodeChange } from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import "@xyflow/react/dist/base.css"

import PrivateMilestoneNode from "@/components/private-milestone-node"
import PrivateAssetNode from "@/components/private-asset-node"
import PrivateProjectNode from "@/components/private-project-node"
import { Button } from "./ui/button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { nanoid } from "nanoid"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { DeleteMilestoneDialogContent } from "./delete-milestone-dialog-content"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useOnborda } from "./onborda/OnbordaContext"
import { toast } from "sonner"
import { isNewUser, setUserAsReturning } from "@/lib/utils"
import { ScrollArea } from "./ui/scroll-area"
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CheckBubble } from "./check-bubble"
import { templateMilestones } from "@/lib/templates"
import { debounce } from "lodash"
import { CustomEdge } from "./custom-edge"
import { Badge } from "./ui/badge"
import { NODE_TYPE_OPTIONS } from "@/lib/types"
import { MilestoneTemplateCard } from "./milestone-template-card"

const proOptions = { hideAttribution: true }

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

export const PrivateFlowView = ({
    width,
}: {
    width: number
}) => {
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
    const { fitView } = useReactFlow()
    const store = useStoreApi()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    // const { undo, redo, clear } = useRoadmapStore.temporal.getState()
    const nodeTypes = { PROJECT: PrivateMilestoneNode, ASSET: PrivateMilestoneNode, RFP: PrivateMilestoneNode }
    const edgeTypes = { DEFAULT: CustomEdge }
    const [milestoneData, setMilestoneData] = useState({})
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [newMilestoneIsOpen, setNewMilestoneIsOpen] = useState(false)
    const { startOnborda } = useOnborda()
    const { screenToFlowPosition } = useReactFlow()
    const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])

    useEffect(() => {
        setLocalNodes(nodes)
        setLocalEdges(edges)
    }, [nodes, edges])

    const [localNodes, setLocalNodes] = useState(nodes)
    const [localEdges, setLocalEdges] = useState(edges)

    const onNodesChange = (changes: NodeChange<Node>[]) => {
        const newNodes = applyNodeChanges(changes, localNodes)
        setLocalNodes(newNodes)

        debounceUpdateStore(newNodes)
    }

    const debounceUpdateStore = useCallback(
        debounce(
            (nodes: Node[]) => {
                // updateDBFlow({ roadmapId, nodes, edges })
                setDbNodes(nodes)
            }, 500
        ),
        []
    )

    const onConnectEnd = useCallback(
        (event: any, connectionState: any) => {
            // when a connection is dropped on the pane it's not valid
            if (!connectionState.isValid) {
                // we need to remove the wrapper bounds, in order to get the correct position
                const id = nanoid();
                const { clientX, clientY } =
                    'changedTouches' in event ? event.changedTouches[0] : event;
                const newNode: Node = {
                    id,
                    type: "PROJECT",
                    position: screenToFlowPosition({
                        x: clientX,
                        y: clientY,
                    }),
                    data: {
                        id: nanoid(),
                        nodeId: id,
                        type: 'NOTYPE',
                        title: `New Milestone`,
                        status: "PLANNED"
                    },
                    origin: connectionState.fromHandle?.position === 'left' ? [1.0, 0.5] : [0.0, 0.5],
                }

                addNodes([newNode])

                // Handle connection direction based on the dragged handle
                const source = connectionState.fromHandle?.position === "left" 
                    ? id
                    : connectionState.fromNode?.id
            
                const target = connectionState.fromHandle?.position === "left" 
                    ? connectionState.fromNode?.id
                    : id

                // Add the edge
                onConnect({
                    id: `edge-${source}-${target}`,
                    source,
                    target,
                })
            }
        },
        [screenToFlowPosition],
    );

    // Add a empty milestone node
    // if a position is provided, place at the given coordinates
    // if a position is not provided, place in the center
    const addMilestones = async (newMilestones: any[]) => {
        const newNodes: any[] = []

        // get center of viewport: https://stackoverflow.com/questions/76349086/how-can-i-prevent-nodes-from-being-added-outside-the-view-area-in-react-flow
        const {
            height,
            width,
            transform: [transformX, transformY, zoomLevel]
        } = store.getState()

        const zoomMultiplier = 1 / zoomLevel
        let centerX =
            -transformX * zoomMultiplier + (width * zoomMultiplier) / 2
        let centerY =
            -transformY * zoomMultiplier + (height * zoomMultiplier) / 2

        newMilestones.forEach(defaultData => {
            const id = nanoid()
            const newNode: Node = {
                id: id,
                type: defaultData?.nodeType || "PROJECT",
                position: {
                    x: centerX,
                    y: centerY
                },
                origin: [0.0, 0.0],
                data: {
                    id: nanoid(),
                    nodeId: id,
                    type: defaultData?.type || 'NOTYPE',
                    title: defaultData?.title || `New Milestone`,
                    ...(defaultData?.description ? { description: defaultData.description } : undefined),
                    status: defaultData?.status || "PLANNED"
                }
            }

            centerX += 500
            // centerY += 200

            newNodes.push(newNode)
        })

        const nodes = await addNodes(newNodes)
        return nodes
    }

    const handleDelete = async ({nodes, edges}: {nodes: Node[], edges: Edge[]}) => {
        // override default delete behaviour with our custom dialog
        if (nodes.length > 0) {
            setMilestoneData(nodes[0].data)
            setDeleteIsOpen(true)
            return false
        } else {
            return { nodes, edges }
        }
    }

    // add handleEditClick(), handleDelete(), and handleDuplicate() callback functions to nodes in the flow
    // this callback is needed to notify us when the 'Edit Details' button in a node has been clicked, so we can open the sidebar
    const updatedNodes = localNodes.map((node: Node, index: number) => ({
        ...node,
        data: {
            ...milestones.find(milestone => milestone.nodeId === node.id),
            handleEditClick: (nodeId: string) => {
                setSelectedNodeId(nodeId)

                const params = new URLSearchParams(searchParams.toString())
                params.delete("milestone")
                params.set("milestone", nodeId)
        
                // router.push(`${pathname}?${params.toString()}`, { scroll: false })
                router.replace(`${pathname}?${params.toString()}`)
            },
            handleDelete: (nodeId: string) => {
                const nodesList = localNodes.filter(node => node.id === nodeId).map(node => ({...node, data: {...milestones.find(milestone => milestone.nodeId === node.id)}}))
                const edgesList = edges.filter((edge: Edge) => edge.source === nodeId || edge.target === nodeId)

                handleDelete({
                    nodes: nodesList || [],
                    edges: edgesList || []
                })
            },
            handleDuplicate: (nodeId: string) => {
                const milestone = milestones.find(milestone => milestone.nodeId === nodeId)

                if (milestone) {
                    addMilestones([{
                        ...milestone,
                    }])
                }
            },
            // first node is the onboarding node
            onboardingMilestone: index === 0
        }
    }))

    const updatedEdges = localEdges.map((edge: Edge) => ({
        ...edge,
        type: 'DEFAULT'
    }))

    // when the handle is adjusted (width changes) or a node is selected (details panel opens), fit the view
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedNodeId) {
                fitView({ nodes: [{ id: selectedNodeId }], padding: 2 })
            } else {
                fitView({ padding: 2 })
            }
        }, 1) // Delay by a short time to allow layout adjustment

        return () => clearTimeout(timer)
    }, [width, selectedNodeId])

    useEffect(() => {
        if (isNewUser()) {
            // toast("Welcome to your research plan!", {
            //     id: "onborda",
            //     duration: 300000,
            //     description: `Would you like to take a quick tour?`,
            //     action: (
            //         <div className="flex flex-col space-y-2 ml-4">
            //             <Button
            //                 onClick={startOnbordaAndRemoveToast}
            //             >{`Yes please!`}</Button>
            //             <Button
            //                 onClick={() => {
            //                     toast.dismiss()
            //                     setUserAsReturning()
            //                 }}
            //             >
            //                 {`No thanks!`}
            //             </Button>
            //         </div>
            //     )
            // })
            startOnbordaAndRemoveToast()
        }
    }, [localNodes])

    const startOnbordaAndRemoveToast = () => {
        startOnborda('research-plan-tour')
        setUserAsReturning()
        toast.dismiss()
    }

    return (
        <>
        <ReactFlow
            width={width}
            nodes={updatedNodes}
            edges={updatedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectEnd={onConnectEnd}
            onBeforeDelete={handleDelete}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 2 }}
            style={{ width: '100%', height: '100%' }}
            proOptions={proOptions}
            // maxZoom={5}
            // minZoom={0.1}
        >
            <MiniMap
                nodeColor='#757575'
                maskColor='rgb(200, 200, 200, 0.8)' 
            />
            <Controls>
                <Button className="research-plan-tour-step1" onClick={() => setNewMilestoneIsOpen(true)}>Add Milestone</Button>
            </Controls>
        </ReactFlow>
        <Dialog open={newMilestoneIsOpen} onOpenChange={(open: boolean) => {
            if (!open) setSelectedMilestones([])
            setNewMilestoneIsOpen(open)
        }}>
            <DialogContent className="min-w-fit">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Select from a milestone template
                    </DialogTitle>
                    <DialogDescription>
                        {`Templates can help you find inspiration and get started faster. Click on a Milestone Template to add it to your Research Plan.`}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="w-full max-h-[50vh] overflow-visible">
                    <div className="w-full pr-4 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-visible pt-2">
                        {templateMilestones.map((milestoneData, index) => (
                            <MilestoneTemplateCard 
                                key={index}
                                milestoneData={milestoneData}
                                selectedMilestones={selectedMilestones}
                                setSelectedMilestones={setSelectedMilestones}
                            />
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <DialogClose>
                        <Button variant="secondary" type="button">
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => {
                            router.push('/app/research-plan/templates')
                        }}
                    >
                        See all templates
                    </Button>

                    <DialogClose>
                        <Button
                            variant="secondary"
                            type="button"
                            // onClick={handleAddEmptyMilestone}
                            onClick={() => addMilestones([{name: 'New Milestone'}])}
                        >
                            Create empty Milestone
                        </Button>
                    </DialogClose>
                    
                    <DialogClose>
                        <Button
                            disabled={selectedMilestones.length === 0}
                            type="button"
                            onClick={() => {
                                console.log(`add milestones`, selectedMilestones)
                                addMilestones(selectedMilestones)
                            }}
                        >
                            Create selected Milestones
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
        </Dialog>
        </>
    )
}

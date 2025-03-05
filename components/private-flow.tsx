"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    ReactFlow,
    MiniMap,
    Controls,
    useReactFlow,
    useStoreApi,
    applyNodeChanges,
} from "@xyflow/react"
import type { Edge, Node, NodeChange } from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import "@xyflow/react/dist/base.css"

import PrivateMilestoneNode from "@/components/private-milestone-node"
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
import { isOnboarded, setOnboarded} from "@/lib/utils"
import { debounce } from "lodash"
import { CustomEdge } from "./custom-edge"
import { MilestoneTemplateTabs } from "./roadmap-templates"
import { FaPlus } from "react-icons/fa6"

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
    saveState: state.saveState,
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
        saveState,
    } = useRoadmapStore(useShallow(selector))
    const store = useStoreApi()
    const router = useRouter()
    const nodeTypes = { PROJECT: PrivateMilestoneNode, ASSET: PrivateMilestoneNode, RFP: PrivateMilestoneNode }
    const edgeTypes = { DEFAULT: CustomEdge }
    const [milestoneData, setMilestoneData] = useState({})
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [newMilestoneIsOpen, setNewMilestoneIsOpen] = useState(false)
    const { startOnborda } = useOnborda()
    const { screenToFlowPosition, getIntersectingNodes, fitView } = useReactFlow()
    const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])
    const pathname = usePathname()

    useEffect(() => {
        setLocalNodes(nodes.sort((a: any, b: any) => b.createdAt - a.createdAt))
        setLocalEdges(edges)
    }, [nodes, edges])

    const [localNodes, setLocalNodes] = useState(nodes)
    const [localEdges, setLocalEdges] = useState(edges)

    const [previewNode, setPreviewNode] = useState<Node | null>(null);
    const previewNodeRef = useRef(previewNode);
    useEffect(() => {
        previewNodeRef.current = previewNode;
    }, [previewNode]);

    const [startConnectNode, setStartConnectNode] = useState<any | null>(null);

    const PREVIEW_NODE_HEIGHT = 240
    const PREVIEW_NODE_WIDTH = 348

    const handleConnectStart = useCallback((event: any, node: any) => {
        setStartConnectNode(node)
        setPreviewNode({ 
            id: "preview", 
            position: { x: 0, y: 0 }, 
            data: { 
                title: "New Milestone",
                private: true,
                handleType: node.handleType
             }, 
            type: "PROJECT",
        });
      }, [previewNode, startConnectNode]);
    
      const handleMouseMove = useCallback((event: any) => {
        if (startConnectNode) {
            let position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const width = 40

            const intersectingNodes = getIntersectingNodes({
                x: position.x - (width/2),
                y: position.y,
                width: width,
                height: 1
            }).filter(node => node.id !== "preview");

            if (intersectingNodes.length > 0) {
                setPreviewNode(null); // Hide preview if hovering over a node
            } else {
                setPreviewNode({ 
                    id: "preview", 
                    position: {
                        x: previewNodeRef?.current?.data?.handleType === "target" ? position.x - PREVIEW_NODE_WIDTH : position.x,
                        y: previewNodeRef?.current?.data?.handleType === "source" || previewNodeRef?.current?.data?.handleType === "target" ? position.y - (PREVIEW_NODE_HEIGHT/2) : position.y
                    }, 
                    data: { 
                        title: "New Milestone",
                        private: true,
                        handleType: startConnectNode?.handleType
                     }, 
                    type: "PROJECT",
                });
            }
        } else {
            setStartConnectNode(null)
            setPreviewNode(null)
        }
      }, [previewNode, startConnectNode, screenToFlowPosition]);

    const handleEditClick = (event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id)
    }

    const onNodesChange = (changes: NodeChange<Node>[]) => {
        const newNodes = applyNodeChanges(changes, localNodes)
        setLocalNodes(newNodes)

        const validChanges = changes.filter(change => change.type === "position")
        if (validChanges.length > 0) debounceUpdateStore(newNodes) // only change zustand state if the user is updating the node position
    }

    const debounceUpdateStore = useCallback(
        debounce(
            (nodes: Node[]) => {
                setDbNodes(nodes)
            }, 500
        ),
        []
    )

    const onConnectEnd = useCallback(
        (event: any, connectionState: any) => {
            // when a connection is dropped on the pane it's not valid
            if (!connectionState.isValid && previewNodeRef.current) {
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
                        ...previewNodeRef.current.data,
                        id: nanoid(),
                        nodeId: id,
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

            setPreviewNode(null)
            setStartConnectNode(null)
        },
        [previewNode, startConnectNode, screenToFlowPosition],
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
                type: defaultData?.nodeType || defaultData?.node?.type || "PROJECT",
                position: {
                    x: centerX,
                    y: centerY
                },
                origin: [0.0, 0.0],
                data: {
                    id: nanoid(),
                    nodeId: id,
                    types: defaultData?.types || [],
                    title: defaultData?.title || `New Milestone`,
                    ...(defaultData?.description ? { description: defaultData.description } : undefined),
                    status: defaultData?.status || "PLANNED",
                    private: true
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
                setSelectedNodeId(node.id)
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
            // last node is the onboarding node, localNodes are sorted by their creation date
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
                fitView({ nodes: [{ id: selectedNodeId }], padding: 2, duration: 500 })
            } else {
                fitView({ nodes: localNodes.map(node => ({ id: node.id })), padding: 0.4, duration: 500 })
            }
        }, 1) // Delay by a short time to allow layout adjustment

        return () => clearTimeout(timer)
    }, [width, selectedNodeId])

    useEffect(() => {
        // if (!isOnboarded('research-plan-tour')) {
        //     startOnbordaAndRemoveToast()
        // }

        // Only start tour if user is new and is on the /app/research-plan page
        if (pathname === '/app/research-plan' && !isOnboarded('research-plan-tour')) {
            toast("Welcome to Comend!", {
                id: "onborda",
                duration: 300000,
                position: "bottom-left",
                description: `Would you like to take a quick tour?`,
                action: (
                    <div className="flex flex-col space-y-2 ml-4">
                        <Button
                            onClick={() => startOnbordaAndRemoveToast()}
                        >
                            {`Yes please!`}
                        </Button>
                        <Button
                            onClick={() => {
                                toast.dismiss()
                                setOnboarded('research-plan-tour')
                            }}
                        >
                            {`No thanks!`}
                        </Button>
                    </div>
                )
            })
        }
    }, [localNodes])

    const startOnbordaAndRemoveToast = () => {
        setSelectedNodeId(null)
        startOnborda('research-plan-tour')
        setOnboarded('research-plan-tour')
        toast.dismiss()
    }

    return (
        <div className="h-full w-full pb-6" onMouseMove={handleMouseMove}>
        <ReactFlow
            width={width}
            nodes={previewNode ? [...updatedNodes, previewNode] : updatedNodes}
            edges={updatedEdges}
            onNodeClick={handleEditClick}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectEnd={onConnectEnd}
            onConnectStart={handleConnectStart}
            onBeforeDelete={handleDelete}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2, duration: 500 }}
            style={{ width: '100%', height: '100%' }}
            proOptions={proOptions}
            minZoom={0.1}
        >
            <MiniMap
                nodeColor='#757575'
                maskColor='rgb(200, 200, 200, 0.8)' 
            />
            <Controls className="flex flex-col gap-2">
                <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                        router.push('/app/research-plan/templates')
                    }}
                >
                    Browse milestone library
                </Button>
                <Button variant={"cta"} className="research-plan-tour-step1" onClick={() => setNewMilestoneIsOpen(true)}>
                    <FaPlus />
                    Create milestone
                </Button>
            </Controls>
        </ReactFlow>
        <Dialog open={newMilestoneIsOpen} onOpenChange={(open: boolean) => {
            if (!open) setSelectedMilestones([])
            setNewMilestoneIsOpen(open)
        }}>
            <DialogContent className="min-w-[80vw] h-[80vh] w-[80vw] flex flex-col justify-start">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Select from a milestone template
                    </DialogTitle>
                    <DialogDescription>
                        {`Templates can help you find inspiration and get started faster. Click on a Milestone Template to add it to your Research Plan.`}
                    </DialogDescription>
                </DialogHeader>

                {/* <ScrollArea className="w-full max-h-[50vh] overflow-visible">
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
                </ScrollArea> */}

                <MilestoneTemplateTabs 
                    selectedMilestones={selectedMilestones}
                    setSelectedMilestones={setSelectedMilestones}
                    createEmpty={() => addMilestones([{name: 'New Milestone'}])}
                    inDialog={true}
                />

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
                        Browse milestone library
                    </Button>

                    {/* <DialogClose>
                        <Button
                            variant="secondary"
                            type="button"
                            // onClick={handleAddEmptyMilestone}
                            onClick={() => addMilestones([{name: 'New Milestone'}])}
                        >
                            <FaPlus />
                            Create empty milestone
                        </Button>
                    </DialogClose> */}
                    
                    <DialogClose>
                        <Button
                            disabled={selectedMilestones.length === 0}
                            type="button"
                            onClick={() => {
                                console.log(`add milestones`, selectedMilestones)
                                addMilestones(selectedMilestones)
                            }}
                        >
                            <FaPlus />
                            Create selected milestones
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
        </Dialog>
        </div>
    )
}

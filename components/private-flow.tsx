"use client"

import "@xyflow/react/dist/base.css"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    ReactFlow,
    MiniMap,
    Controls,
    useReactFlow,
    applyNodeChanges,
} from "@xyflow/react"
import type { Edge, Node, NodeChange } from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"
import PrivateMilestoneNode from "@/components/private-milestone-node"
import { Button } from "./ui/button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { nanoid } from "nanoid"
import { Dialog } from "./ui/dialog"
import { DeleteMilestoneDialogContent } from "./delete-milestone-dialog-content"
import { usePathname, useRouter } from "next/navigation"
import { useOnborda } from "./onborda/OnbordaContext"
import { toast } from "sonner"
import { isOnboarded, setOnboarded} from "@/lib/utils"
import { debounce } from "lodash"
import { CustomEdge } from "./custom-edge"
import mixpanel from "mixpanel-browser"

const proOptions = { hideAttribution: true }

const selector = (state: RoadmapState) => ({
    selectedNodeIds: state.selectedNodeIds,
    setSelectedNodeIds: state.setSelectedNodeIds,
    milestones: state.milestones,
    nodes: state.nodes,
    setNodes: state.setNodes,
    edges: state.edges,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNodes: state.addNodes,
    addMilestones: state.addMilestones
})

export const PrivateFlowView = ({
    width,
    contextMenuRef,
}: {
    width: number,
    contextMenuRef: React.RefObject<HTMLDivElement>,
}) => {
    const {
        selectedNodeIds,
        setSelectedNodeIds,
        milestones,
        nodes,
        setNodes: setDbNodes,
        edges,
        onEdgesChange,
        addNodes,
        onConnect,
        addMilestones
    } = useRoadmapStore(useShallow(selector))
    const nodeTypes = { PROJECT: PrivateMilestoneNode, ASSET: PrivateMilestoneNode, RFP: PrivateMilestoneNode }
    const edgeTypes = { DEFAULT: CustomEdge }
    const [milestoneData, setMilestoneData] = useState({})
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const { startOnborda } = useOnborda()
    const { screenToFlowPosition, getIntersectingNodes, fitView } = useReactFlow()
    const pathname = usePathname()

    useEffect(() => {
        setLocalNodes(nodes
            .sort((a: any, b: any) => b.createdAt - a.createdAt)
            .map(node => {
                const milestone = milestones.find(m => m.nodeId == node.id)
                return {
                    ...node, 
                    type: milestone?.nodeType || "PROJECT",
                    data: milestone || node.data
                } as Node
            }))
        setLocalEdges(edges)
    }, [nodes, edges, milestones])

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
      }, []);
    
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
      }, [startConnectNode, screenToFlowPosition, getIntersectingNodes]);

    const handleEditClick = (event: React.MouseEvent, node: Node) => {
        if (event.ctrlKey || event.altKey) return
        if (event.metaKey) {
            // if CMD (on mac) or CTRL (on windows) is held, add id to multiselect
            if (node.id && !selectedNodeIds.includes(node.id)) {
                setSelectedNodeIds([...selectedNodeIds, node.id])
            }
        } else {
            // regular click, set selected node id
            if (node.id) {
                setSelectedNodeIds([node.id])
            } else {
                setSelectedNodeIds([])
            }
        }
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

                addNodes([newNode], "Flow Connection")

                // Handle connection direction based on the dragged handle
                const source = connectionState.fromHandle?.position === "left" 
                    ? id
                    : connectionState.fromNode?.id
            
                const target = connectionState.fromHandle?.position === "left" 
                    ? connectionState.fromNode?.id
                    : id

                // Add the edge
                onConnect({
                    source,
                    target,
                    sourceHandle: "",
                    targetHandle: ""
                })
            }

            setPreviewNode(null)
            setStartConnectNode(null)
        },
        [screenToFlowPosition, addNodes, onConnect],
    );

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
            // last node is the onboarding node, localNodes are sorted by their creation date
            onboardingMilestone: index === 0,
            contextMenuRef,
        },
    }))

    const updatedEdges = localEdges.map((edge: Edge) => ({
        ...edge,
        type: 'DEFAULT'
    }))

    // when the handle is adjusted (width changes) or a node is selected (details panel opens), fit the view
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedNodeIds.length === 1) {
                fitView({ nodes: [{ id: selectedNodeIds[0] }], padding: 2, duration: 500 })
            } else {
                fitView({ padding: 0.4, duration: 500 })
            }
        }, 1) // Delay by a short time to allow layout adjustment

        return () => clearTimeout(timer)
    }, [width, selectedNodeIds, fitView])

    useEffect(() => {
        const startOnbordaAndRemoveToast = () => {
            setSelectedNodeIds([])
            startOnborda('research-plan-tour')
            setOnboarded('research-plan-tour')
            toast.dismiss()
        }

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
                            variant="secondary"
                        >
                            {`Yes please!`}
                        </Button>
                        <Button
                            onClick={() => {
                                toast.dismiss()
                                setOnboarded('research-plan-tour')
                            }}
                            variant="ghost"
                        >
                            {`No thanks!`}
                        </Button>
                    </div>
                )
            })
        }
    }, [localNodes, pathname, setSelectedNodeIds, startOnborda])

    return (
        <div className="h-full w-full pb-6" onMouseMove={handleMouseMove}>
        <ReactFlow
            width={width}
            paneClickDistance={1}
            onPaneClick={(e) => {
                if (selectedNodeIds.length > 1) setSelectedNodeIds([])
            }}
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
            <Controls className="flex flex-col gap-2" />
        </ReactFlow>
        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
        </Dialog>
        </div>
    )
}

"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
    ReactFlow,
    MiniMap,
    Controls,
    useReactFlow,
    useStoreApi,
} from "@xyflow/react"
import type { ConnectionState, Edge, FinalConnectionState, Node } from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import "@xyflow/react/dist/base.css"

import PrivateMilestoneNode from "@/components/private-milestone-node"
import { Button } from "./ui/button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { nanoid } from "nanoid"
import { Dialog } from "./ui/dialog"
import { DeleteMilestoneDialogContent } from "./delete-milestone-dialog-content"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useOnborda } from "./onborda/OnbordaContext"
import { toast } from "sonner"
import { isNewUser, setUserAsReturning } from "@/lib/utils"
import { NewMilestoneDialogContent } from "./new-milestone-dialog-content"

const proOptions = { hideAttribution: true }

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
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
        edges,
        onNodesChange,
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
    const nodeTypes = { MILESTONE: PrivateMilestoneNode }
    const [milestoneData, setMilestoneData] = useState({})
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [newMilestoneIsOpen, setNewMilestoneIsOpen] = useState(false)
    const { startOnborda } = useOnborda()
    const { screenToFlowPosition } = useReactFlow()

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
                    type: "MILESTONE",
                    position: screenToFlowPosition({
                        x: clientX,
                        y: clientY,
                    }),
                    data: {
                        id: nanoid(),
                        nodeId: id,
                        type: 'NOTYPE',
                        title: `New Milestone`,
                        status: "TODO"
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
    const addMilestones = (newMilestones: any[]) => {
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
                type: "MILESTONE",
                position: {
                    x: centerX,
                    y: centerY
                },
                data: {
                    id: nanoid(),
                    nodeId: id,
                    type: defaultData?.type || 'NOTYPE',
                    title: defaultData?.title || `New Milestone`,
                    ...(defaultData?.description ? { description: defaultData.description } : undefined),
                    // papers: defaultData?.papers || [],
                    // tasks: defaultData?.tasks || [],
                    status: defaultData?.status || "TODO"
                }
            }

            centerX += 200
            centerY += 200

            newNodes.push(newNode)
        })

        addNodes(newNodes)
        return newNodes
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
    const updatedNodes = nodes.map((node: Node, index: number) => ({
        ...node,
        data: {
            ...milestones.find(milestone => milestone.nodeId === node.id),
            handleEditClick: (nodeId: string) => {
                setSelectedNodeId(nodeId)

                const params = new URLSearchParams(searchParams.toString())
                params.delete("milestone")
                params.set("milestone", nodeId)
        
                router.push(`${pathname}?${params.toString()}`, { scroll: false })
            },
            handleDelete: (nodeId: string) => {
                console.log(`handle delete`, nodeId)
            },
            handleDuplicate: (nodeId: string) => {
                console.log(`handle duplicate`, nodeId)
                addMilestones([{ name: 'New Milestone' }])
            },
            // first node is the onboarding node
            onboardingMilestone: index === 0
        }
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
    }, [nodes])

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
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectEnd={onConnectEnd}
            onBeforeDelete={handleDelete}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 2 }}
            style={{ width: '100%', height: '100%' }}
            proOptions={proOptions}
            
        >
            <MiniMap
                nodeColor='#757575'
                maskColor='rgb(200, 200, 200, 0.8)' 
            />
            <Controls>
                <Button className="research-plan-tour-step1" onClick={() => setNewMilestoneIsOpen(true)}>Add Milestone</Button>
            </Controls>
        </ReactFlow>
        <Dialog open={newMilestoneIsOpen} onOpenChange={setNewMilestoneIsOpen}>
            <NewMilestoneDialogContent addMilestones={addMilestones} />
        </Dialog>
        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
        </Dialog>
        </>
    )
}

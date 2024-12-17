"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
    ReactFlow,
    MiniMap,
    Controls,
    useReactFlow,
    useStoreApi,
    ReactFlowProvider
} from "@xyflow/react"
import type { Edge, Node } from "@xyflow/react"
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
import { FaQuestion } from "react-icons/fa6"
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
    addNode: state.addNode,
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
        addNode,
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

    // Add a empty milestone node
    // if a position is provided, place at the given coordinates
    // if a position is not provided, place in the center
    const addMilestone = (defaultData: any, position?: { x: number; y: number }) => {
        // get center of viewport: https://stackoverflow.com/questions/76349086/how-can-i-prevent-nodes-from-being-added-outside-the-view-area-in-react-flow
        const {
            height,
            width,
            transform: [transformX, transformY, zoomLevel]
        } = store.getState()

        const zoomMultiplier = 1 / zoomLevel
        const centerX =
            -transformX * zoomMultiplier + (width * zoomMultiplier) / 2
        const centerY =
            -transformY * zoomMultiplier + (height * zoomMultiplier) / 2

        const id = nanoid()
        const newNode: Node = {
            id: id,
            type: "MILESTONE",
            position: {
                x: position ? position?.x : centerX,
                y: position ? position?.y : centerY
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

        addNode(newNode)
        return newNode
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

    // add handleEditClick() callback to nodes in the flow
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
            toast("Welcome to your research plan!", {
                id: "onborda",
                duration: 300000,
                description: `Would you like to take a quick tour?`,
                action: (
                    <div className="flex flex-col space-y-2 ml-4">
                        <Button
                            onClick={startOnbordaAndRemoveToast}
                        >{`Yes please!`}</Button>
                        <Button
                            onClick={() => {
                                toast.dismiss()
                                setUserAsReturning()
                            }}
                        >
                            {`No thanks!`}
                        </Button>
                    </div>
                )
            })
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
            onBeforeDelete={handleDelete}
            nodeTypes={nodeTypes}
            fitView
            proOptions={proOptions}
        >
            <MiniMap
                nodeColor='#757575'
                maskColor='rgb(200, 200, 200, 0.8)' 
            />
            <Controls>
                {/* <Button className="research-plan-tour-step1" onClick={() => addMilestone()}>Add Milestone</Button> */}
                <Button className="research-plan-tour-step1" onClick={() => setNewMilestoneIsOpen(true)}>Add Milestone</Button>
            </Controls>
        </ReactFlow>
        <Dialog open={newMilestoneIsOpen} onOpenChange={setNewMilestoneIsOpen}>
            <NewMilestoneDialogContent addMilestone={addMilestone} />
        </Dialog>
        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
        </Dialog>
        </>
    )
}

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

import MilestoneNode from "@/components/milestone-node"
import { Button } from "./ui/button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { nanoid } from "nanoid"
import { Dialog } from "./ui/dialog"
import { DeleteMilestoneDialogContent } from "./delete-milestone-dialog-content"

const proOptions = { hideAttribution: true }

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    setMilestones: state.setMilestones,
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNode: state.addNode,
})

const RoadmapFlowchart = ({
    width,
    initNodes,
    initEdges,
    initMilestones
}: {
    width: number
    initNodes: Node[]
    initEdges: Edge[]
    initMilestones: any[]
}) => {
    const {
        selectedNodeId,
        setSelectedNodeId,
        milestones,
        setMilestones,
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        setNodes,
        setEdges,
        addNode,
        onConnect,
    } = useRoadmapStore(useShallow(selector))
    const { fitView } = useReactFlow()
    const store = useStoreApi()
    // const { undo, redo, clear } = useRoadmapStore.temporal.getState()
    const nodeTypes = { MILESTONE: MilestoneNode }
    const [milestoneData, setMilestoneData] = useState({})
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)

    // Add a empty milestone node
    // if a position is provided, place at the given coordinates
    // if a position is not provided, place in the center
    const addMilestone = (position?: { x: number; y: number }) => {
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
                title: `New Milestone`,
                papers: [],
                // tasks: [],
                status: "TODO"
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
    const updatedNodes = nodes.map((node: Node) => ({
        ...node,
        data: {
            ...milestones.find(milestone => milestone.nodeId === node.id),
            handleEditClick: (nodeId: string) => setSelectedNodeId(nodeId)
        }
    }))

    // when the handle is adjusted (width changes) or a node is selected (details panel opens), fit the view
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedNodeId) {
                fitView({ nodes: [{ id: selectedNodeId }], padding: 1 })
            } else {
                fitView()
            }
        }, 1) // Delay by a short time to allow layout adjustment

        return () => clearTimeout(timer)
    }, [width, selectedNodeId])

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
            <MiniMap />
            <Controls>
                {/* <Button onClick={() => onAddMilestone()}>Add Milestone</Button> */}
                <Button onClick={() => addMilestone()}>Add Milestone</Button>
                {/* <Button onClick={() => undo()}>Undo</Button> */}
            </Controls>
        </ReactFlow>
        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
        </Dialog>
        </>
    )
}

function FlowWithProvider(props: any) {
    return (
        <ReactFlowProvider>
            <RoadmapFlowchart {...props} />
        </ReactFlowProvider>
    )
}

export default FlowWithProvider

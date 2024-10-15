"use client"
import React, { useCallback, useEffect } from 'react'
import {
    ReactFlow,
    MiniMap,
    Controls,
    useReactFlow,
    useStoreApi
} from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'

import '@xyflow/react/dist/base.css'

import MilestoneNode from '@/components/milestone-node'
import { Button } from './ui/button'
import { RoadmapState, useRoadmapStore } from '@/state/roadmap/roadmapStore'
import { nanoid } from 'nanoid'

const proOptions = { hideAttribution: true }

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNode: state.addNode,
});

const RoadmapFlowchart = ({ 
    width
}: { 
    width: number
}) => {
    const { 
        selectedNodeId,
        setSelectedNodeId,
        nodes, 
        edges, 
        onNodesChange, 
        onEdgesChange,
        addNode, 
        onConnect 
    } = useRoadmapStore( useShallow(selector) )
    const { fitView } = useReactFlow() 
    const store = useStoreApi()
    const nodeTypes = { MILESTONE: MilestoneNode }

    // Add a empty milestone node
    // if a position is provided, place at the given coordinates
    // if a position is not provided, place in the center
    const onAddMilestone = useCallback(
        (position?: { x: number, y: number }) => {
            // get center of viewport: https://stackoverflow.com/questions/76349086/how-can-i-prevent-nodes-from-being-added-outside-the-view-area-in-react-flow
            const {
                height,
                width,
                transform: [transformX, transformY, zoomLevel]
            } = store.getState()
            
            const zoomMultiplier = 1 / zoomLevel
            const centerX = -transformX * zoomMultiplier + (width * zoomMultiplier) / 2
            const centerY = -transformY * zoomMultiplier + (height * zoomMultiplier) / 2
        
            // const id = getId()
            const id = nanoid()
            const newNode: Node = {
                id: id,
                type: 'MILESTONE',
                position: {
                    x: position ? position.x : centerX,
                    y: position ? position.y : centerY
                },
                data: {  
                    title: `New Milestone`,
                    description: '',
                    tasks: [],
                    notes: '',
                    status: 'TODO'
                }, 
            }

            addNode(newNode)
            return newNode
        },
        []
    )

    // add handleEditClick() callback to nodes in the flow
    // this callback is needed to notify us when the 'Edit Details' button in a node has been clicked, so we can open the sidebar
    const updatedNodes = nodes.map((node: Node) => ({
        ...node,
        data: { ...node.data, handleEditClick: (nodeId: string) => setSelectedNodeId(nodeId) }
    }))

    // when the handle is adjusted (width changes) or a node is selected (details panel opens), fit the view
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedNodeId) {
                fitView({ nodes: [{ id: selectedNodeId }], padding: 1 })
            } else {
                fitView()
            }
        }, 1); // Delay by a short time to allow layout adjustment
        
        return () => clearTimeout(timer)
    }, [width, selectedNodeId])

    return (
        <ReactFlow
            width={width}
            nodes={updatedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            proOptions={proOptions}
        >
            <MiniMap />
            <Controls>
                <Button onClick={() => onAddMilestone()}>Add Milestone</Button>
            </Controls>
        </ReactFlow>
    )
}

export default RoadmapFlowchart


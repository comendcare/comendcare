"use client"
import React, { useCallback, useEffect } from 'react'
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Controls,
    useReactFlow,
    Position,
    MarkerType,
} from '@xyflow/react'

import '@xyflow/react/dist/base.css'

import MilestoneNode from '@/components/milestone-node'
import { Button } from './ui/button'

const proOptions = { hideAttribution: true }

const RoadmapFlowchart = ({ 
    width, 
    nodes,
    edges,
    onConnect,
    newNode,
    onNodesChange,
    onEdgesChange,
    selectedNodeId, 
    nodeClickCallback 
}: { 
    width: number, 
    nodes: any,
    edges: any,
    onConnect: any,
    newNode: any,
    onNodesChange: any,
    onEdgesChange: any,
    selectedNodeId: string | null, 
    nodeClickCallback: (nodeId: string) => void
}) => {
    const { fitView } = useReactFlow() 
    
    const nodeTypes = {
        milestone: MilestoneNode
    }

    const onNodeClick = (event: any, node: any) => {
        // nodeClickCallback(event, node)
    }

    const handleEditClick = (nodeId: string) => {
        nodeClickCallback(nodeId)
    };

    const updatedNodes = nodes.map((node: any) => ({
        ...node,
        data: { ...node.data, handleEditClick }
    }))

    useEffect(() => {
        if (selectedNodeId) {
            fitView({ nodes: [{ id: selectedNodeId }], padding: 1 })
        } else {
            fitView()
        }
    }, [width, selectedNodeId])

    return (
        <ReactFlow
            width={width}
            nodes={updatedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            // onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={proOptions}
        >
            <MiniMap />
            <Controls>
            <Button onClick={newNode}>Add Node</Button>
            </Controls>
        </ReactFlow>
    )
}

export default RoadmapFlowchart


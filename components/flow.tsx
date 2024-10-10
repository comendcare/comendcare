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
    // newNode,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    selectedNodeId, 
    setSelectedNodeId
}: { 
    width: number, 
    nodes: any,
    edges: any,
    onConnect: any,
    // newNode: any,
    setNodes: any,
    setEdges: any,
    onNodesChange: any,
    onEdgesChange: any,
    selectedNodeId: string | null, 
    setSelectedNodeId: any
}) => {
    const { fitView, screenToFlowPosition } = useReactFlow() 
    
    const nodeTypes = {
        milestone: MilestoneNode
    }

    let id = nodes.length + 1
    const getId = () => `${id++}`

    const onConnectEnd = useCallback(
        (event: any, connectionState: any) => {
            // when a connection is dropped on the pane it's not valid
            if (!connectionState.isValid) {
                // we need to remove the wrapper bounds, in order to get the correct position
                const id = getId()
                const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event
                const newNode = {
                    id,
                    type: 'milestone',
                    position: screenToFlowPosition({
                        x: clientX,
                        y: clientY,
                    }), 
                    data: {  
                        name: `Node ${id}`,
                        description: '',
                        tasks: [],
                        notes: '',
                        status: 'todo'
                    },
                    origin: [0.5, 0.0],
                }

                setNodes((nds: any[]) => nds.concat(newNode))
                setEdges((eds: any[]) =>
                    eds.concat({ id, source: connectionState.fromNode.id, target: id }),
                )
            }
        },
        [screenToFlowPosition]
    );

    const handleEditClick = (nodeId: string) => {
        setSelectedNodeId(nodeId)
    }

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
            onConnectEnd={onConnectEnd}
            nodeTypes={nodeTypes}
            fitView
            proOptions={proOptions}
        >
            <MiniMap />
            <Controls>
            {/* <Button onClick={newNode}>Add Node</Button> */}
            </Controls>
        </ReactFlow>
    )
}

export default RoadmapFlowchart


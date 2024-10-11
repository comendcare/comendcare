"use client"
import React, { useCallback, useEffect } from 'react'
import {
    ReactFlow,
    addEdge,
    MiniMap,
    Controls,
    useReactFlow,
    OnNodesChange,
    OnEdgesChange,
    MarkerType,
    useStoreApi
} from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'

import '@xyflow/react/dist/base.css'

import MilestoneNode from '@/components/milestone-node'
import { Button } from './ui/button'

const proOptions = { hideAttribution: true }

const RoadmapFlowchart = ({ 
    width, 
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    selectedNodeId, 
    setSelectedNodeId
}: { 
    width: number, 
    nodes: Node[],
    edges: Edge[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    onNodesChange: OnNodesChange<Node>,
    onEdgesChange: OnEdgesChange<Edge>,
    selectedNodeId: string | null, 
    setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>
}) => {
    const { fitView, screenToFlowPosition } = useReactFlow() 
    const store = useStoreApi()
    const nodeTypes = { milestone: MilestoneNode }

    let id = nodes.length + 1
    const getId = () => `${id++}`

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
        
            const id = getId()
            const newNode: Node = {
                id,
                type: 'milestone',
                position: {
                    x: position ? position.x : centerX,
                    y: position ? position.y : centerY
                },
                data: {  
                    title: `Milestone ${id}`,
                    description: '',
                    tasks: [],
                    notes: '',
                    status: 'todo'
                }, 
            }

            setNodes((nds: Node[]) => nds.concat(newNode))
            return newNode
        },
        []
    )

    // Add an edge to the state when two nodes are connected
    const onConnect = useCallback(
        (params: any) => setEdges((eds: Edge[]) => addEdge(params, eds)),
        [],
    )

    // Add a node to the state when an edge connection is dropped: https://reactflow.dev/examples/nodes/add-node-on-edge-drop
    const onConnectEnd = useCallback(
        (event: any, connectionState: any) => {
            // when a connection is dropped on the pane it's not valid
            if (!connectionState.isValid) {
                // we need to remove the wrapper bounds, in order to get the correct position
                const id = getId()
                const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event

                onAddMilestone({ x: clientX, y: clientY })
                setEdges((eds: Edge[]) =>
                    eds.concat({ 
                        id, 
                        source: connectionState.fromNode.id, 
                        target: id, 
                        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 } 
                    }),
                )
            }
        },
        [screenToFlowPosition]
    )

    // add handleEditClick() callback to nodes in the flow
    // this callback is needed to notify us when the 'Edit Details' button in a node has been clicked, so we can open the sidebar
    const updatedNodes = nodes.map((node: any) => ({
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
            onConnectEnd={onConnectEnd}
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


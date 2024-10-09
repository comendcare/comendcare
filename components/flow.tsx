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

const initNodes = [
    {
        id: '1',
        type: 'milestone',
        data: { 
            name: 'Basic Science - Disease',
            description: 'Complete the basic science for investigating our disease.',
            tasks: [
                { name: 'Literature search to undersand disease', complete: true }
            ],
            notes: '',
            status: 'done'
        },
        position: { x: 0, y: 0 },
        selected: false,
        selectable: true
    },
    {
        id: '2',
        type: 'milestone',
        data: { 
            name: 'Disease Models',
            description: 'Discover, construct, and phenotype disease models.',
            tasks: [
                { name: 'Identify the best models currently available', complete: true },
                { name: 'Construct Knock-in Mice', complete: true },
                { name: 'Phenotyping of Knock-in Mice', complete: false },
                { name: 'Construct Fibroblasts', complete: true },
                { name: 'Construct iPSCs', complete: true },
                { name: 'Phenotype iPSCs', complete: false }
            ],
            notes: '',
            status: 'inprogress'
        },
        position: { x: 600, y: 0 },
        selected: false,
        selectable: true
    },
    {
        id: '3',
        type: 'milestone',
        data: { 
            name: 'Pre-Clinical Design',
            description: 'Pre-clinical design and production.',
            tasks: [
                { name: 'Construct design', complete: false },
                { name: 'Plasmid production', complete: false },
                { name: 'AAV Production', complete: false},
            ],
            notes: 'Here are some extra notes as an example...',
            status: 'todo'
        },
        position: { x: 1200, y: 0 },
        selected: false,
        selectable: true
    }
]

const initEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }
    },
    {
        id: 'e2-3',
        source: '2',
        target: '3',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }
    },
]

const proOptions = { hideAttribution: true }

const RoadmapFlowchart = ({ width, selectedNodeId, nodeClickCallback }: { width: number, selectedNodeId: string | null, nodeClickCallback: (nodeId: string) => void}) => {
    const { fitView } = useReactFlow() 
    const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)
    
    const nodeTypes = {
        milestone: MilestoneNode
    }

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [],
    )

    const onNodeClick = (event: any, node: any) => {
        // nodeClickCallback(event, node)
    }

    const handleEditClick = (nodeId: string) => {
        nodeClickCallback(nodeId)
    };

    const updatedNodes = nodes.map(node => ({
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

    const newNode = () => {
        const id = (nodes.length + 1).toString()
        const newNode = {
            id,
            type: 'milestone',
            position: { x: 0, y: 400 },
            data: {
                name: `Node ${id}`,
                description: '',
                tasks: [],
                notes: '',
                status: 'todo'
            },
            selected: false,
            selectable: true
          };

          setNodes((nodes) => nodes.concat(newNode))
    }

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


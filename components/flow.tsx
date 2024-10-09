"use client"

import React, { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Controls,
    useOnSelectionChange,
    Panel,
} from '@xyflow/react';

import '@xyflow/react/dist/base.css';

import MilestoneNode from '@/components/milestone-node';
import EditNodePanel from './edit-node';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';

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
        position: { x: 0, y: 50 },
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
        position: { x: 0, y: 350 },
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
        position: { x: 0, y: 850 },
        selected: false,
        selectable: true
    }
];

const initEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
    },
    {
        id: 'e2-3',
        source: '2',
        target: '3',
    },
];

const proOptions = { hideAttribution: true };

const RoadmapFlowchart = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    const selectNodeCallback = (id: string | null) => {
        setSelectedNodeId(id)
    }
    
    const nodeTypes = {
        // custom: { ...MilestoneNode, callback: selectNodeCallback }
        milestone: MilestoneNode
    }

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [],
    )

    const onNodeClick = (event: any, node: any) => {
        console.log(`Node Clicked`)
        setSelectedNodeId(node.id); // Update state with selected node ID
    }

    useEffect(() => { console.log(`Selected node changed: ${selectedNodeId}`) }, [selectedNodeId])

    const selectNode = (nodeId: string) => {
        setSelectedNodeId(nodeId)
    }

    const handlePanelChange = (open: boolean) => {
        console.log(`Open Changed: ${open}`)
        if (!open) setSelectedNodeId(null)
    }

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={proOptions}
        >
            <MiniMap />
            <Controls />
            <Panel position="top-right">
                <Sheet open={selectedNodeId !== null} onOpenChange={handlePanelChange}>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Edit Milestone</SheetTitle>
                            <SheetDescription>
                                here we can edit our milestones - TODO
                            </SheetDescription>
                        </SheetHeader>

                        <p>{`Currently Selected Node: ${selectedNodeId}`}</p>

                        <SheetFooter>
                            <SheetClose asChild>
                                <Button type="submit">Save changes</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </Panel>
        </ReactFlow>
    );
};

export default RoadmapFlowchart;

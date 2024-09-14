import React, {useCallback} from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/base.css';

import CustomNode from "@/components/custom-node";

const nodeTypes = {
    custom: CustomNode,
};

const initNodes = [
    {
        id: '1',
        type: 'custom',
        data: { name: 'Develop therapeutic strategy', emoji: '🧑‍🔬' },
        position: { x: 0, y: 50 },
    },
    {
        id: '2',
        type: 'custom',
        data: { name: 'Select modality:', job: 'ASO', emoji: '🧪' },
        position: { x: -160, y: 300 },  // Node 2 shifted to the left
    },
    {
        id: '3',
        type: 'custom',
        data: { name: 'Select modality:', job: 'AAV', emoji: '⚗️' },
        position: { x: 70, y: 300 },  // Node 3 directly underneath Node 1
    },
    {
        id: '4',
        type: 'custom',
        data: { name: 'Select modality:', job: 'CRISPR', emoji: '🧬' },
        position: { x: 300, y: 300 },  // Node 4 shifted to the right
    },
];

const initEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true
    },
    {
        id: 'e1-3',
        source: '1',
        target: '3',
        animated: true
    },
    {
        id: 'e1-4',
        source: '1',
        target: '4',
        animated: true
    },
];

const proOptions = {hideAttribution: true};

const HeroIllustration = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            preventScrolling
            proOptions={proOptions}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            className="col-span-2 pointer-events-none"
        >
        </ReactFlow>
    );
};

export default HeroIllustration;

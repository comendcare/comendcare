"use client"
import React, { useCallback } from 'react';
import {
    ReactFlow,
    addEdge,
    Node,
    Edge,
    ConnectionLineType,
    Panel,
    useNodesState,
    useEdgesState, EdgeTypes,
} from '@xyflow/react';
import dagre from 'dagre';

import '@xyflow/react/dist/style.css';
import CustomEdge from "@/components/CustomEdge";

// const initialNodes: Node[] = [
//     { id: '1', data: { label: 'Is the mutation loss-of-function?' }, position: { x: 0, y: 0 } },
//     { id: '2', data: { label: 'Consider gene replacement therapies.' }, position: { x: 0, y: 200 } },
//     { id: '3', data: { label: 'Consider gain-of-function or dominant-negative strategies.' }, position: { x: 600, y: 200 } },
//     { id: '4', data: { label: 'Is long-term expression required?' }, position: { x: 0, y: 400 } },
//     { id: '5', data: { label: 'AAV may be suitable due to its ability to provide long-term expression.' }, position: { x: 0, y: 600 } },
//     { id: '6', data: { label: 'Consider ASO or mRNA therapies.' }, position: { x: 600, y: 600 } },
//     { id: '7', data: { label: 'Is the mutation gain-of-function or dominant-negative?' }, position: { x: 600, y: 400 } },
//     { id: '8', data: { label: 'Gain-of-function: Consider gene editing approaches (e.g., CRISPR/Cas9) to specifically correct or knock out the harmful gene variant.' }, position: { x: 600, y: 800 } },
//     { id: '9', data: { label: 'Dominant-negative: Consider RNA-based therapies like RNA interference (RNAi) or ASOs to reduce the expression of the harmful protein.' }, position: { x: 1200, y: 800 } },
//     { id: '10', data: { label: 'Is the target tissue the Central Nervous System (CNS)?' }, position: { x: 0, y: 800 } },
//     { id: '11', data: { label: 'AAV vectors with CNS tropism (e.g., AAV9) are suitable for efficient delivery across the blood-brain barrier.' }, position: { x: 0, y: 1000 } },
//     { id: '12', data: { label: 'Consider other AAV serotypes or gene delivery systems specific to the target tissue.' }, position: { x: 600, y: 1000 } },
//     { id: '13', data: { label: 'Is periodic dosing feasible and effective for the condition?' }, position: { x: 0, y: 1200 } },
//     { id: '14', data: { label: 'ASO therapies can be administered periodically and are particularly useful for splicing modulation or knockdown of harmful transcripts.' }, position: { x: 0, y: 1400 } },
//     { id: '15', data: { label: 'Consider long-term gene therapy or one-time gene editing approaches.' }, position: { x: 600, y: 1400 } },
//     { id: '16', data: { label: 'Is precise gene correction required?' }, position: { x: 0, y: 1600 } },
//     { id: '17', data: { label: 'CRISPR/Cas9 or base editing techniques can be employed to correct the specific mutation at the DNA level.' }, position: { x: 0, y: 1800 } },
//     { id: '18', data: { label: 'Consider knockdown approaches or gene silencing methods.' }, position: { x: 600, y: 1800 } },
//     { id: '19', data: { label: 'Can the harmful protein be knocked down without affecting essential functions?' }, position: { x: 0, y: 2000 } },
//     { id: '20', data: { label: 'RNAi or ASO can be employed to reduce the harmful protein’s expression.' }, position: { x: 0, y: 2200 } },
//     { id: '21', data: { label: 'Consider alternative gene-editing strategies or allele-specific interventions.' }, position: { x: 600, y: 2200 } },
// ]
//
// const initialEdges: Edge[] = [
//     { id: 'e1-2', source: '1', target: '2', type: 'custom', data: { label: 'Yes' } },
//     { id: 'e1-3', source: '1', target: '3', type: 'custom', data: { label: 'No' } },
//     { id: 'e2-4', source: '2', target: '4', type: 'custom', data: { label: 'Yes' } },
//     { id: 'e3-7', source: '3', target: '7', type: 'custom', data: { label: 'Yes' } },
//     { id: 'e4-5', source: '4', target: '5', type: 'custom', data: { label: 'Yes' } },
//     { id: 'e4-6', source: '4', target: '6', type: 'custom', data: { label: 'No' } },
//     { id: 'e7-8', source: '7', target: '8', type: 'custom', data: { label: 'Gain-of-function' } },
//     { id: 'e7-9', source: '7', target: '9', type: 'custom', data: { label: 'Dominant-negative' } },
//     { id: 'e5-10', source: '5', target: '10', type: 'custom', data: { label: 'Yes' } },
//     { id: 'e10-11', source: '10', target: '11', type: 'custom', data: { label: 'Yes' } },
//     { id: 'e10-12', source: '10', target: '12', type: 'custom', data: { label: 'No' } },
//     { id: 'e13-14', source: '13', target: '14', type: 'custom', data: { label: 'Yes' } },
//     { id: 'e13-15', source: '13', target: '15', type: 'custom', data: { label: 'No' } },
//     { id: 'e16-17', source: '16', target: '17', type: 'custom', data: { label: 'Yes' } },
//     { id: 'e16-18', source: '16', target: '18', type: 'custom', data: { label: 'No' } },
//     { id: 'e19-20', source: '19', target: '20', type: 'custom', data: { label: 'Yes' } },
// ];

const initialNodes = [
    { id: '1', data: { label: 'Determine outcome measures' }, position: { x: 0, y: 0 } },
    { id: '2', data: { label: 'Create mouse model' }, position: { x: 0, y: 200 } },
    { id: '3', data: { label: 'Open source research bank' }, position: { x: 0, y: 400 } },
    { id: '4', data: { label: 'Identify biomarkers' }, position: { x: 0, y: 600 } },
    { id: '5', data: { label: 'Develop in vitro assays' }, position: { x: 0, y: 800 } },
    { id: '6', data: { label: 'Perform high-throughput screening' }, position: { x: 0, y: 1000 } },
    { id: '7', data: { label: 'Identify lead compounds' }, position: { x: 0, y: 1200 } },
    { id: '8', data: { label: 'Evaluate preclinical efficacy' }, position: { x: 0, y: 1400 } },
    { id: '9', data: { label: 'Optimize lead compounds' }, position: { x: 0, y: 1600 } },
    { id: '10', data: { label: 'Develop therapeutic strategy' }, position: { x: 0, y: 1800 } },
    { id: '11', data: { label: 'Select modality: AAV' }, position: { x: 200, y: 2000 } },
    { id: '12', data: { label: 'Select modality: ASO' }, position: { x: 0, y: 2000 } },
    { id: '13', data: { label: 'Select modality: CRISPR' }, position: { x: -200, y: 2000 } },
    { id: '14', data: { label: 'Preclinical testing (AAV)' }, position: { x: 200, y: 2200 } },
    { id: '15', data: { label: 'Preclinical testing (ASO)' }, position: { x: 0, y: 2200 } },
    { id: '16', data: { label: 'Preclinical testing (CRISPR)' }, position: { x: -200, y: 2200 } },
    { id: '17', data: { label: 'Clinical trials (AAV)' }, position: { x: 200, y: 2400 } },
    { id: '18', data: { label: 'Clinical trials (ASO)' }, position: { x: 0, y: 2400 } },
    { id: '19', data: { label: 'Clinical trials (CRISPR)' }, position: { x: -200, y: 2400 } }
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
    { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
    { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
    { id: 'e4-5', source: '4', target: '5', type: 'smoothstep' },
    { id: 'e5-6', source: '5', target: '6', type: 'smoothstep' },
    { id: 'e6-7', source: '6', target: '7', type: 'smoothstep' },
    { id: 'e7-8', source: '7', target: '8', type: 'smoothstep' },
    { id: 'e8-9', source: '8', target: '9', type: 'smoothstep' },
    { id: 'e9-10', source: '9', target: '10', type: 'smoothstep' },
    { id: 'e10-11', source: '10', target: '11', type: 'smoothstep' },
    { id: 'e10-12', source: '10', target: '12', type: 'smoothstep' },
    { id: 'e10-13', source: '10', target: '13', type: 'smoothstep' },
    { id: 'e11-14', source: '11', target: '14', type: 'smoothstep' },
    { id: 'e12-15', source: '12', target: '15', type: 'smoothstep' },
    { id: 'e13-16', source: '13', target: '16', type: 'smoothstep' },
    { id: 'e14-17', source: '14', target: '17', type: 'smoothstep' },
    { id: 'e15-18', source: '15', target: '18', type: 'smoothstep' },
    { id: 'e16-19', source: '16', target: '19', type: 'smoothstep' }
];

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node: Node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge: Edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const newNode = {
            ...node,
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };

        return newNode;
    });

    return { nodes: newNodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges,
);

const Playground = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes as any);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    const onConnect = useCallback(
        (params: any) =>
            setEdges((eds) =>
                addEdge(
                    { ...params, type: ConnectionLineType.SmoothStep, animated: true, data: { label: 'New Connection' } },
                    eds,
                ),
            ),
        [],
    );

    const onLayout = useCallback(
        (direction: string) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } =
                getLayoutedElements(nodes, edges, direction);

            setNodes([...layoutedNodes as any]);
            setEdges([...layoutedEdges]);
        },
        [nodes, edges],
    );

    const edgeTypes: EdgeTypes = {
        custom: CustomEdge,
    }

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
        >
            <Panel position="top-right">
                <button onClick={() => onLayout('TB')}>vertical layout</button>
                <button onClick={() => onLayout('LR')}>horizontal layout</button>
            </Panel>
        </ReactFlow>
    );
};

export default Playground
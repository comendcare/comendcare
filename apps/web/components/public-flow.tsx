"use client"

import React, { useEffect, useState } from "react"
import {
    ReactFlow,
    MiniMap,
    useReactFlow,
    Background,
    BackgroundVariant,
    applyNodeChanges,
    NodeChange,
    Node,
    Controls,
} from "@xyflow/react"
import "@xyflow/react/dist/base.css"
import { MemoPublicMilestoneNodeButton, MemoPublicMilestoneNodeLink } from "./milestone-node"
import { Milestone } from "@prisma/client"

export const PublicFlowView = ({ 
    roadmap, 
    subdomain, 
    urlMilestone, 
    setUrlMilestone, 
    externalLinks 
}: { 
    roadmap: any, 
    subdomain: string | undefined, 
    urlMilestone: string | undefined, 
    setUrlMilestone?: (id: string) => void | undefined,
    externalLinks: boolean 
}) => {
    const nodeTypes = { 
        PROJECT: externalLinks ? MemoPublicMilestoneNodeLink: MemoPublicMilestoneNodeButton, 
        ASSET: externalLinks ? MemoPublicMilestoneNodeLink: MemoPublicMilestoneNodeButton, 
        RFP: externalLinks ? MemoPublicMilestoneNodeLink: MemoPublicMilestoneNodeButton
    }
    const { fitView } = useReactFlow()
    const [localNodes, setLocalNodes] = useState(roadmap.nodes)

    useEffect(() => {
        setLocalNodes(roadmap.nodes
            .sort((a: any, b: any) => b.createdAt - a.createdAt)
            .map((node: any) => {
                const milestone = roadmap.milestones.find((m: any) => m.nodeId == node.id)
                return {
                    ...node, 
                    type: milestone?.nodeType || "PROJECT",
                    data: milestone || node.data
                } as Node
            }))
        // setLocalEdges(edges)
    }, [roadmap.nodes])

    useEffect(() => {
        if (urlMilestone && roadmap?.nodes) {
            const timer = setTimeout(() => {
                fitView({
                    nodes: roadmap?.nodes?.filter((node: any) => node?.data?.id == urlMilestone).map((node: any) => ({ id: node.id })),
                    padding: 2,
                    duration: 500
                })
            }, 1) // Delay by a short time to allow landing adjustment
    
            return () => clearTimeout(timer)
        }
    }, [urlMilestone])

    useEffect(() => {
        // if there is no milestone selected use the following logic for default zoom
        // zoom to furthest left project
        if (!urlMilestone && roadmap.nodes && roadmap.nodes.length > 0) {
            const timer = setTimeout(() => {
                fitView({
                    nodes: [roadmap?.nodes
                        .sort((a: any, b: any) => (a.positionX) - (b.positionX))[0]],
                    padding: 2,
                    duration: 500
                })
            }, 1) // Delay by a short time to allow landing adjustment
    
            return () => clearTimeout(timer)
        }
    }, [])

    const onNodesChange = (changes: NodeChange<Node>[]) => {
        const newNodes = applyNodeChanges(changes, localNodes)
        setLocalNodes(newNodes)
    }

    const updatedNodes = localNodes.map((node: any, index: number) => ({
        ...node,
        position: {
            x: node.positionX,
            y: node.positionY
        },
        type: "PROJECT",
        data: {
            ...roadmap.milestones.find((milestone: any) => milestone.nodeId === node.id),
            subdomain: subdomain,
            focused: urlMilestone === node?.data?.id,
            externalLink: externalLinks,
            isPublic: true,
            setUrlMilestone: setUrlMilestone
        },
    }))

    const gridSize = 15

    return (
        <ReactFlow
            width={80}
            nodes={updatedNodes}
            edges={roadmap?.edges.map((edge: any) => ({
                ...edge,
                type: 'DEFAULT'
            })) || []}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            proOptions={{ hideAttribution: true }}
            edgesReconnectable={false}
            edgesFocusable={false}
            nodesDraggable={false}
            nodesConnectable={false}
            draggable={false}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}

            paneClickDistance={1}
            snapToGrid={true}
            snapGrid={[gridSize, gridSize]}
            style={{ width: '100%', height: '100%' }}
        >
            <Background variant={BackgroundVariant.Dots} />
            <Controls className="flex flex-col gap-2" />
            <MiniMap
                nodeColor='#757575'
                maskColor='rgb(200, 200, 200, 0.8)' 
            />
        </ReactFlow>
    )
}


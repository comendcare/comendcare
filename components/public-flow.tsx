"use client"

import React, { useEffect } from "react"
import {
    ReactFlow,
    MiniMap,
    useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/base.css"
import {MemoPublicMilestoneNodeLink, MemoPublicMilestoneNodeButton} from "./public-milestone-node"

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

    console.log(roadmap)

    useEffect(() => {
        if (urlMilestone && roadmap?.nodes) {
            const timer = setTimeout(() => {
                fitView({
                    nodes: roadmap?.nodes?.filter((node: any) => node?.data?.id == urlMilestone).map((node: any) => ({ id: node.id })),
                    padding: 2,
                    duration: 500
                })
            }, 1) // Delay by a short time to allow layout adjustment
    
            return () => clearTimeout(timer)
        }
    }, [urlMilestone])

    return (
    <ReactFlow
        width={80}
        nodes={roadmap?.nodes.map((node: any) => ({
            ...node, 
            position: {x: node.positionX, y: node.positionY}, 
            type: node.data.nodeType,
            data: {
                ...node.data,
                subdomain: subdomain,
                focused: urlMilestone === node?.data?.id,
                externalLink: externalLinks,
                setUrlMilestone: setUrlMilestone
            }
        })) || []}
        edges={roadmap?.edges || []}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        edgesReconnectable={false}
        edgesFocusable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        draggable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
    >
        {/* <MiniMap
            nodeColor='#757575'
            maskColor='rgb(200, 200, 200, 0.8)' 
        /> */}
    </ReactFlow>
    )
}


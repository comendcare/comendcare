"use client"

import React from "react"
import {
    ReactFlow,
    MiniMap,
} from "@xyflow/react"
import "@xyflow/react/dist/base.css"
import PublicMilestoneNode from "./public-milestone-node"

export const PublicFlowView = ({ roadmap, subdomain }: { roadmap: any, subdomain: string | undefined }) => {
    const nodeTypes = { MILESTONE: PublicMilestoneNode }

    return (
    <ReactFlow
        width={32}
        nodes={roadmap?.nodes.map((node: any) => ({
            ...node, 
            position: {x: node.positionX, y: node.positionY}, 
            data: {
                ...node.data,
                subdomain: subdomain
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
    >
        <MiniMap
            nodeColor='#757575'
            maskColor='rgb(200, 200, 200, 0.8)' 
        />
    </ReactFlow>
    )
}

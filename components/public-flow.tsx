"use client"

import React from "react"
import {
    ReactFlow,
    MiniMap,
} from "@xyflow/react"
import "@xyflow/react/dist/base.css"
import PublicMilestoneNode from "./public-milestone-node"

export const PublicFlowView = ({ roadmap }: { roadmap: any}) => {
    const nodeTypes = { MILESTONE: PublicMilestoneNode }

    return (
    <ReactFlow
        width={32}
        nodes={
            roadmap?.nodes
                .filter((node: any) => node.data.private == false)
                .map((node: any) => ({...node, position: {x: node.positionX, y: node.positionY}})) || []
        }
        edges={roadmap?.edges || []}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        edgesReconnectable={false}
        edgesFocusable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        draggable={false}
        elementsSelectable={false}
        fitView
    >
        <MiniMap />
    </ReactFlow>
    )
}

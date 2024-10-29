import { NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Adjust the path to your Prisma client

export async function POST(request: Request) {
    try {
        // const { nodes, edges, milestones } = await request.json()
        const { roadmapId, nodes, edges } = await request.json()

        if (!roadmapId) throw new Error('No roadmapId provided.')
        // console.log(`nodes:`, nodes)
        // console.log(`milestones:`, milestones)
        // console.log(`edges:`, edges)

        // Delete any nodes that are not in the request
        const nodeIds = nodes.map((node: any) => node.id)
        const nodesInDB = await prisma.node.findMany({ select: { id: true } })
        const nodeIdsInDB = (nodesInDB || []).map((node: any) => node.id)
        const nodesToDelete = nodeIdsInDB.filter(
            (id: string) => !nodeIds.includes(id)
        )

        await prisma.node.deleteMany({
            where: {
                id: { in: nodesToDelete }
            }
        })

        await prisma.edge.deleteMany()

        // Save or update nodes
        await Promise.all(
            nodes.map(async (node: any) => {
                await prisma.node.upsert({
                    where: { id: node.id },
                    update: {
                        positionX: node.position?.x,
                        positionY: node.position?.y
                    },
                    create: {
                        id: node.id,
                        roadmap: {
                            connect: { id: roadmapId }
                        },
                        type: node.type,
                        positionX: node.position?.x,
                        positionY: node.position?.y,
                        data: {
                            create: {
                                id: node.data?.id,
                                roadmap: {
                                    connect: { id: roadmapId }
                                },
                                title: node.data?.title || "New Milestone",
                                status: node.data?.status || "TODO",
                            }
                        }
                    }
                })
            })
        )

        // Save or update edges
        await Promise.all(
            edges.map(async (edge: any) => {
                await prisma.edge.upsert({
                    where: { id: edge.id },
                    update: {
                        source: edge.source,
                        target: edge.target
                    },
                    create: {
                        id: edge.id,
                        roadmap: {
                            connect: { id: roadmapId }
                        },
                        source: edge.source,
                        target: edge.target,
                    }
                })
            })
        )

        return NextResponse.json(
            { message: "Flow saved successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error(`Error: `, error)
        return NextResponse.json(
            { error: "Failed to save flow" },
            { status: 500 }
        )
    }
}

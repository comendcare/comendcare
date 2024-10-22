import { NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Adjust the path to your Prisma client

export async function POST(request: Request) {
    try {
        const { nodes, edges, milestones } = await request.json()

        // console.log(`nodes:`, nodes)
        // console.log(`milestones:`, milestones)

        // Delete any nodes that are not in the request
        const nodeIds = nodes.map((node: any) => node.id)
        const nodesInDB = await prisma.node.findMany({ select: { id: true } })
        const nodeIdsInDB = nodesInDB.map((node: any) => node.id)
        const nodesToDelete = nodeIdsInDB.filter(
            (id: string) => !nodeIds.includes(id)
        )

        await prisma.node.deleteMany({
            where: {
                id: { in: nodesToDelete }
            }
        })

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
                        type: node.type,
                        positionX: node.position?.x,
                        positionY: node.position?.y,
                        data: {
                            create: {
                                title: node.data?.title || "New Milestone",
                                status: node.data?.status || "TODO"
                            }
                        }
                    }
                })
            })
        )

        await Promise.all(
            milestones.map(async (milestone: any) => {
                await prisma.milestone.update({
                    where: { nodeId: milestone.nodeId },
                    // include: { tasks: true },
                    data: {
                        title: milestone.title,
                        description: milestone.description,
                        timelineMonth: milestone.timelineMonth,
                        timelineYear: milestone.timelineYear,
                        budget: milestone.budget,
                        papers: milestone.papers,
                        // notes: milestone.notes,
                        // tasks: {
                        //   deleteMany: {},
                        //   createMany: {
                        //     data: milestone.tasks?.map((task: any) => ({
                        //         name: task?.name,
                        //         complete: task?.complete,
                        //     }))
                        //   }
                        // },
                        status: milestone.status || "TODO"
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
                        source: edge.source,
                        target: edge.target
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

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Adjust the path to your Prisma client

export async function POST(request: Request) {
    try {
        // const { nodes, edges, milestones } = await request.json()
        const { nodes, edges } = await request.json()

        // console.log(`nodes:`, nodes)
        // console.log(`milestones:`, milestones)
        // console.log(`edges:`, edges)

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

        // await Promise.all(
        //     milestones.map(async (milestone: any) => {
        //         const previousMilestone = await prisma.milestone.findUnique({
        //             where: { id: milestone.id },
        //             include: { tasks: true }
        //         })

        //         const previousTasks = previousMilestone?.tasks || []
        //         const tasksToDelete = previousTasks.filter((task) => !milestone.tasks.map((t: any) => t.id).includes(task.id))
        //         const tasksToUpdate = milestone.tasks?.filter((task: any) => previousMilestone?.tasks.map((t: any) => t.id).includes(task.id))
        //         const tasksToCreate = milestone.tasks.filter((task: any) => !previousMilestone?.tasks.map((t: any) => t.id).includes(task.id))

        //         // console.log(`tasks to delete`, tasksToDelete)
        //         // console.log(`tasks to update`, tasksToUpdate)
        //         // console.log(`tasks to create`, tasksToCreate)

        //         await prisma.milestone.update({
        //             where: { nodeId: milestone.nodeId },
        //             include: { tasks: true },
        //             data: {
        //                 title: milestone.title,
        //                 description: milestone.description,
        //                 timelineMonth: milestone.timelineMonth,
        //                 timelineYear: milestone.timelineYear,
        //                 budget: milestone.budget,
        //                 papers: milestone.papers,
        //                 tasks: {
        //                     deleteMany: tasksToDelete.map(task => ({ id: task.id })),
        //                     createMany: {
        //                         data: tasksToCreate.map((task: any) => ({
        //                             name: task?.name || "New Task",
        //                             status: task?.status || "TODO",
        //                         }))
        //                     }
        //                 },
        //                 status: milestone.status || "TODO"
        //             }
        //         })

        //         for (let i = 0; i < tasksToUpdate.length; i++) {
        //             const task = tasksToUpdate[i]
        //             await prisma.task.update({
        //                 where: { id: task.id },
        //                 data: {
        //                     name: task.name,
        //                     status: task.status
        //                 }
        //             })
        //         }
        //     })
        // )

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

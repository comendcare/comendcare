import { NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Adjust the path to your Prisma client
import { nanoid } from "nanoid"

export async function POST(request: Request) {
    try {
        const { milestones } = await request.json()

        await Promise.all(
            milestones.map(async (milestone: any) => {
                const previousMilestone = await prisma.milestone.findUnique({
                    // where: { nodeId: milestone.nodeId },
                    where: { id: milestone.id },
                    include: { 
                        papers: true, 
                        asset: {
                            include: { contacts: true, attachments: true }
                        },
                        RFP: {
                            include: { contacts: true, attachments: true }
                        },
                        tasks: true 
                    }
                })
                  
                if (!previousMilestone) {
                    // milestone doesn't exist, throw error
                    throw new Error(`Milestone (${milestone.title}) with ID ${milestone.id} does not exist.`);
                }

                const previousTasks = previousMilestone?.tasks || []
                const tasksToDelete = previousTasks.filter((task) => !milestone.tasks.map((t: any) => t.id).includes(task.id))
                const tasksToUpdate = milestone.tasks?.filter((task: any) => previousMilestone?.tasks.map((t: any) => t.id).includes(task.id))
                const tasksToCreate = milestone.tasks.filter((task: any) => !previousMilestone?.tasks.map((t: any) => t.id).includes(task.id))

                console.log(`tasks to delete`, tasksToDelete)
                console.log(`tasks to update`, tasksToUpdate)
                console.log(`tasks to create`, tasksToCreate)

                await prisma.milestone.update({
                    // where: { nodeId: milestone.nodeId },
                    where: { id: milestone.id },
                    include: { 
                        papers: true, 
                        asset: {
                            include: { contacts: true, attachments: true }
                        },
                        RFP: {
                            include: { contacts: true, attachments: true }
                        },
                        tasks: true 
                    },
                    data: {
                        title: milestone.title,
                        type: milestone.type,
                        description: milestone.description,
                        startDate: milestone.startDate,
                        endDate: milestone.endDate,
                        budget: milestone.budget,
                        papers:{
                            deleteMany: {}, // hmmm :(, what's the proper way to do this? upsertMany doesn't exist
                            createMany: {
                                data: milestone.papers.map((paper: any) => ({
                                    link: paper.link,
                                    ...(paper.name ? { name: paper.name } : undefined)
                                }))
                            }
                        },
                        tasks: {
                            deleteMany: tasksToDelete
                                .filter((task: any) => task.id !== null && task.id !== undefined)
                                .map(task => ({ id: task.id })),
                            createMany: {
                                data: tasksToCreate
                                    .filter((task: any) => task.id !== undefined && task.id !== undefined)
                                    .map((task: any) => ({
                                        id: task?.id || nanoid(),
                                        name: task?.name || "New Task",
                                        status: task?.status || "TODO",
                                        orderPosition: task.orderPosition || 0,
                                        kanbanPosition: task.kanbanPosition || 0,
                                    }))
                            }
                        },
                        status: milestone.status || "TODO",
                        private: milestone.private || false
                    }
                })

                for (let i = 0; i < tasksToUpdate.length; i++) {
                    const task = tasksToUpdate[i]
                    await prisma.task.update({
                        where: { id: task.id },
                        data: {
                            name: task.name,
                            status: task.status,
                            orderPosition: task.orderPosition || 0
                        }
                    })
                }
            })
        )

        return NextResponse.json(
            { message: "Milestones updated successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error(`Error: `, error)
        return NextResponse.json(
            { error: "Failed to update milestones" },
            { status: 500 }
        )
    }
}

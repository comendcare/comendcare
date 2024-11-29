import { NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Adjust the path to your Prisma client
import { nanoid } from "nanoid"
import { Prisma } from "@prisma/client"

type MilestoneType = Prisma.MilestoneGetPayload<{
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
}>

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
                        papers: {
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
                        private: milestone.private || false,
                    }
                })

                updateAssets(previousMilestone, milestone)

                updateRFP(previousMilestone, milestone)

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

async function updateAssets(previousMilestone: MilestoneType, milestone: MilestoneType) {
    if (milestone.asset) {
        await prisma.milestone.update({
            where: { id: milestone.id },
            include: { 
                asset: { include: { contacts: true, attachments: true } }
            },
            data: {
                asset: {
                    upsert: {
                        create: {
                            name: milestone.asset.name
                        },
                        update: {
                            name: milestone.asset.name,
                            description: milestone.asset.description,
                            contacts: {
                                deleteMany: {},  // clear all existing contacts
                                createMany: {
                                    data: milestone.asset.contacts.map((contact: any) => ({
                                        name: contact.name,
                                        role: contact.role,
                                        email: contact.email
                                    }))
                                }
                            },
                            attachments: {
                                deleteMany: {}, // clear all existing attachments
                                createMany: {
                                    data: milestone.asset.attachments.map((attachment: any) => ({
                                        link: attachment.link,
                                        name: attachment.name
                                    }))
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    if (!milestone.asset && previousMilestone.asset) {
        await prisma.milestone.update({
            where: { id: milestone.id },
            include: { 
                asset: { include: { contacts: true, attachments: true } }
            },
            data: {
                asset: { delete: true }
            }
        })
    }
}

async function updateRFP(previousMilestone: MilestoneType, milestone: MilestoneType) {
    if (milestone.RFP) {
        await prisma.milestone.update({
            where: { id: milestone.id },
            include: { 
                RFP: { include: { contacts: true, attachments: true } },
            },
            data: {
                RFP: {
                    upsert: {
                        create: {
                            name: milestone.RFP.name,
                            funding: milestone.RFP.funding,
                            researchFocus: milestone.type,
                            openTo: milestone.RFP.openTo
                        },
                        update: {
                            name: milestone.RFP.name,
                            funding: milestone.RFP.funding,
                            description: milestone.RFP.description,
                            contacts: {
                                deleteMany: {}, // clear all existing contacts
                                createMany: {
                                    data: milestone.RFP.contacts.map((contact: any) => ({
                                        name: contact.name,
                                        role: contact.role,
                                        email: contact.email
                                    }))
                                }
                            },
                            attachments: {
                                deleteMany: {}, // clear all existing attachments
                                createMany: {
                                    data: milestone.RFP.attachments.map((attachment: any) => ({
                                        link: attachment.link,
                                        name: attachment.name
                                    }))
                                }
                            },
                            researchFocus: milestone.type,
                            openTo: milestone.RFP.openTo,
                            startDate: milestone.RFP.startDate,
                            endDate: milestone.RFP.endDate
                        }
                    }
                }
            }
        })
    }

    if (!milestone.RFP && previousMilestone.RFP) {
        await prisma.milestone.update({
            where: { id: milestone.id },
            include: { 
                RFP: { include: { contacts: true, attachments: true } },
            },
            data: {
                RFP: { delete: true }
            }
        })
    }
}
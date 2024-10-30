import { NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Adjust the path to your Prisma client

export async function POST(request: Request) {
    try {
        const { tasks } = await request.json()

        // console.log(`tasks:`, tasks)

        await Promise.all(
            tasks.map(async (task: any) => {
                await prisma.task.update({
                    where: { id: task.id },
                    data: {
                        name: task.name,
                        status: task.status,
                        description: task.description,
                        orderPosition: task.orderPosition,
                        kanbanPosition: task.kanbanPosition,
                        checklist: {
                            deleteMany: {},
                            createMany: {
                                data: (task.checklist || []).map((item: any) => ({
                                    name: item?.name || "New Item",
                                    complete: item?.complete || false,
                                    orderPosition: item?.orderPosition
                                }))
                            }
                        }
                    }
                })
            })
        )

        return NextResponse.json(
            { message: "Tasks updated successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error(`Error: `, error)
        return NextResponse.json(
            { error: "Failed to update task" },
            { status: 500 }
        )
    }
}

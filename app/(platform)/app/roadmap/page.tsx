import { Roadmap } from "@/components/roadmap"
import prisma from "@/lib/prisma"
import type { Node, Edge } from "@xyflow/react"

export default async function RoadmapPage() {
    const dbNodes = await Promise.all(
        (await prisma.node.findMany({
            include: { data: true }
        })).map(async (node) => {
            const { id, type, data, positionX, positionY } = node
    
            const milestone = await prisma.milestone.findUnique({
                where: { id: data?.id },
                include: { tasks: true }
            })
    
            return {
                id,
                type,
                data: {
                    title: milestone?.title,
                    description: milestone?.description,
                    notes: milestone?.notes,
                    status: milestone?.status,
                    tasks: milestone?.tasks.map(task => ({
                        name: task.name,
                        complete: task.complete
                    }))
                },
                position: {
                    x: positionX,
                    y: positionY
                }
            }
        })
    )

    const dbEdges = await Promise.all(
        (await prisma.edge.findMany()).map(async (edge) => {
            const { id, source, target } = edge
    
            return {
                id,
                source,
                target
            }
        })
    )

    const milestones = await prisma.milestone.findMany()

    return (
        <main className="flex flex-col items-center w-screen h-screen mx-auto">
            <Roadmap initNodes={dbNodes || []} initEdges={dbEdges || []}/>
        </main>
    )
}

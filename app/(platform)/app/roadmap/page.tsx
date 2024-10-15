import { Roadmap } from "@/components/roadmap"
import prisma from "@/lib/prisma"

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

    return (
        <main className="flex flex-col items-center w-screen h-screen mx-auto">
            <Roadmap />
        </main>
    )
}

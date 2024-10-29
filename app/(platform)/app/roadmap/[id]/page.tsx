import { Roadmap } from "@/components/roadmap"
import prisma from "@/lib/prisma"
import type { Node, Edge } from "@xyflow/react"
import { getSession } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"

export default async function RoadmapPage({
    params
}: {
    params: { id: string }
}) {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }
    const data = await prisma.roadmap.findUnique({
        where: {
            id: decodeURIComponent(params.id)
        },
        include: {
            organization: {
                select: {
                    subdomain: true
                }
            }
        }
    })

    if (!data || data.userId !== session.user.id) {
        notFound()
    }
    
    const dbNodes = await Promise.all(
        (
            await prisma.node.findMany({
                include: { data: true }
            })
        ).map(async node => {
            const { id, type, positionX, positionY } = node

            return {
                id,
                type,
                position: {
                    x: positionX,
                    y: positionY
                }
            }
        })
    )

    const dbEdges = await Promise.all(
        (await prisma.edge.findMany()).map(async edge => {
            const { id, source, target } = edge

            return {
                id,
                source,
                target
            }
        })
    )

    const dbMilestones = await prisma.milestone.findMany({
        include: { 
            tasks: {
                orderBy: { orderPosition: 'asc' },
                include: {
                    checklist: { orderBy: { orderPosition: 'asc' } }
                }
            } 
        }
    })

    return (
        <main className="flex flex-col items-center w-screen h-screen mx-auto">
            <Roadmap
                initNodes={dbNodes || []}
                initEdges={dbEdges || []}
                initMilestones={dbMilestones || []}
            />
        </main>
    )
}

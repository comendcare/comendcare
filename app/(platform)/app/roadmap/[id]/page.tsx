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

    // const roadmap = await prisma.roadmap.findUnique({
    //     where: {
    //         id: decodeURIComponent(params.id)
    //     },
    //     include: {
    //         // organization: {
    //         //     select: {
    //         //         subdomain: true
    //         //     }
    //         // }
    //         nodes: true,
    //         edges: true,
    //         milestones: true
    //     }
    // })


    // if (!data || data.userId !== session.user.id) {
    //     notFound()
    // }
    
    const dbNodes = await Promise.all(
        (
            await prisma.node.findMany({
                where: { roadmapId: params.id },
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
        (await prisma.edge.findMany({
            where: { roadmapId: params.id }
        })).map(async edge => {
            const { id, source, target } = edge

            return {
                id,
                source,
                target
            }
        })
    )

    const dbMilestones = await prisma.milestone.findMany({
        where: { roadmapId: params.id },
        include: { 
            papers: true,
            asset: {
                include: { contacts: true, attachments: true }
            },
            RFP: {
                include: { contacts: true, attachments: true }
            },
            tasks: {
                orderBy: { orderPosition: 'asc' },
                include: {
                    checklist: { orderBy: { orderPosition: 'asc' } }
                }
            } 
        }
    })

    return (
        <main className="flex flex-col items-center h-screen mx-auto">
            <Roadmap
                roadmapId={params.id}
                initNodes={dbNodes || []}
                initEdges={dbEdges || []}
                initMilestones={dbMilestones || []}
            />
        </main>
    )
}

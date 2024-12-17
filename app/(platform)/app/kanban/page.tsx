import prisma from "@/lib/prisma";
import KanbanBoard from "@/components/kanban-board";
import {getSession} from "@/lib/auth";

export default async function KanbanPage({
                                             params
                                         }: {
    params: { id: string }
}) {
    const session = await getSession()

    const dbNodes = await Promise.all(
        (
            await prisma.node.findMany({
                where: {roadmapId: params.id},
                include: {data: true}
            })
        ).map(async node => {
            const {id, type, positionX, positionY} = node

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
            where: {roadmapId: params.id}
        })).map(async edge => {
            const {id, source, target} = edge

            return {
                id,
                source,
                target
            }
        })
    )

    const dbMilestones = await prisma.milestone.findMany({
        where: {roadmapId: params.id},
        include: {
            papers: true,
            asset: {
                include: {contacts: true, attachments: true}
            },
            RFP: {
                include: {contacts: true, attachments: true}
            },
            tasks: {
                orderBy: {orderPosition: 'asc'},
                include: {
                    checklist: {orderBy: {orderPosition: 'asc'}}
                }
            }
        }
    })

    const dbColumns = await prisma.column.findMany({
        where: {
            kanban: {
                organization: {
                    id: session?.user.organizationId
                }
            }
        },
        include: {
            tasks: true
        }
    })

    return (
        <main className="flex flex-col space-y-4 p-8">
            <h1 className="text-3xl font-bold tracking-tight">
                Kanban
            </h1>
            <KanbanBoard
                roadmapId={params.id}
                initColumns={dbColumns || []}
                initNodes={dbNodes || []}
                initEdges={dbEdges || []}
                initMilestones={dbMilestones || []}
            />
        </main>
    )
}
import NewRoadmapForm from "@/components/new-roadmap"
import NoOrganization from "@/components/no-organization"
import { getRoadmapId } from "@/lib/fetchers"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Roadmap } from "@/components/roadmap"

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;
    
    if (!orgId) {
        return (
            <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
                <NoOrganization />
            </main>
        )
    }

    // check if this organization has an existing roadmap
    const response = await getRoadmapId(orgId);
    if (response.success && typeof response.data === 'string') {
        const roadmapId = response.data;

        const dbNodes = await Promise.all(
            (
                await prisma.node.findMany({
                    where: { roadmapId: roadmapId },
                    include: { data: true }
                })
            ).map(async node => {
                const { id, type, positionX, positionY, origin } = node
    
                return {
                    id,
                    type,
                    position: {
                        x: positionX,
                        y: positionY
                    },
                    origin,
                }
            })
        )
    
        const dbEdges = await Promise.all(
            (await prisma.edge.findMany({
                where: { roadmapId: roadmapId }
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
            where: { roadmapId: roadmapId },
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
                    roadmapId={roadmapId}
                    initNodes={dbNodes || []}
                    initEdges={dbEdges || []}
                    initMilestones={dbMilestones || []}
                />
            </main>
        )
    }

    return (
        <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
            <NewRoadmapForm />
        </main>
    )
}
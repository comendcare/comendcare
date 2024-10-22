import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import RoadmapCard from "./roadmap-card"
import Image from "next/image"

export default async function Roadmaps({
    organizationId,
    limit
}: {
    organizationId?: string
    limit?: number
}) {
    const session = await getSession()
    if (!session?.user) {
        redirect("/login")
    }
    const roadmaps = await prisma.roadmap.findMany({
        where: {
            userId: session.user.id as string,
            ...(organizationId ? { organizationId } : {})
        },
        orderBy: {
            updatedAt: "desc"
        },
        include: {
            organization: true
        },
        ...(limit ? { take: limit } : {})
    })

    return roadmaps.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {roadmaps.map(roadmap => (
                <RoadmapCard key={roadmap.id} data={roadmap} />
            ))}
        </div>
    ) : (
        <div className="flex flex-col items-center space-x-4">
            <h1 className="font-cal text-4xl">No Roadmaps Yet</h1>
            <Image
                alt="missing roadmap"
                src="https://illustrations.popsy.co/gray/graphic-design.svg"
                width={400}
                height={400}
            />
            <p className="text-lg text-stone-500">
                You do not have any roadmaps yet. Create one to get started.
            </p>
        </div>
    )
}

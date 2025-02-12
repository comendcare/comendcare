"use client"

import NewRoadmapForm from "@/components/new-roadmap"
import NoOrganization from "@/components/no-organization"
// import { getRoadmap } from "@/lib/fetchers"
// import { getSession } from "@/lib/auth"
import { Roadmap } from "@/components/roadmap"
import RoadmapTemplates from "@/components/roadmap-templates"
import { useSession } from "next-auth/react"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    milestones: state.milestones,
})

export default function RoadmapPage() {
    // const session = await getSession();
    const {data: session, status} = useSession()
    const orgId = session?.user.organizationId;
    
    if (!orgId) {
        return (
            <main className="flex gap-8 flex-col w-full h-full justify-center items-center mx-auto">
                <NoOrganization />
            </main>
        )
    }

    const { 
        roadmapId,
        milestones
    } = useRoadmapStore(useShallow(selector))

    if (roadmapId) {
        if (milestones && milestones.length > 0) {
            return (
                <main className="flex flex-col items-center h-full w-full mx-auto">
                    <Roadmap />
                </main>
            )
        } 

        return (
            <main className="flex flex-col items-center h-full mx-auto">
                <RoadmapTemplates />
            </main>
        )
    }

    // check if this organization has an existing roadmap
    // const response = await getRoadmap(orgId)
    // if (response.success && response.data) {
    //     if (response.data.milestones && response.data.milestones.length > 0) {
    //         return (
    //             <main className="flex flex-col items-center h-full w-full mx-auto">
    //                 <Roadmap data={response.data}/>
    //             </main>
    //         )
    //     }

    //     return (
    //         <main className="flex flex-col items-center h-full mx-auto">
    //            <RoadmapTemplates />
    //         </main>
    //     )
    // }

    return (
        <main className="flex gap-8 flex-col w-full h-full justify-center items-center mx-auto">
            <NewRoadmapForm />
        </main>
    )
}
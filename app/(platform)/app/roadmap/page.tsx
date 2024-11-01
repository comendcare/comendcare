"use client"

import NewRoadmapForm from "@/components/new-roadmap-form"
import { getRoadmapId } from "@/lib/actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default async function RoadmapPage() {
    const router = useRouter()
    const {data: session} = useSession()

    const roadmapsCheck = async () => {
        const roadmapId = await getRoadmapId(session?.user.organizationId)
        if (roadmapId) router.push(`/app/roadmap/${roadmapId}`)
    }

    useEffect(() => {
        // if the org already has a roadmap, we redirect them to it
        roadmapsCheck()
    }, [])

    return (
        <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
            <NewRoadmapForm />
        </main>
    )
}

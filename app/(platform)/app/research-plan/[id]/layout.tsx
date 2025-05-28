"use client"

import { getRoadmap } from "@/lib/fetchers"
import { initializeRoadmapState } from "@/lib/initialize-client-state"
import { sleep } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

interface ResearchPlanLayoutProps {
    children: React.ReactNode,
    params: {id: string}
}

export default function ResearchPlanLayout({children, params}: ResearchPlanLayoutProps) {
    const {data: session} = useSession()
    const searchParams = useSearchParams()

    useEffect(() => {
        const init = async () => {
            const response = await getRoadmap(session?.user.organizationId, params.id)
            if (response.success && response.data) {
                if (response.success) {
                    const urlNode = searchParams.get("milestone")
                    const urlView = searchParams.get("view")

                    initializeRoadmapState({
                        roadmapId: params.id,
                        details: response.data,
                        nodes: response.data.nodes,
                        edges: response.data.edges,
                        milestones: response.data.milestones,
                        selectedView: urlView,
                        selectedNodeId: urlNode 
                    })

                    console.log(`Research Plan initialized...`)
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }
            } else {
                console.error(`Could not initialize active roadmap with id ${params.id}. Error: ${response.error}`)
            }
        }

        init()
    }, [])

    // http://localhost:3000/app/research-plan/cm9vkmnet0000xhlmpv1grm41 - test research plan path

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto">
            {children}
        </main>
    )
}
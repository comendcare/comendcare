"use client"

import { getNodesEdgesAndMilestones, getRoadmap } from "@/lib/fetchers"
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
            console.log(`research plan init response`, response)

            if (response.success && response.data) {
                // initialize roadmap zustand here...
                if (response.success) {
                    // if we're on the research plan page and the resarch plan doesn't exist, create it, then initialize
                    // if (pathname === "/app/research-plan" && !response.data) {
                    //     console.log(`research plan doesn't exist, create it`)
                    //     const roadmap =  await createRoadmap(session.user.organizationId, {})
                    //     console.log(`roadmap`, roadmap)
                    //     response = await getRoadmapId(session.user.organizationId)
                    // }

                    const nodesResponse = await getNodesEdgesAndMilestones(params.id)
                    const urlNode = searchParams.get("milestone")
                    const urlView = searchParams.get("view")
                    console.log(`roadmap details`, response.data)
                    if (nodesResponse.success) {
                        initializeRoadmapState({
                            roadmapId: params.id,
                            details: {title: response.data.title || '', description: response.data.description || ''},
                            nodes: nodesResponse.data.nodes,
                            edges: nodesResponse.data.edges,
                            milestones: nodesResponse.data.milestones,
                            selectedView: urlView,
                            selectedNodeId: urlNode 
                        })
                    } else {
                        // init state, but research plan has not been created yet
                        initializeRoadmapState({
                            roadmapId: null,
                            details: {title: response.data.title || '', description: response.data.description || ''},
                            nodes: [],
                            edges: [],
                            milestones: [],
                            selectedView: null,
                            selectedNodeId: null 
                        })
                    }
                    console.log(`Research Plan initialized...`)
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }
            } else {
                console.error(`Could not initialize active roadmap with id ${params.id}`)
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
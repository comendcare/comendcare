"use client"

import { getAllNotifications, getRoadmap } from "@comend/lib/fetchers"
import { initializeNotificationsState, initializeRoadmapState } from "@comend/lib/initialize-client-state"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"

interface ResearchPlanLayoutProps {
    children: React.ReactNode
    params: { id: string }
}

export default function ResearchPlanLayout({ children, params }: ResearchPlanLayoutProps) {
    const { data: session, status } = useSession()
    const searchParams = useSearchParams()

    // stable string for deps
    const searchParamsString = useMemo(() => searchParams.toString(), [searchParams])

    useEffect(() => {
        // Don’t call the API until we know the session status
        if (status !== "authenticated") return

        const orgId = session?.user.organizationId
        if (!orgId) {
            // If you WANT a toast only when the user is actually authenticated but missing an org:
            // toast.error("You’re signed in but not part of an organization.")
            return
        }

        let cancelled = false
        const init = async () => {
            const response = await getRoadmap(orgId, params.id, {
                id: true,
                title: true,
                description: true,
                content: true,
                slug: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                published: true,
                organizationId: true,
                organization: true,
                user: true,
                edges: true,
                milestones: true,
                nodes: true,
                modalities: true,
                metadata: true,
            })

            if (cancelled) return

            if (response.success && response.data) {
                const urlNode = new URLSearchParams(searchParamsString).get("milestone")
                const urlView = new URLSearchParams(searchParamsString).get("view")

                initializeRoadmapState({
                    roadmapId: params.id,
                    details: response.data,
                    nodes: response.data.nodes,
                    edges: response.data.edges,
                    milestones: response.data.milestones,
                    selectedView: urlView,
                    selectedNodeIds: urlNode ? [urlNode] : [],
                })
                // optional: toast.success("Research Plan loaded")
            } else {
                console.error(`Could not initialize active roadmap with id ${params.id}. Error: ${response.error}`)
                toast.error(response.error)
            }
        }

        // Init notifications
        // let notifications = await getAllNotifications({
        //     id: true,
        //     type: true,
        //     title: true,
        //     message: true,
        //     link: true,
        //     createdAt: true,
        //     updatedAt: true,
        //     lastViewedAt: true,
        // })
        // if (notifications.success && notifications.data) {
        //     initializeNotificationsState({
        //         notifications: notifications.data
        //     })
        //     console.log(`Notificaions initialized...`)
        // } else {
        //     console.error(notifications.error)
        //     toast.error(notifications.error)
        // }

        void init()
        return () => {
            cancelled = true
        }
    }, [status, session?.user.organizationId, params.id, searchParamsString])

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto">
            {children}
        </main>
    )
}

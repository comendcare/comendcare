"use client"
import { Button } from "@/components/ui/button"
import { createRoadmap, getRoadmapId } from "@/lib/actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default async function RoadmapPage() {
    const router = useRouter()
    const {data: session, update} = useSession()

    const handleClick = async () => {
        if (session?.user?.organizationId) {
            const roadmap = await createRoadmap(session.user.organizationId)
            router.push(`/app/roadmap/${roadmap.id}`)
        } else {
            console.error(`organization id is not defined in the session:`, session)
        }
    }

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
            <h1 className="text-xl">{`You don't currently have any roadmaps`}</h1>
            <Button onClick={handleClick}>Create a roadmap</Button>
        </main>
    )
}

"use client"

import NewRoadmapForm from "@/components/new-roadmap-form"
import NoOrganization from "@/components/no-organization"
import { getRoadmapId } from "@/lib/actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default async function RoadmapPage() {
    const router = useRouter()
    const {data: session} = useSession()
    const [orgId, setOrgId] = useState<string | undefined>(undefined)

    const roadmapsCheck = async () => {
        const roadmapId = await getRoadmapId(session?.user.organizationId)
        if (roadmapId) router.push(`/app/roadmap/${roadmapId}`)
    }

    useEffect(() => {
        // set org if the user is in an org
        if (session?.user.organizationId) setOrgId(session?.user.organizationId)
        // if the org already has a roadmap, we redirect them to it
        roadmapsCheck()
    }, [])

    return (
        <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
            {orgId ?
                <NewRoadmapForm />:
                <NoOrganization />
            }
        </main>
    )
}

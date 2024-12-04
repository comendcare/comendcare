"use client"

import NewRoadmapForm from "@/components/new-roadmap"
import NoOrganization from "@/components/no-organization"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {getRoadmapId} from "@/lib/fetchers";
import {toast} from "sonner";

export default async function RoadmapPage() {
    const router = useRouter()
    const {data: session} = useSession()
    const [orgId, setOrgId] = useState<string | undefined>(undefined)

    const roadmapsCheck = async () => {
        const response = await getRoadmapId(session?.user.organizationId)
        if (response.success) {
            const roadmapId = response.data

            if (roadmapId) router.push(`/app/roadmap/${roadmapId}`)
        } else {
            console.error(response.error)
            toast.error(response.error)
        }
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

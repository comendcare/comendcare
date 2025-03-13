import NewRoadmapForm from "@/components/new-roadmap"
import {getRoadmap} from "@/lib/fetchers"
import {getSession} from "@/lib/auth"
import {Roadmap} from "@/components/roadmap"
import RoadmapTemplates from "@/components/roadmap-templates"
import NoOrganization from "@/components/no-organization";
import { createRoadmap } from "@/lib/actions"
import RoadmapInitWrapper from "@/components/roadmap-init-wrapper"
import { initializeRoadmapState } from "@/lib/initialize-client-state"
import { Router } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    const createNewRoadmap = async () => {
        const response = await getRoadmap(session?.user.organizationId)
        if (session?.user.organizationId && response.success && !response.data) {
            console.log('Roadmap doesnt exist, create it')
            const roadmap = await createRoadmap(session.user.organizationId, {})

            if (!roadmap) {
                console.error("Error creating research plan")
                return
            }

            return roadmap
        }
    }

    if (!orgId) {
        return <div>No Organization</div>
    }

    let response = await getRoadmap(orgId)

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto">
            <Roadmap data={response.data} />
        </main>
    )
}

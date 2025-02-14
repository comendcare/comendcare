import NewRoadmapForm from "@/components/new-roadmap"
import {getRoadmap} from "@/lib/fetchers"
import {getSession} from "@/lib/auth"
import {Roadmap} from "@/components/roadmap"
import RoadmapTemplates from "@/components/roadmap-templates"
import NoOrganization from "@/components/no-organization";

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    if (!orgId) {
        return (
            <NoOrganization/>
        )
    }

    // check if this organization has an existing roadmap
    const response = await getRoadmap(orgId)
    if (response.success && response.data) {
        if (response.data.milestones && response.data.milestones.length > 0) {
            return (
                <main className="flex flex-col items-center h-full w-full mx-auto">
                    <Roadmap data={response.data}/>
                </main>
            )
        }

        return (
            <main className="flex flex-col items-center h-full mx-auto">
                <RoadmapTemplates/>
            </main>
        )
    }

    return (
        <main className="flex gap-8 flex-col w-full h-full justify-center items-center mx-auto">
            <NewRoadmapForm/>
        </main>
    )
}

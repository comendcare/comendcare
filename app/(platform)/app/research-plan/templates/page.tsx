import NewRoadmapForm from "@/components/new-roadmap"
import RoadmapTemplates from "@/components/roadmap-templates"
import {getRoadmapData, getRoadmaps} from "@/lib/fetchers"
import {getSession} from "@/lib/auth"
import NoOrganization from "@/components/no-organization";

export default async function TemplatesPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    if (!orgId) {
        return (
            <NoOrganization/>
        )
    }

    // check if this organization has an existing roadmap
    const response = await getRoadmaps(orgId)
    if (response.success && response?.data && response.data.length > 0) {
        return (
            <main className="flex flex-col items-center h-full mx-auto">
                <RoadmapTemplates/>
            </main>
        )
    }

    return (
        <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
            <NewRoadmapForm/>
        </main>
    )
}

import NewRoadmapForm from "@/components/new-roadmap"
import NoOrganization from "@/components/no-organization"
import RoadmapTemplates from "@/components/roadmap-templates"
import { getRoadmapData, getRoadmapId } from "@/lib/fetchers"
import { getSession } from "@/lib/auth"

export default async function TemplatesPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;
    
    if (!orgId) {
        return (
            <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
                <NoOrganization />
            </main>
        )
    }

    // check if this organization has an existing roadmap
    const response = await getRoadmapId(orgId);
    if (response.success && typeof response.data === 'string') {
        return (
            <main className="flex flex-col items-center h-screen mx-auto">
               <RoadmapTemplates />
            </main>
        )
    }

    return (
        <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
            <NewRoadmapForm />
        </main>
    )
}
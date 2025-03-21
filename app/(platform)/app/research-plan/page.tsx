import {getOrganizationFromOrganizationId} from "@/lib/fetchers"
import {getSession} from "@/lib/auth"
import {Roadmap} from "@/components/roadmap"
import NoOrganization from "@/components/no-organization";

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    if (!orgId) {
        return <NoOrganization />
    }

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto">
            <Roadmap />
        </main>
    )
}

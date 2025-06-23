import {getSession} from "@/lib/auth"
import NoOrganization from "@/components/no-organization";
import RoadmapsPage from "@/components/roadmaps-page";

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    if (!orgId) {
        return <NoOrganization />
    }

    return (
        <RoadmapsPage orgId={orgId}/>
    )
}

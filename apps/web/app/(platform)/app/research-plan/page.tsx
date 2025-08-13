import {getSession} from "~web/lib/auth"
import NoOrganization from "~web/components/no-organization";
import RoadmapsPage from "~web/components/roadmaps-page";

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

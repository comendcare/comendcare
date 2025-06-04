import {getRoadmaps} from "@/lib/fetchers"
import {getSession} from "@/lib/auth"
import NoOrganization from "@/components/no-organization";
import { Roadmap } from "@prisma/client";
import RoadmapsPage from "@/components/roadmaps-page";

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    if (!orgId) {
        return <NoOrganization />
    }

    let roadmaps: Roadmap[] = []

    const response = await getRoadmaps(orgId, {
        id: true,
        title: true,
        description: true,
        content: true,
        slug: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        published: true,
        organizationId: true,
        organization: true,
        user: true,
        edges: true,
        milestones: true,
        nodes: true,
        modalities: true
    })
    if (response.success && response.data) {
        roadmaps = response.data
    }

    return (
        <RoadmapsPage roadmaps={roadmaps} orgId={orgId}/>
    )
}

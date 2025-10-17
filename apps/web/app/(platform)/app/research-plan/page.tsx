import {getSession} from "@/packages/lib/auth"
import NoOrganization from "~web/components/no-organization";
import RoadmapsPage from "~web/components/roadmaps-page";
import prisma from "@/packages/lib/prisma";
import { getPublicRoadmapsForOrganization } from "@/packages/lib/fetchers";

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    if (!orgId) return <NoOrganization/>

    const organization = await prisma.organization.findUnique({
        where: {id: orgId},
        select: {
            id: true,
            name: true,
            subdomain: true,
            customDomain: true,
        },
    })

    const roadmaps = organization?.subdomain 
        ? ([
            await getPublicRoadmapsForOrganization(organization.subdomain, {
                id: true,
                title: true,
                description: true,
                slug: true,
                edges: true,
                milestones: true,
                nodes: true,
                modalities: true,
            }),
        ]) 
        : ([[]])

    if (!organization) return <NoOrganization />

    return (
        <RoadmapsPage
            orgId={orgId}
            organization={organization}
            roadmaps={roadmaps}
        />
    )
}

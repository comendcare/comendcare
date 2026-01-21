import {getSession} from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization";
import RoadmapsPage from "~web/components/roadmaps-page";
import prisma from "@comend/lib/prisma";

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    if (!orgId) return <NoOrganization/>

    const [organization, roadmaps] = await Promise.all([
        prisma.organization.findUnique({
            where: {id: orgId},
            select: {
                id: true,
                name: true,
                subdomain: true,
                customDomain: true,
            },
        }),
        prisma.roadmap.findMany({
            where: {organizationId: orgId},
            orderBy: {createdAt: "desc"},
            select: {
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
                userId: true,
                edges: true,
                milestones: {
                    // where: {private: false},
                    include: {
                        types: {include: {milestoneType: true}},
                        biosamples: true,
                        diseaseModels: true,
                        tools: true,
                        rfps: true,
                    },
                    orderBy: [{createdAt: "desc"}]
                },
                nodes: true,
                organization: true,
                user: true,
                modalities: true,
                metadata: true,
            },
        })
    ])

    if (!organization) return <NoOrganization />

    return (
        <RoadmapsPage
            orgId={orgId}
            organization={organization}
            roadmaps={roadmaps}
        />
    )
}

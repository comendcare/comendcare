import {getSession} from "@/packages/lib/auth"
import NoOrganization from "~web/components/no-organization";
import RoadmapsPage from "~web/components/roadmaps-page";
import prisma from "@/packages/lib/prisma";

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    const [organization, roadmaps] = await Promise.all([
        prisma.organization.findUnique({
            where: {id: orgId},
            select: {
                id: true,
                public: true,
                verified: true,
                published: true,
                name: true,
                description: true,
                contactEmail: true,
                logo: true,
                image: true,
                headerImage: true,
                biopharmaConsentSettings: true,
                subdomain: true,
                customDomain: true,
                statedGoal: true,
                yearFounded: true,
                incorporationStatus: true,
                therapeuticsOfInterest: true,
                therapeuticsInDevelopment: true,
                website: true,
                moneyRaised: true,
                moneyDeployed: true,
                researchBudget: true,
                createdAt: true,
                updatedAt: true,
                user: true,
                userId: true,
                roadmaps: true,
                members: true,
                clients: true,
                invitations: true,
                membershipRequests: true,
                conditions: true,
                kanban: true,
                milestones: true,
                platformNotifications: true,
                reviews: true,
                savedCompanies: true,
                tools: true,
                rfps: true,
                metadata: true
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
                milestones: true,
                nodes: true,
                organization: true,
                user: true,
                modalities: true,
                metadata: true,
            },
        }),
    ]);


    if (!orgId || !organization) return <NoOrganization/>

    return (
        <RoadmapsPage
            orgId={orgId}
            organization={organization}
            roadmaps={roadmaps}
        />
    )
}

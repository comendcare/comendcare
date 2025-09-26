import {getSession} from "@/packages/lib/auth"
import {Roadmap} from "~web/components/roadmap"
import NoOrganization from "~web/components/no-organization";
import {getMilestoneTypes, getOrganizationFromOrganizationId} from "@/packages/lib/fetchers";

export default async function RoadmapPage({params}: { params: { id: string } }) {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization/>

    const [milestoneTypesRes, organizationRes] = await Promise.all([
        getMilestoneTypes({
            id: true,
            label: true,
            services: true,
            categories: true,
            description: true,
        }),
        getOrganizationFromOrganizationId(orgId, {
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
        }),
    ]);

    const milestoneTypes = milestoneTypesRes.success ? (milestoneTypesRes.data ?? []) : [];
    const organization = organizationRes.success ? organizationRes.data : undefined;

    return (
        <Roadmap
            milestoneTypes={milestoneTypes}
            organization={organization}
            orgSubdomain={organization?.subdomain}
            orgIsPublished={!!organization?.published}
            researchPlanId={params.id}
        />
    )
}

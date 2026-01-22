import { PAGRoadmapHeader } from "~web/components/pag-roadmap-header";
import { RoadmapsCard } from "~web/components/public-roadmap-card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@comend/components/ui/breadcrumb";
import { getOrganizationData, getPublicRoadmapsForOrganization, getResearchPlans } from "@comend/lib/fetchers";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@comend/lib/auth";
import { researchPlanSearchParamsCache } from "@comend/lib/validations";
import { getValidFilters } from "@comend/lib/data-table";

export default async function EmbeddedResearchPlansPage({params}: {params: {domain: string}}) {
    const searchParams = params
    const session = await getServerSession(authOptions);
    const search = researchPlanSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const [organization, roadmaps, {data: researchPlans, pageCount: researchPlansPageCount}] = await Promise.all([
        getOrganizationData(params.domain, {
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
            // address1                  String?
            // address2                  String?
            // formattedAddress          String?
            // city                      String?
            // region                    String?
            // postalCode                String?
            // country                   String?
            // lat                       String?
            // lng                       String?
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
        getPublicRoadmapsForOrganization(params.domain, {
            id: true,
            title: true,
            description: true,
            slug: true,
            edges: true,
            milestones: true,
            nodes: true,
            modalities: true
        }),
        getResearchPlans(
            session?.user.organizationId,
            {
                id: true,
                title: true,
                description: true,
                published: true,
                organizationId: true,
                // milestones: {
                //     // where: {private: false},
                //     include: {
                //         types: {include: {milestoneType: true}},
                //         biosamples: true,
                //         diseaseModels: true,
                //         tools: true,
                //         rfps: true,
                //     },
                //     orderBy: [{createdAt: "desc"}]
                // },
                organization: true,
                modalities: true,
                stages: true,
                statuses: true,
                partners: true,
                links: true,
            },
            {...search, q: globalFilter, filters: validFilters},
            true,
            // columns
        )
    ])

    if (!organization) {
        notFound()
    }
    
    return (
        <div
            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
        >
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank">
                            {organization.name}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`} target="_blank">
                            Research Plans
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <PAGRoadmapHeader organization={organization} editable={false} embedded={true}/>
            <RoadmapsCard 
                // roadmaps={roadmaps} 
                researchPlans={researchPlans}
                researchPlansPageCount={researchPlansPageCount}
                searchParams={searchParams}
                organization={organization}
            />
        </div>
    )
}

import {getSession} from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization";
import RoadmapsPage from "~web/components/roadmaps-page";
import prisma from "@comend/lib/prisma";
import { getProjects, getResearchPlans } from "@comend/lib/fetchers";
import { SearchParams } from "@comend/components/types";
import { researchPlanSearchParamsCache } from "@comend/lib/validations";
import { getValidFilters } from "@comend/lib/data-table";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

export default async function RoadmapPage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId
    const searchParams = await props.searchParams;
    const search = researchPlanSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const [organization, researchPlansDataResponse, projectsDataResponse] = await Promise.all([
        prisma.organization.findUnique({
            where: {id: orgId},
            select: {
                id: true,
                name: true,
                subdomain: true,
                customDomain: true,
            },
        }),
        getResearchPlans(
            session?.user.organizationId,
            {
                id: true,
                private: true,
                title: true,
                description: true,
                published: true,
                organizationId: true,
                organization: true,
                modalities: true,
                stages: true,
                statuses: true,
                partners: true,
                links: true,
                milestones: {
                    include: {types: {include: {milestoneType: true}}}
                }
            },
            {...search, q: globalFilter, filters: validFilters},
            false,
        ),
        getProjects(
            session?.user.organizationId,
            {
                id: true,
                private: true,
                title: true,
                description: true,
                organizationId: true,
                organization: true,
                roadmapId: true,
                nodeId: true,
            },
            {...search, q: globalFilter, filters: validFilters},
            false,
        )
    ])

    if (!orgId || !organization) return <NoOrganization/>

    return (
        <RoadmapsPage
            orgId={orgId}
            organization={organization}
            researchPlansData={[...researchPlansDataResponse.data]} 
            researchPlansPageCount={researchPlansDataResponse.pageCount} 
            projectsData={[...projectsDataResponse.data]} 
            projectsPageCount={projectsDataResponse.pageCount} 
            searchParams={searchParams}
        />
    )
}

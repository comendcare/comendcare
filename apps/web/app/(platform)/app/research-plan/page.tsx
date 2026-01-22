import {getSession} from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization";
import RoadmapsPage from "~web/components/roadmaps-page";
import prisma from "@comend/lib/prisma";
import { useResearchPlansTableColumns } from "@comend/components/biorepo/advanced-data-table/research-plans-table/private-research-plans-table-columns"
import { getResearchPlans, getRoadmap, getRoadmaps } from "@comend/lib/fetchers";
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

    const organization = await prisma.organization.findUnique({
        where: {id: orgId},
        select: {
            id: true,
            name: true,
            subdomain: true,
            customDomain: true,
        },
    })

    // const columns = useResearchPlansTableColumns({session: session as any})

    const {data, pageCount} = await getResearchPlans(
        session?.user.organizationId,
        {
            id: true,
            private: true,
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
        false,
        // columns
    )

    if (!orgId) return <NoOrganization/>
    if (!organization) return <NoOrganization />

    return (
        <RoadmapsPage
            orgId={orgId}
            organization={organization}
            data={[...data]} 
            pageCount={pageCount} 
            searchParams={searchParams}
        />
    )
}

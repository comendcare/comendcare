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

    // const roadmaps = await prisma.roadmap.findMany({
    //     where: {organizationId: orgId},
    //     orderBy: {createdAt: "desc"},
    //     select: {
    //         id: true,
    //         title: true,
    //         description: true,
    //         content: true,
    //         slug: true,
    //         image: true,
    //         createdAt: true,
    //         updatedAt: true,
    //         published: true,
    //         organizationId: true,
    //         userId: true,
    //         edges: true,
    //         milestones: {
    //             // where: {private: false},
    //             include: {
    //                 types: {include: {milestoneType: true}},
    //                 biosamples: true,
    //                 diseaseModels: true,
    //                 tools: true,
    //                 rfps: true,
    //             },
    //             orderBy: [{createdAt: "desc"}]
    //         },
    //         nodes: true,
    //         organization: true,
    //         user: true,
    //         modalities: true,
    //         metadata: true,
    //     },
    // })

    // const columns = useResearchPlansTableColumns({session: session as any})
    // const {data, pageCount} = await getRoadmaps()

    const columns = useResearchPlansTableColumns({session: session as any})

    const {data, pageCount} = await getResearchPlans(
        session?.user.organizationId,
        {
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
        {...search, q: globalFilter, filters: validFilters},
        false,
        columns
    )

    // // not part of an org
    // if (!orgId) return <NoOrganization />
    // return <PrivateBiosampleToolsPage data={[...data]} pageCount={pageCount} searchParams={searchParams} />
    
    if (!orgId) return <NoOrganization/>
    if (!organization) return <NoOrganization />

    return (
        <RoadmapsPage
            orgId={orgId}
            organization={organization}
            // roadmaps={roadmaps}
            data={[...data]} 
            pageCount={pageCount} 
            searchParams={searchParams}
            // columns={columns}

        />
    )
}

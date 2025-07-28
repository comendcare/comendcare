// import React from "react"
// import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
// import { SearchParams } from "@/packages/components/types"
// import { biosampleRequestsSearchParamsCache } from "@/packages/components/biorepo/advanced-data-table/lib/validations"
// import { getValidFilters } from "@/packages/lib/data-table"
// import { getBiosampleRequests } from "@/packages/components/biorepo/advanced-data-table/lib/queries"
// import { PrivateBiosampleRequestsPage } from "~web/components/biosample-requests-page"

// export const dynamic = "force-dynamic";

// interface IndexPageProps {
//     searchParams: Promise<SearchParams>;
// }

// export default async function BiosampleRequestsPage(props: IndexPageProps) {
//     const session = await getSession()
//     const orgId = session?.user.organizationId
//     const searchParams = await props.searchParams;
//     const search = biosampleRequestsSearchParamsCache.parse(searchParams);
//     const validFilters = getValidFilters(search.filters);

//     const promises = Promise.all([
//         getBiosampleRequests(
//             session?.user.organizationId,
//             {...search, filters: validFilters}
//         ),
//     ]);

//     if (!orgId) return <NoOrganization />
//     return <PrivateBiosampleRequestsPage promises={promises} />
// }

import RequestStats from "~web/components/request-stats";
import * as React from "react"
import RequestToolbar from "~web/components/request-toolbar";
import {getAllOrganizationRequests, getAllResearcherRequests} from "@/packages/lib/fetchers";
import {getSession} from "@/packages/lib/auth";
import RequestHistory from "~web/components/request-history";

function calculateStats(requests: any[]) {
    const totalRequests = requests.length;

    const approvedRequests = requests.filter(req => req.status === 'APPROVED');
    const pendingRequests = requests.filter(req => req.status === 'PENDING');
    const completedRequests = requests.filter(req => req.status === 'COMPLETED');
    // const approvalRate = totalRequests
    //     ? ((approvedRequests.length / totalRequests) * 100).toFixed(0) + "%"
    //     : "0%";

    // const totalSamples = requests.reduce((sum, req) => sum + (req.sampleCount || 0), 0);

    return [
        { name: 'Total Requests Recieved', value: totalRequests.toString() },
        { name: 'Pending Requests', value: pendingRequests.length.toString() },
        { name: 'Completed Requests', value: completedRequests.length.toString()},
        // { name: 'Samples Received', value: totalSamples.toString() },
        // { name: 'Approval Rate', value: approvalRate },
    ];
}

export default async function ResearcherAccessRequestsPage() {
    const session = await getSession()
    const orgId = session?.user.organizationId
    // const searchParams = await props.searchParams;
    // const search = biosampleRequestsSearchParamsCache.parse(searchParams);
    // const validFilters = getValidFilters(search.filters);

    let requestsData = []
    if (session?.user?.id) {
        const response = await getAllOrganizationRequests(session?.user?.organizationId)
        if (response.success) {
            requestsData = response.data
        } else {
            console.error(response.error)
        }
    }

    const stats = calculateStats(requestsData)

    if (!orgId) return <NoOrganization />
    return (
        <div className="flex max-w-screen-xl flex-col mx-auto space-y-8 p-8">
            <RequestStats stats={stats} />

            <RequestToolbar />

            <RequestHistory />
        </div>
    )
}
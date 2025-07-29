import NoOrganization from "~web/components/no-organization"
import RequestStats from "@comend/components/requests/request-stats";
import * as React from "react"
import {getAllOrganizationRequests} from "@/packages/lib/fetchers";
import {getSession} from "@/packages/lib/auth";
import RequestHistory from "~web/components/requests/request-history";
import RequestToolbar from "~web/components/requests/request-toolbar";

function calculateStats(requests: any[]) {
    const totalRequests = requests.length;

    const approvedRequests = requests.filter(req => req.status === 'APPROVED');
    const pendingRequests = requests.filter(req => req.status === 'PENDING');
    const completedRequests = requests.filter(req => req.status === 'COMPLETED');
    const rejectedRequests = requests.filter(req => req.status === 'REJECTED')

    return [
        { name: 'Total Requests Recieved', value: totalRequests.toString() },
        { name: 'Pending Requests', value: pendingRequests.length.toString() },
        { name: 'Completed Requests', value: completedRequests.length.toString()},
        { name: 'Rejected Requests', value: rejectedRequests.length.toString()}
    ];
}

export default async function ResearcherAccessRequestsPage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

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
        <div className="w-full max-w-screen-xl flex flex-col mx-auto space-y-8 p-8">
            <RequestStats stats={stats} />
            <RequestToolbar />
            <RequestHistory />
        </div>
    )
}
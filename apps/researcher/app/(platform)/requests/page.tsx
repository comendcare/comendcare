import RequestStats from "@/packages/components/requests/request-stats";
import * as React from "react"
import RequestToolbar from "@/packages/components/requests/request-toolbar";
import {getAllResearcherRequests} from "@/packages/lib/fetchers";
import {getSession} from "@/packages/lib/auth";
import RequestHistory from "@/packages/components/requests/request-history"

function calculateStats(requests: any[]) {
    const totalRequests = requests.length;

    const approvedRequests = requests.filter(req => req.status === 'APPROVED');
    const pendingRequests = requests.filter(req => req.status === 'PENDING');
    const approvalRate = totalRequests
        ? ((approvedRequests.length / totalRequests) * 100).toFixed(0) + "%"
        : "0%";

    const totalSamples = requests.reduce((sum, req) => sum + (req.sampleCount || 0), 0);

    return [
        { name: 'Total Requests Submitted', value: totalRequests.toString() },
        { name: 'Pending Requests', value: pendingRequests.length.toString() },
        { name: 'Samples Received', value: totalSamples.toString() },
        { name: 'Approval Rate', value: approvalRate },
    ];
}

export default async function ResearcherAccessRequestsPage() {
    const session = await getSession()

    let requestsData = []
    if (session?.user?.id) {
        const response = await getAllResearcherRequests(session.user.id)
        if (response.success) {
            requestsData = response.data
        } else {
            console.error(response.error)
        }
    }

    const stats = calculateStats(requestsData)

    return (
        <div className="flex max-w-screen-xl flex-col mx-auto space-y-8 p-8">
            <RequestStats stats={stats} />

            <RequestToolbar />

            <RequestHistory />
        </div>
    )
}

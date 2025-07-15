import RequestCard from "~researcher/components/request-card";
import RequestStats from "~researcher/components/request-stats";
import * as React from "react"
import RequestToolbar from "~researcher/components/request-toolbar";
import {getAllResearcherRequests} from "@/packages/lib/fetchers";
import {getSession} from "@/packages/lib/auth";
import {MaterialAndDataAccessRequest} from "@prisma/client";

const stats = [
    { name: 'Total Requests Submitted', value: '12' },
    { name: 'Average Approval Time', value: '14.2', unit: 'days' },
    { name: 'Samples Received', value: '184' },
    { name: 'Approval Rate', value: '75%' },
]

export default async function ResearcherAccessRequestsPage() {
    const session = await getSession()

    let requestsData
    if (session?.user?.id) {
        const response = await getAllResearcherRequests(session.user.id)
        if (response.success) {
            requestsData = response.data
        } else {
            console.error(response.error)
        }
    }

    return (
        <div className="flex max-w-screen-xl flex-col mx-auto space-y-8 p-8">
            <RequestStats stats={stats}/>

            <RequestToolbar/>

            <div className="space-y-4">
                {requestsData.map((request: MaterialAndDataAccessRequest) => (
                    <RequestCard request={request} key={request.id}/>
                ))}
            </div>
        </div>
    )
}

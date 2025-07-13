import React from "react";
import ResearcherProfile from "~researcher/components/researcher-profile";
import {getSession} from "@/packages/lib/auth";
import {getResearcherRequests} from "@/packages/lib/fetchers";
import RequestPage from "~researcher/components/request-page";


export default async function ResearcherRequestsPage({
                                                  params
                                              }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)
    const session = await getSession()

    let requestData
    if (session?.user?.id) {
        const response = await getResearcherRequests(session.user.id, {
            title: true,
            description: true,
            status: true,
            organization: true,
            organizationId: true,
            researcher: true,
            researcherId: true,
            createdAt: true,
            updatedAt: true
        });
        if (response.success) {
            requestData = response.data
        } else {
            console.error(response.error)
        }
    }

    return (
        <div
            className="bg-red"
        >
            <RequestPage requestData={requestData} />
        </div>
    )
}

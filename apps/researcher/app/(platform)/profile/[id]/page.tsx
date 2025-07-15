import React from "react";
import ResearcherProfile from "~researcher/components/researcher-profile";
import {getSession} from "@comend/lib/auth";
import {getResearcher} from "@comend/lib/fetchers";
import {toast} from "sonner";

export default async function CompanyHomePage({
                                                  params
                                              }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)
    const session = await getSession()

    let researcherData
    if (session?.user?.id) {
        const response = await getResearcher(session.user.id, {
            id: true,
            orcid: true,
            email: true,
            emailHash: true,
            title: true,
            name: true,
            researchInterests: true,
            conditionsOfInterest: true,
            genesOfInterest: true,
            affiliations: true,
            createdAt: true,
            updatedAt: true,
            metadata: true
        });
        if (response.success) {
            researcherData = response.data
        } else {
            console.error(response.error)
        }
    }

    return (
        <div className="w-screen h-screen overflow-auto">
            <ResearcherProfile researcherData={researcherData}/>
        </div>
    )
}

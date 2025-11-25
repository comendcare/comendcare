import React from "react";
import ResearcherProfile from "~researcher/components/researcher-profile";
import {getSession} from "@comend/lib/auth";
import {
    getResearcherWithMergedDataAdvanced,
    getResearcherWithMergedData,
    getResearcher,
    getResearcherPublications
} from "@comend/lib/fetchers";

export default async function ResearcherProfilePage({
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
            title: true,
            user: true,
            country: true,
            description: true,
            researchInterests: true,
            therapeuticsOfInterest: true,
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

    let publications
    if (session?.user?.id) {
        const response = await getResearcherPublications(session.user.id)
        if (response.success) {
            publications = response.data
        } else {
            console.error(response.error)
        }
    }

    return (
        <ResearcherProfile
            researcherData={researcherData}
            publications={publications}
        />
    )
}

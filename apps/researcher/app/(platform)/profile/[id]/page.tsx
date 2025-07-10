import React from "react";
import ResearcherProfile from "~researcher/components/researcher-profile";
import {getSession} from "@/packages/lib/auth";
import {getResearcher} from "@/packages/lib/fetchers";
import {toast} from "sonner";

export default async function CompanyHomePage({
                                            params
                                        }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)
    const session = await getSession()

    let userData
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
            userData = response.data
        } else {
            console.error(response.error)
        }
    }

    return (
        <div
            className="bg-red"
        >
            <ResearcherProfile researcherData={userData} />
        </div>
    )
}

import React from "react";
import {getSession} from "@comend/lib/auth";
import {
    getResearcherMetrics, getResearcherPublications, getResearcher
} from "@comend/lib/fetchers";
import PublicResearcherProfile from "@comend/components/public-researcher-profile";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

export default async function ResearcherProfilePage({
                                                        params
                                                    }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)
    const session = await getSession()

    let researcherData
    if (session?.user?.id) {
        const response = await getResearcher(
            session.user.id, 
            id,
            {
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
            }
        );
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

    let metrics
    if (session?.user?.id) {
        const response = await getResearcherMetrics(session.user.id)
        if (response.success) {
            metrics = response.data
        } else {
            console.error(response.error)
        }
    }

    return (
        <div
            className="flex flex-col w-full max-w-7xl mx-auto p-8 gap-4"
        >
            <Link
                href={
                    process.env.NEXT_PUBLIC_VERCEL_ENV
                        ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/researchers`
                        : `http://localhost:3000/app/marketplace/researchers`
                }
                className="inline-flex items-center gap-x-2 hover:underline"
            >
                <ArrowLeft />
                <Store className="h-4 w-4"/>
                Return to marketplace
            </Link>
            <PublicResearcherProfile
                researcherData={researcherData}
                publications={publications}
            />
        </div>
    )
}

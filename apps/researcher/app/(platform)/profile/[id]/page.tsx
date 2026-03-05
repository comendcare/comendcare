import React from "react";
import ResearcherProfile from "~researcher/components/researcher-profile";
import { getSession } from "@comend/lib/auth";
import {
    getResearcher,
    getResearcherPublications,
    getResearcherMetrics,
} from "@comend/lib/fetchers";

export default async function ResearcherProfilePage({
                                                        params,
                                                    }: {
    params: { id: string };
}) {
    const id = decodeURIComponent(params.id);
    const session = await getSession();

    let researcherData: any = undefined;
    let publications: any = undefined;
    let metrics: any = undefined;

    const userId = session?.user?.id;
    if (userId) {
        const researcherPromise = getResearcher(userId, {
            id: true,
            orcid: true,
            title: true,
            user: true,
            country: true,
            website: true,
            groupName: true,
            description: true,
            researchInterests: true,
            therapeuticsOfInterest: true,
            conditionsOfInterest: true,
            genesOfInterest: true,
            affiliations: {
                select: {
                    institution: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            createdAt: true,
            updatedAt: true,
            metadata: true,
        });

        const publicationsPromise = getResearcherPublications(userId);
        const metricsPromise = getResearcherMetrics(userId);

        const [researcherRes, publicationsRes, metricsRes] = await Promise.allSettled([
            researcherPromise,
            publicationsPromise,
            metricsPromise,
        ]);

        if (researcherRes.status === "fulfilled") {
            if (researcherRes.value.success) researcherData = researcherRes.value.data;
            else console.error(researcherRes.value.error);
        } else {
            console.error(researcherRes.reason);
        }

        if (publicationsRes.status === "fulfilled") {
            if (publicationsRes.value.success) publications = publicationsRes.value.data;
            else console.error(publicationsRes.value.error);
        } else {
            console.error(publicationsRes.reason);
        }

        if (metricsRes.status === "fulfilled") {
            if (metricsRes.value.success) metrics = metricsRes.value.data;
            else console.error(metricsRes.value.error);
        } else {
            console.error(metricsRes.reason);
        }
    }

    return (
        <ResearcherProfile
            researcherData={researcherData}
            publications={publications}
            metrics={metrics}
        />
    );
}
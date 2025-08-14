import React from "react";
import {getSession} from "@/packages/lib/auth";
import {getResearcherRequest} from "@comend/lib/fetchers";
import RequestPage from "@comend/components/requests/request-page"

export default async function ResearcherRequestsPage({
                                                         params
                                                     }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)
    const session = await getSession()

    let requestData
    if (session?.user?.id) {
        const response = await getResearcherRequest(session.user.id, {
            where: {
                id
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                organization: true,
                organizationId: true,
                researcher: true,
                researcherId: true,
                createdAt: true,
                updatedAt: true,
                openToCollab: true,
                studyTitle: true,
                studyDescription: true,
                justification: true,
                hasIrbApproval: true,
                irbStatus: true,
                hasRisks: true,
                riskDescription: true,
                disseminationPlan: true,
                patientSignificance: true,
                otherSampleType: true,
                sampleCount: true,
                processingRequirements: true,
                timeline: true,
                logisticsContact: true,
                providesCollectionKit: true,
                needsCollectionMaterials: true,
                participantCompensation: true,
                compensationDetails: true,
                shippingAddress: true,
                fedexAccount: true,
                shippingMethod: true,
                shippingContact: true,
                shippingPhone: true,
                comments: {
                    select: {
                        text: true,
                        author: true,
                        createdAt: true,
                    }
                }
            }
        });
        if (response.success) {
            requestData = response.data
        } else {
            console.error(response.error)
        }
    }

    return (
        <RequestPage requestData={requestData} backLink="/app/requests" />
    )
}

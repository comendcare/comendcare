import { getSession } from "@/packages/lib/auth"
import { getRFP } from "@/packages/lib/fetchers"
import { RFPPage } from "@/packages/components/rfp-page"

export default async function ResearchPlanLayout({params}: {params: { id: string }}) {
    const session = await getSession()
    const response = await getRFP(session?.user.organizationId, params.id, {
        id: true,
        createdAt: true,
        updatedAt: true,
        title: true,
        description: true,
        openTo: true,
        startDate: true,
        endDate: true,
        contacts: true,
        attachments: true,
        budget: true,
        private: true,
        headerImage: true,
        metadata: true,
        organizationId: true,
        organization: true,
        milestones: true,
        companyContactRequestToRFP: true
    })
    let rfp = undefined

    if (response.success && response.data) {
        rfp = response.data
    }

    return (
        <main className="h-full w-full max-w-7xl">
            <RFPPage rfp={rfp} />
        </main>
    )
}

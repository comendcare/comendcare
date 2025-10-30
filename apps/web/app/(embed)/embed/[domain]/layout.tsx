import {ReactNode} from "react"
import {notFound} from "next/navigation"
import {getOrganizationData} from "@comend/lib/fetchers"
import {TooltipProvider} from "@radix-ui/react-tooltip"
import { ComendEmbedBanner } from "~web/components/comend-embed-banner"

export default async function EmbedLayout({
    params,
    children
}: {
    params: { domain: string }
    children: ReactNode
}) {
    const domain = decodeURIComponent(params.domain)
    const data = await getOrganizationData(domain, {
        id: true,
        public: true,
        verified: true,
        published: true,
        name: true,
        description: true,
        contactEmail: true,
        logo: true,
        image: true,
        headerImage: true,
        biopharmaConsentSettings: true,
        subdomain: true,
        customDomain: true,
        statedGoal: true,
        yearFounded: true,
        incorporationStatus: true,
        therapeuticsOfInterest: true,
        therapeuticsInDevelopment: true,
        website: true,
        moneyRaised: true,
        moneyDeployed: true,
        researchBudget: true,
        // address1                  String?
        // address2                  String?
        // formattedAddress          String?
        // city                      String?
        // region                    String?
        // postalCode                String?
        // country                   String?
        // lat                       String?
        // lng                       String?
        createdAt: true,
        updatedAt: true,
        user: true,
        userId: true,
        roadmaps: true,
        members: true,
        clients: true,
        invitations: true,
        membershipRequests: true,
        conditions: true,
        kanban: true,
        milestones: true,
        platformNotifications: true,
        reviews: true,
        savedCompanies: true,
        tools: true,
        rfps: true,
        metadata: true
    })

    if (!data) {
        notFound()
    }
    console.log(data)

    return (
        <div>
            <TooltipProvider>
                <div>
                    {children}
                </div>
                <ComendEmbedBanner />
            </TooltipProvider>
        </div>
    )
}

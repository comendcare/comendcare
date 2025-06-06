import {ReactNode} from "react"
import {notFound} from "next/navigation"
import {getOrganizationData} from "@/lib/fetchers"
import {fontMapper} from "@/styles/fonts"
import {TooltipProvider} from "@radix-ui/react-tooltip"
import {PublicPageNavbar} from "@/components/public-page-navbar";
import { ComendEmbedBanner } from "@/components/comend-embed-banner"

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
        font: true,
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

    return (
        <div className={fontMapper[data.font]}>
            <TooltipProvider>
                <PublicPageNavbar/>
                <div>
                    {children}
                </div>
                <ComendEmbedBanner />
            </TooltipProvider>
        </div>
    )
}
import { PAGRoadmapHeader } from "@/components/pag-roadmap-header";
import { ProfilePhoto } from "@/components/profile-photo";
import { RoadmapsCard } from "@/components/public-roadmap-card";
import { RFPCard } from "@/components/rfp-card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getOrganizationData, getPublicRFP, getPublicRoadmapsForOrganization } from "@/lib/fetchers";
import { formatMoney, standardizeYear } from "@/lib/utils";
import { Building2, Calendar, HandCoins } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EmbeddedResearchPlansPage({params}: {params: {domain: string, rfpId: string}}) {
    const [organization, rfp] = await Promise.all([
        getOrganizationData(params.domain, {
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
        }),
        getPublicRFP(params.rfpId, {
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
            pinned: true,
            metadata: true,
            milestones: true
        })
    ])

    if (!organization) {
        notFound()
    }
    
    return (
        <div
            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
        >
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank">
                            {organization.name}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            {rfp?.title || 'RFP'}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <PAGRoadmapHeader organization={organization} editable={false} embedded={true}/>
            <RFPCard rfp={rfp}/>
        </div>
    )
}
import { PAGRoadmapHeader } from "~web/components/pag-roadmap-header";
import { RoadmapsCard } from "~web/components/public-roadmap-card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@comend/components/ui/breadcrumb";
import { getOrganizationData, getResearchPlans } from "@comend/lib/fetchers";
import { notFound } from "next/navigation";

export default async function EmbeddedResearchPlansPage({params}: {params: {domain: string}}) {
    const organization = await getOrganizationData(params.domain, {
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
        subdomain: true,
        customDomain: true,
        yearFounded: true,
        website: true,
        moneyRaised: true,
        moneyDeployed: true,
        researchBudget: true,
    })

    if (!organization) notFound()

    const {data: researchPlans, pageCount: researchPlansPageCount} = await getResearchPlans(
        organization.id,
        {
            id: true,
            title: true,
            description: true,
            published: true,
            organizationId: true,
            organization: true,
            modalities: true,
            stages: true,
            statuses: true,
            partners: true,
            links: true,
        },
        undefined,
        true, // public only
    )

    return (
        <div
            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
        >
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank">
                            {organization.name}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`} target="_blank">
                            Research Plans
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <PAGRoadmapHeader organization={organization} editable={false} embedded={true}/>
            <RoadmapsCard 
                researchPlans={researchPlans}
                researchPlansPageCount={researchPlansPageCount}
                organization={organization}
            />
        </div>
    )
}

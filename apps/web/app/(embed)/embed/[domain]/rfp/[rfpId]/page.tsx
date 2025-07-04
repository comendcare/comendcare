import { PAGRoadmapHeader } from "~web/components/pag-roadmap-header";
import { RFPCard } from "~web/components/rfp-card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@comend/components/ui/breadcrumb";
import { getOrganizationData, getPublicRFP, getPublicRoadmapsForOrganization } from "@comend/lib/fetchers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EmbeddedRFPPage({params}: {params: {domain: string, rfpId: string}}) {
    const [organization, rfp] = await Promise.all([
        getOrganizationData(params.domain, {
            id: true,
            name: true,
            image: true,
            subdomain: true,
            createdAt: true,
            updatedAt: true,
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
            // pinned: true,
            milestones: true,
            organizationId: true,
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
                        <BreadcrumbLink href={`https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank">
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
            <Link href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}?rfp=${rfp?.id}`} target="_blank" className="w-full">
                <RFPCard rfp={rfp}/>
            </Link>
        </div>
    )
}

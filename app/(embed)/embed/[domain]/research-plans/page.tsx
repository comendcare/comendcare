import { PAGRoadmapHeader } from "@/components/pag-roadmap-header";
import { ProfilePhoto } from "@/components/profile-photo";
import { RoadmapsCard } from "@/components/public-roadmap-card";
import { getOrganizationData, getPublicRoadmapsForOrganization } from "@/lib/fetchers";
import { formatMoney, standardizeYear } from "@/lib/utils";
import { Building2, Calendar, HandCoins } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EmbeddedResearchPlansPage({params}: {params: {domain: string}}) {
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(params.domain),
        getPublicRoadmapsForOrganization(params.domain),
    ])

    if (!organization) {
        notFound()
    }
    
    return (
        <div
            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
        >
            <PAGRoadmapHeader organization={organization} editable={false} />
            <RoadmapsCard roadmaps={roadmaps} organization={organization}/>
        </div>
    )
}
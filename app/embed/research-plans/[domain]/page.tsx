import OrganizationRoadmapPage from "@/app/[domain]/research-plan/page";
import { getOrganizationData, getPublicRoadmapsForOrganization } from "@/lib/fetchers";
import { notFound } from "next/navigation";

export default async function EmbeddedResearchPlansPage({domain}: {domain: string}) {
    // const [organization, roadmaps] = await Promise.all([
    //     getOrganizationData(domain),
    //     getPublicRoadmapsForOrganization(domain),
    // ])

    // if (!organization) {
    //     notFound()
    // }

    console.log(``)
    
    return (
        <OrganizationRoadmapPage params={{domain}}/>
    )
}
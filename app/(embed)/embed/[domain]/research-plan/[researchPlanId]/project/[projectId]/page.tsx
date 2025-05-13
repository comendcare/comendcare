import { ProfilePhoto } from "@/components/profile-photo"
import { getOrganizationData, getPublicRoadmapsForOrganization } from "@/lib/fetchers"
import { cn, formatMoney, standardizeYear } from "@/lib/utils"
import { Building2, Calendar, HandCoins } from "lucide-react"
import { notFound } from "next/navigation"
import Image from "next/image"
import { PublicMilestoneDetails } from "@/components/public-milestone-details"
import { PAGRoadmapHeader } from "@/components/pag-roadmap-header"

export default async function EmbeddedProjectPage({params}: {params: {domain: string, researchPlanId: string, projectId: string}}) {
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(params.domain),
        getPublicRoadmapsForOrganization(params.domain),
    ])

    if (!organization) {
        notFound()
    }

    const roadmap = roadmaps.find(roadmap => roadmap.id === params.researchPlanId)
    const milestone = roadmap?.milestones.find(milestone => milestone.id === params.projectId)

    return (
        <>
            {roadmap ? (
                    <>
                        <div
                            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
                        >
                            <PAGRoadmapHeader organization={organization} editable={false} />
                            <PublicMilestoneDetails 
                                roadmap={roadmap}
                                urlMilestone={milestone?.id || null}
                            />
                        </div>
                    </>
                ) :
                (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Image
                            alt="missing roadmap"
                            src="https://illustrations.popsy.co/gray/success.svg"
                            width={400}
                            height={400}
                            className="dark:hidden"
                        />
                        <Image
                            alt="missing roadmap"
                            src="https://illustrations.popsy.co/white/success.svg"
                            width={400}
                            height={400}
                            className="hidden dark:block"
                        />
                        <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                            No roadmaps yet.
                        </p>
                    </div>
                )
            }
        </>
    )
}
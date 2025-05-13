import { getOrganizationData, getPublicRoadmapsForOrganization } from "@/lib/fetchers"
import { notFound } from "next/navigation"
import {cn, formatMoney, standardizeYear} from "@/lib/utils"
import Image from "next/image"
import {ProfilePhoto} from "@/components/profile-photo";
import React from "react";
import { Building2, Calendar, HandCoins } from "lucide-react"
import { RoadmapCard } from "@/components/public-roadmap-card";
import { PAGRoadmapHeader } from "@/components/pag-roadmap-header";

export default async function EmbeddedResearchPlanPage({params}: {params: {domain: string, researchPlanId: string}}) {
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(params.domain),
        getPublicRoadmapsForOrganization(params.domain),
    ])

    if (!organization) {
        notFound()
    }

    const roadmap = roadmaps.find(roadmap => roadmap.id === params.researchPlanId)

    return (
        <>
            {roadmap ? (
                    <>
                        <div
                            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
                        >
                            <PAGRoadmapHeader organization={organization} editable={false} />
                            <div className={cn(!(roadmap.milestones && roadmap.milestones.length > 0) ? "col-span-full" : "")}>
                                <RoadmapCard
                                    roadmap={roadmap}
                                    subdomain={params.domain || undefined}
                                    isPublic={true}
                                    externalLinks={true}
                                    urlView={'flow'}
                                />
                            </div>
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
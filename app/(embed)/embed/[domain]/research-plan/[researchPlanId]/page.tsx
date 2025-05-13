import { getOrganizationData, getPublicRoadmapsForOrganization } from "@/lib/fetchers"
import { notFound } from "next/navigation"
import {cn, formatMoney, standardizeYear} from "@/lib/utils"
import Image from "next/image"
import {ProfilePhoto} from "@/components/profile-photo";
import React from "react";
import { Building2, Calendar, HandCoins } from "lucide-react"
import { RoadmapCard } from "@/components/public-roadmap-card";

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
                            <div className="w-full flex flex-col md:flex-row mx-auto px-8 gap-4 items-start">
                                    <ProfilePhoto
                                        img={organization.image}
                                        name={organization.name}
                                        className="h-16 w-16 rounded-full"
                                        textSize="small"
                                        editable={false}
                                    />
                                <div className="flex flex-col">
                                    <div className="flex gap-4 justify-between">
                                        <h1 className="text-wrap text-2xl md:text-3xl font-semibold">
                                            {organization?.name}
                                        </h1>
                                    </div>
                                    <div className="w-full flex flex-wrap gap-x-6">
                                        {organization?.moneyRaised !== null && organization?.moneyRaised > 0 &&
                                            <div className="mt-2 flex items-center text-gray-500">
                                                <HandCoins
                                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                                {formatMoney(organization?.moneyRaised)} raised
                                            </div>
                                        }
                                        {organization?.yearFounded && (
                                            <div className="mt-2 flex items-center text-gray-500">
                                                <Calendar
                                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"/>
                                                Founded
                                                in {standardizeYear(organization?.yearFounded ?? "")}
                                            </div>
                                        )}
                                        {organization?.incorporationStatus === "YES" &&
                                            <div className="mt-2 flex items-center text-gray-500">
                                                <Building2
                                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"/>
                                                {`501(c)(3)`}
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>

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
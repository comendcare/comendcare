"use client"
import React, {useEffect, useState} from "react"
import {ScrollArea} from "@comend/components/ui/scroll-area"
import {Separator} from "@comend/components/ui/separator"
import {toast} from "sonner"
import {PubMedPublication} from "~web/types/types";
import { Skeleton } from "@comend/components/ui/skeleton"
import { getProjectRecommendations, getTopPubMedPublications } from "@comend/lib/fetchers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/components/ui/card"
import Image from "next/image"
import { ProfilePhoto } from "@/packages/components/profile-photo"
import { MilestoneTypeBadge } from "./milestone-type-badge"
import { MilestoneTypeOnMilestone, Prisma } from "@prisma/client"

export default function EditMilestoneDetailsProjectsTab({projectId}: {projectId: string}) {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProjectsData() {
            try {
                const response = await getProjectRecommendations(projectId, {
                    id: true,
                    title: true,
                    description: true,
                    organization: true,
                    types: {include: {milestoneType: true}},
                    roadmapId: true,
                })
                if (response?.success && response?.data) {
                    setProjects(response.data)
                } else {
                    toast.error(response?.error ?? "Failed to fetch publications")
                    setProjects([])
                }
            } catch (error) {
                console.error("Error fetching publications:", error)
                toast.error("Couldn't fetch publications")
                setProjects([])
            } finally {
                setLoading(false)
            }
        }

        fetchProjectsData()
    }, [])

    return (
        <ScrollArea
            className="w-full h-[calc(75vh)]"
            type="always"
        >
            <div>
                {loading && (
                    <div className="flex flex-col gap-4">
                        <Skeleton className="w-full h-[230px]"/>
                        <Skeleton className="w-full h-[230px]"/>
                        <Skeleton className="w-full h-[230px]"/>
                    </div>
                )}

                {!loading && projects?.length === 0 && (
                    <Card
                        className="w-full flex flex-col mx-auto justify-center items-center align-center">
                        <CardContent className="flex flex-col gap-4 p-4">
                            <h2 className="text-xl">{`Sorry, we don't have any recommendations for this project`}</h2>
                            <div className="flex justify-center">
                                <Image
                                    alt="No recommendations"
                                    src="https://illustrations.popsy.co/gray/team-idea.svg"
                                    width={300}
                                    height={300}
                                    className="dark:hidden"
                                />
                                <Image
                                    alt="No recommendations"
                                    src="https://illustrations.popsy.co/gray/team-idea.svg"
                                    width={300}
                                    height={300}
                                    className="hidden dark:block"
                                />
                            </div>
                            <p className="text-md">
                                {`Please add more information to your project to generate some recommendations.`}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {projects?.map((project: any) => {
                        return (
                            <React.Fragment key={project.id}>
                                <div className="px-4 py-2">
                                    <a
                                        href={`https://${project.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${project.roadmapId}?project=${project.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="hover:underline">
                                                    {project.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {project.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-4">
                                                <span className="flex gap-2 items-center">
                                                    <ProfilePhoto img={project.organization.image} name={project.organization.name} className="h-8 w-8"/>
                                                    {project.organization.name}
                                                </span>
                                                <span className="flex gap-2 flex-wrap text-sm">
                                                    {(project.types || []).map((type: Prisma.MilestoneTypeOnMilestoneGetPayload<{include: {milestoneType: true}}>, index: number) => (
                                                        <MilestoneTypeBadge label={type.milestoneType.label} key={index}/>
                                                    ))}
                                                </span>
                                            </CardContent>
                                        </Card>
                                    </a>
                                </div>
                                <Separator className="my-2"/>
                            </React.Fragment>
                        )
                    }
                )}
            </div>
        </ScrollArea>
    )
}

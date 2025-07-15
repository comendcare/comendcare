"use client"
import React, {useEffect, useState} from "react"
import {ScrollArea} from "@comend/components/ui/scroll-area"
import {toast} from "sonner"
import { Skeleton } from "@comend/components/ui/skeleton"
import { getProjectRecommendations } from "@comend/lib/fetchers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comend/components/ui/card"
import Image from "next/image"
import { ProfilePhoto } from "@comend/components/profile-photo"
import { MilestoneTypeBadge } from "@comend/components/milestone-type-badge"
import { Prisma } from "@prisma/client"
import StatusButton from "./milestone-status-button"

// shape of the milestone objects that are returned from our call to getProjectRecommendations
const MILESTONE_SELECT = {
    id: true,
    title: true,
    description: true,
    organization: {select: {name: true, image: true, subdomain: true}},
    types: {select: {milestoneType: {select: {id: true, label: true}}}},
    roadmapId: true,
    status: true,
    // notes: true // for example, this will error out, because we exclude the private field 'notes' from the Milestone select
}

export default function EditMilestoneDetailsProjectsTab({projectId}: {projectId: string}) {
    const [projects, setProjects] = useState<Prisma.MilestoneGetPayload<{ select: typeof MILESTONE_SELECT }>[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProjectsData() {
            try {
                const response = await getProjectRecommendations(projectId, MILESTONE_SELECT)
                if (response?.success && response?.data) {
                    setProjects(response.data as any)
                } else {
                    toast.error(response?.error ?? "Failed to fetch projects")
                    setProjects([])
                }
            } catch (error) {
                console.error("Error fetching projects:", error)
                toast.error("Couldn't fetch projects")
                setProjects([])
            } finally {
                setLoading(false)
            }
        }

        fetchProjectsData()
    }, [])

    return (
        <ScrollArea className="w-full h-[calc(75vh)]">
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

                {projects?.map((project, index) => {
                        return (
                            <div key={index} className="px-4 py-2">
                                <a
                                    href={
                                        process.env.NEXT_PUBLIC_ROOT_DOMAIN 
                                            ? `http://${project.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${project.roadmapId}?project=${project.id}`
                                            : `https://${project.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${project.roadmapId}?project=${project.id}`
                                    }
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
                                                {project.status && (
                                                    <StatusButton status={project.status as any} disabled={true} onStatusChange={() => {}}/>
                                                )}
                                                {(project.types || []).map((type, index) => (
                                                    <MilestoneTypeBadge label={type.milestoneType.label} key={index}/>
                                                ))}
                                            </span>
                                        </CardContent>
                                    </Card>
                                </a>
                            </div>
                        )
                    }
                )}
            </div>
        </ScrollArea>
    )
}

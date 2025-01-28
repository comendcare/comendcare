"use client"
import {Button} from "@/components/ui/button";
import {useSession} from "next-auth/react"
import {useRouter} from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { createRoadmap } from "@/lib/actions";
import { FaCheck } from "react-icons/fa6";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { CheckBubble } from "./check-bubble";
import { templateMilestones, templateRoadmaps, emptyMilestoneTemplate, emptyRoadmapTemplate } from '@/lib/templates'
import ComendLoadingSpinner from "./comend-loading-spinner";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { initializeRoadmapState } from "@/lib/initialize-client-state";

const selector = (state: RoadmapState) => ({
    // initializeRoadmapState: state.initState,
    setRoadmapId: state.setRoadmapId
})

export default function NewRoadmapForm() {
    const {data: session} = useSession()
    const router = useRouter()
    const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])
    const [selectedRoadmap, setSelectedRoadmap] = useState<any>(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const { setRoadmapId } = useRoadmapStore(useShallow(selector))

    async function createTemplateRoadmap(roadmapData: any) {
        setIsLoading(true)
        if (session?.user?.organizationId) {
            const roadmap = await createRoadmap(session.user.organizationId, roadmapData)
            if (!roadmap) {
                toast.error("something went wrong, please refresh the page")
                return
            }

            // setRoadmapId(roadmap.id) // manually set roadmap ID
            // initializeRoadmapState({
            //     nodes: roadmap.nodes,
            //     milestones: roadmap.milestones,
            //     edges: roadmap.edges,
            //     selectedNodeId: null,
            //     roadmapId: roadmap.id
            // })
            router.refresh()
        } else {
            console.error(`organization id is not defined in the session:`, session)
        }
    }

    if (isLoading) {
        return <ComendLoadingSpinner />
    }

    return (
        <ScrollArea className="h-full w-full">
            <div className="flex flex-col justify-left gap-12 p-20">
                <span className="flex flex-col gap-2">
                    <h1 className="text-3xl text-bold text-primary">
                        {`Get going faster with a Milestone or Research Plan Template`}
                    </h1>
                    <p className="text-muted-foreground">
                        {`Milestones are the nodes that make up your Research Plan. We've put together some templates to get you started.`}
                    </p>
                </span>

                <div className="flex flex-col gap-2 w-full">
                <h2 className="text-xl text-bold">Start from a Milestone Template</h2>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true
                    }}
                    className="w-full overflow-visible"
                >
                    <CarouselContent className="overflow-visible p-2">
                        {templateMilestones.map((milestoneData, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 2xl:basis-1/4 overflow-visible">
                                <Card className="relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible">
                                    <CardHeader>
                                        <CheckBubble data={milestoneData} onCheckedChanged={
                                            (checked: boolean) => {
                                                if (checked) {
                                                    setSelectedMilestones([...selectedMilestones, milestoneData])
                                                } else {
                                                    setSelectedMilestones(selectedMilestones.filter(m => (
                                                        m.title !== milestoneData.title &&
                                                        m.description !== milestoneData.description
                                                    )))
                                                }
                                            }
                                        }/>
                                        <CardTitle>{milestoneData.title}</CardTitle>
                                        <CardDescription>
                                            {milestoneData.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-8 overflow-visible">
                                        {/* <ul className="flex flex-col gap-2">
                                            {milestoneData.tasks?.map((task: Task, index) => (
                                                <li key={index} className="flex flex-row gap-2 items-center">
                                                    <FaCheck size={20} className="h-4 w-4 text-green-500"/>
                                                    <p className="grow">{task.name}</p>
                                                </li>
                                            ))}
                                        </ul> */}
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>

                <span className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-row space-x-2">
                    <Button
                        disabled={selectedMilestones.length === 0}
                        onClick={() => {
                            createTemplateRoadmap({
                                title: '',
                                description: '',
                                milestones: selectedMilestones
                            })
                        }}
                    >
                        Create a Research Plan with selected Milestones
                    </Button>
                </div>
                <div className="flex flex-row space-x-2">
                    <Button 
                        variant="secondary"
                        onClick={() => createTemplateRoadmap({
                            ...emptyRoadmapTemplate,
                            milestones: [emptyMilestoneTemplate]
                        })}
                    >
                        Create an empty Milestone
                    </Button>
                </div>
                </span>
                </div>

                <div className="flex flex-col gap-2">
                <h2 className="text-xl text-bold">Start from a Research Plan Template</h2>
                <Carousel
                    opts={{
                        align: "start"
                    }}
                    className="w-full"
                >
                    <CarouselContent className="overflow-visible p-2">
                        {templateRoadmaps.map((roadmapData, index) => (
                            <CarouselItem key={index} className="xl:basis-1/2 overflow-visible">
                                <Card className="relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible" >
                                    <CardHeader>
                                        <CheckBubble data={roadmapData} onCheckedChanged={
                                            (checked: boolean) => {
                                                if (checked) {
                                                    setSelectedRoadmap(roadmapData)
                                                } else {
                                                    setSelectedRoadmap(undefined)
                                                }
                                            }
                                        }/>
                                        <CardTitle>{roadmapData.title}</CardTitle>
                                        <CardDescription>
                                            {roadmapData.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-2">
                                        <h5 className="text-lg">Research Plan Milestones</h5>
                                        <ul className="flex flex-col gap-2">
                                            {roadmapData.milestones?.map((milestone, index) => (
                                                <li key={index} className="flex flex-row gap-2 items-center">
                                                    <FaCheck size={20} className="h-4 w-4 text-green-500"/>
                                                    <p className="grow">{milestone.title}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>

                <span className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-row space-x-2">
                        <Button 
                            disabled={!selectedRoadmap}
                            onClick={() => createTemplateRoadmap(selectedRoadmap)}
                        >
                            Create a Research Plan  from selected Template
                        </Button>
                    </div>
                    <div className="flex flex-row space-x-2">
                        <Button 
                            variant="secondary"
                            onClick={() => createTemplateRoadmap(emptyRoadmapTemplate)}
                        >
                            Create an empty Research Plan
                        </Button>
                    </div>
                </span>
                </div>
            </div>
        </ScrollArea>
    )
}


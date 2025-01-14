"use client"

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { FaCheck } from "react-icons/fa6";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { CheckBubble } from "./check-bubble";
import { templateMilestones, templateRoadmaps } from '@/lib/templates'
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { nanoid } from "nanoid";
import type { Node } from "@xyflow/react"
import ComendLoadingSpinner from "./comend-loading-spinner";

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNodes: state.addNodes,
})

export default function RoadmapTemplates() {
    const router = useRouter()
    const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])
    const [selectedRoadmap, setSelectedRoadmap] = useState<any>(undefined)
    const [isLoading, setIsLoading] = useState(false)

    const {
        addNodes,
    } = useRoadmapStore(useShallow(selector))

    const addMilestones = (newMilestones: any[]) => {
        const newNodes: any[] = []
        let centerX = 0
        let centerY = 0

        newMilestones.forEach(defaultData => {
            const id = nanoid()
            const newNode: Node = {
                id: id,
                type: "MILESTONE",
                position: {
                    x: centerX,
                    y: centerY
                },
                data: {
                    id: nanoid(),
                    nodeId: id,
                    type: defaultData?.type || 'NOTYPE',
                    title: defaultData?.title || `New Milestone`,
                    ...(defaultData?.description ? { description: defaultData.description } : undefined),
                    // papers: defaultData?.papers || [],
                    // tasks: defaultData?.tasks || [],
                    status: defaultData?.status || "TODO"
                }
            }

            centerX += 200
            centerY += 200

            newNodes.push(newNode)
        })

        addNodes(newNodes)
        return newNodes
    }

    if (isLoading) {
        return (
            <ComendLoadingSpinner />
        )
    }

    return (
        <ScrollArea className="h-full w-full">
            <div className="flex flex-col justify-left gap-12 p-20">
                <span className="flex flex-col gap-2">
                    <h1 className="text-3xl text-bold text-primary">
                        {`Expand your Research Plan faster with a Milestone or Research Plan Template`}
                    </h1>
                    <p className="text-muted-foreground">
                        {`Milestones are the nodes that make up your Research Plan. We've put together some templates to get you started.`}
                    </p>
                </span>

                <div className="flex flex-col gap-2 w-full">
                <h2 className="text-xl text-bold">Add Milestones from a template</h2>
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
                            setIsLoading(true)
                            const newNodes = addMilestones(selectedMilestones)
                            setTimeout(() => {
                                router.push('/app/research-plan')
                            }, 1000)
                        }}
                    >
                        Add selected milestones
                    </Button>
                </div>
                <div className="flex flex-row space-x-2">
                    <Button 
                        variant="secondary"
                        onClick={() => {
                            setIsLoading(true)
                            const newNode = addMilestones([{name: 'New Milestone'}])
                            setTimeout(() => {
                                router.push('/app/research-plan')
                            }, 1000)
                        }}
                    >
                        Add an empty milestone
                    </Button>
                </div>
                </span>
                </div>

                <div className="flex flex-col gap-2">
                <h2 className="text-xl text-bold">Add milestone from a Research Plan Template</h2>
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
                            onClick={() => {
                                setIsLoading(true)
                                const newNodes = addMilestones(selectedRoadmap.milestones)
                                setTimeout(() => {
                                    router.push('/app/research-plan')
                                }, 1000)
                            }}
                        >
                            Add milestones from selected Template
                        </Button>
                    </div>
                </span>
                </div>
            </div>
        </ScrollArea>
    )
}


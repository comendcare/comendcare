"use client"

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { FaCheck } from "react-icons/fa6";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { useState } from "react";
import { CheckBubble } from "./check-bubble";
import { templateMilestones, templateRoadmaps } from '@/lib/templates'
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { nanoid } from "nanoid";
import type { Node } from "@xyflow/react"
import ComendLoadingSpinner from "./comend-loading-spinner";
import { Badge } from "./ui/badge";
import { NODE_TYPE_OPTIONS } from "@/lib/types";
import { MilestoneTemplateCard } from "./milestone-template-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const selector = (state: RoadmapState) => ({
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

    const addMilestones = async (newMilestones: any[]) => {
        const newNodes: any[] = []
        let centerX = 0
        let centerY = 0

        newMilestones.forEach(defaultData => {
            const id = nanoid()
            const newNode: Node = {
                id: id,
                type: defaultData?.nodeType || "MILESTONE",
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
                    status: defaultData?.status || "PLANNED"
                }
            }

            centerX += 500
            // centerY += 200

            newNodes.push(newNode)
        })

        const nodes = await addNodes(newNodes)
        return nodes
    }

    if (isLoading) {
        return (
            <ComendLoadingSpinner />
        )
    }

    return (
        <div className="w-full h-full flex flex-col justify-left gap-12 p-14">
            <span className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-primary">
                    {`Expand your Research Plan faster with an Asset, Milestone, or Project template`}
                </h1>
                <p className="text-muted-foreground">
                    {`Assets, Milestones, and Projects are the nodes that make up your Research Plan. We've put together some templates to get you started.`}
                </p>
            </span>

            <div className="flex flex-col gap-4 w-full flex-1 overflow-hidden">
                <Tabs defaultValue="MILESTONE" className="flex-1 grow flex flex-col items-start">
                    <TabsList>
                        <TabsTrigger value="ASSET">Assets</TabsTrigger>
                        <TabsTrigger value="MILESTONE">Milestones</TabsTrigger>
                        <TabsTrigger value="PROJECT">Projects</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ASSET" className="flex-1 h-full w-full">
                        <ScrollArea className="flex-1 h-full w-full" type="always">
                            <div className="w-full grid grid-cols-2 gap-4 pr-5 pt-2">
                                {templateMilestones.filter((template) => template.nodeType === "ASSET").map((milestoneData, index) => (
                                    <MilestoneTemplateCard 
                                        key={index} 
                                        milestoneData={milestoneData}
                                        selectedMilestones={selectedMilestones}
                                        setSelectedMilestones={setSelectedMilestones}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="MILESTONE" className="flex-1 h-full w-full">
                        <ScrollArea className="flex-1 h-full w-full" type="always">
                            <div className="w-full grid grid-cols-2 gap-4 pr-5 pt-2">
                                {templateMilestones.filter((template) => template.nodeType === "MILESTONE").map((milestoneData, index) => (
                                    <MilestoneTemplateCard 
                                        key={index} 
                                        milestoneData={milestoneData}
                                        selectedMilestones={selectedMilestones}
                                        setSelectedMilestones={setSelectedMilestones}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="PROJECT" className="flex-1 h-full w-full">
                        <ScrollArea className="flex-1 h-full w-full" type="always">
                            <div className="w-full grid grid-cols-2 gap-4 pr-5 pt-2">
                                {templateMilestones.filter((template) => template.nodeType === "PROJECT").map((milestoneData, index) => (
                                    <MilestoneTemplateCard 
                                        key={index} 
                                        milestoneData={milestoneData}
                                        selectedMilestones={selectedMilestones}
                                        setSelectedMilestones={setSelectedMilestones}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <span className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-row space-x-2">
                        <Button
                            disabled={selectedMilestones.length === 0}
                            onClick={async () => {
                                setIsLoading(true)
                                await addMilestones(selectedMilestones)
                                router.push('/app/research-plan')
                            }}
                        >
                            Add selected nodes
                        </Button>
                    </div>
                    <div className="flex flex-row space-x-2">
                        <Button 
                            variant="secondary"
                            onClick={async () => {
                                setIsLoading(true)
                                await addMilestones([{name: 'New Milestone'}])
                                router.push('/app/research-plan')
                            }}
                        >
                            Add an empty node
                        </Button>
                    </div>
                </span>
            </div>
        </div>
    )
}


"use client"

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import { ScrollArea} from "./ui/scroll-area";
import { useState } from "react";
import { templateMilestones } from '@/lib/templates'
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { nanoid } from "nanoid";
import type { Node } from "@xyflow/react"
import ComendLoadingSpinner from "./comend-loading-spinner";
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
    const [filter, setFilter] = useState("PROJECT")

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
                type: defaultData?.nodeType || "PROJECT",
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

            <div className="min-h-0 h-full flex flex-col">
                <Tabs defaultValue={filter} onValueChange={(value) => setFilter(value)} className="flex-1 flex flex-col min-h-0 items-start">
                    <TabsList>
                        <TabsTrigger value="ASSET">Assets</TabsTrigger>
                        <TabsTrigger value="PROJECT">Projects</TabsTrigger>
                        <TabsTrigger value="RFP">{`RFPs (Requests for Proposal)`}</TabsTrigger>
                    </TabsList>
                    {filter === "ASSET" && (
                        // have to hide these due to the flex implementation to get the scroll area working
                        <TabsContent value="ASSET" className="flex-1 flex flex-col min-h-0">
                            <ScrollArea className="h-0 flex-1 w-full" type="always">
                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
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
                    )}
                    {filter === "PROJECT" && (
                        // have to hide these due to the flex implementation to get the scroll area working
                        <TabsContent value="PROJECT" className="flex-1 flex flex-col min-h-0">
                            <ScrollArea className="h-0 flex-1 w-full" type="always">
                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
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
                    )}
                    {filter === "RFP" && (
                        // have to hide these due to the flex implementation to get the scroll area working
                        <TabsContent value="RFP" className="flex-1 flex flex-col min-h-0">
                            <ScrollArea className="h-0 flex-1 w-full" type="always">
                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
                                    {templateMilestones.filter((template) => template.nodeType === "RFP").map((milestoneData, index) => (
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
                    )}
                </Tabs>
            </div>

            <span className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-row space-x-2">
                    <Button
                        disabled={selectedMilestones.length === 0}
                        onClick={async () => {
                            setIsLoading(true)
                            await addMilestones(selectedMilestones)
                            router.push('/app/research-plan')
                            router.refresh()
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
                            router.refresh()
                        }}
                    >
                        Add an empty node
                    </Button>
                </div>
            </span>
        </div>
    )
}


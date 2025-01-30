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
import { Badge } from "./ui/badge";
import { NODE_TYPE_OPTIONS } from "@/lib/types";
import { MilestoneTemplateCard } from "./milestone-template-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
    const [filter, setFilter] = useState("MILESTONE")

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
        <div className="w-full h-full flex flex-col justify-left gap-12 p-14">
            <span className="flex flex-col gap-2">
                <h1 className="text-3xl text-bold text-primary">
                    {`Get going faster with an Asset, Milestone, or Project template`}
                </h1>
                <p className="text-muted-foreground">
                    {`Assets, Milestones, and Projectes are the nodes that make up your Research Plan. We've put together some templates to get you started.`}
                </p>
            </span>


            <div className="min-h-0 h-full flex flex-col">
                <Tabs defaultValue={filter} onValueChange={(value) => setFilter(value)} className="flex-1 flex flex-col min-h-0 items-start">
                    <TabsList>
                        <TabsTrigger value="ASSET">Assets</TabsTrigger>
                        <TabsTrigger value="MILESTONE">Milestones</TabsTrigger>
                        <TabsTrigger value="PROJECT">Projects</TabsTrigger>
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
                    {filter === "MILESTONE" && (
                        // have to hide these due to the flex implementation to get the scroll area working
                        <TabsContent value="MILESTONE" className="flex-1 flex flex-col min-h-0">
                            <ScrollArea className="h-0 flex-1 w-full" type="always">
                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
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
                </Tabs>
            </div>

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
                        Create a Research Plan with selected nodes
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
                        Create an empty node
                    </Button>
                </div>
            </span>
        </div>
    )
}


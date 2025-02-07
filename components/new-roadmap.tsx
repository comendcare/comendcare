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
import { FaInfoCircle } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MilestoneTemplateTabs } from "./roadmap-templates";

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
            // router.refresh() // refresh to reflect changes
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
                    {`Get going faster with an Asset, Project, or RFP (Request for Proposals) template`}
                </h1>
                <p className="text-muted-foreground">
                    {`Assets, Projects, and RFPs (Requests for Proposals) are the milestones that make up your Research Plan. We've put together some templates to get you started.`}
                </p>
            </span>


            <MilestoneTemplateTabs 
                selectedMilestones={selectedMilestones}
                setSelectedMilestones={setSelectedMilestones}
            />

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
                        Create a Research Plan with selected milestones
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
                        Create an empty milestone
                    </Button>
                </div>
            </span>
        </div>
    )
}


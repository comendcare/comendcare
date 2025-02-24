"use client"

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import { ScrollArea} from "./ui/scroll-area";
import { MouseEventHandler, SetStateAction, useState } from "react";
import { templateMilestones } from '@/lib/templates'
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { nanoid } from "nanoid";
import type { Node } from "@xyflow/react"
import ComendLoadingSpinner from "./comend-loading-spinner";
import { MilestoneTemplateCard } from "./milestone-template-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FaInfoCircle, FaPlus } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { NODE_TYPE_OPTIONS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DialogClose } from "./ui/dialog";

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
                type: defaultData?.nodeType || "PROJECT",
                position: {
                    x: centerX,
                    y: centerY
                },
                data: {
                    id: nanoid(),
                    nodeId: id,
                    types: defaultData?.types || [],
                    title: defaultData?.title || `New Milestone`,
                    ...(defaultData?.description ? { description: defaultData.description } : undefined),
                    status: defaultData?.status || "PLANNED",
                    private: true
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
                    {`Browse our milestone library`}
                </h1>
                <p className="text-muted-foreground">
                    {`Milestones are the pieces that make up your research plan. Add a template to your plan to see more information on milestones like recommended steps.`}
                </p>
            </span>

            <MilestoneTemplateTabs 
                selectedMilestones={selectedMilestones}
                setSelectedMilestones={setSelectedMilestones}
                createEmpty={async () => {
                    setIsLoading(true)
                    await addMilestones([{name: 'New Milestone'}])
                    router.push('/app/research-plan')
                    router.refresh()
                }}
            />

            <span className="flex flex-col justify-end sm:flex-row gap-4">
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
                        Add selected milestones
                    </Button>
                </div>
                {/* <div className="flex flex-row space-x-2">
                    <Button 
                        variant="secondary"
                        onClick={async () => {
                            setIsLoading(true)
                            await addMilestones([{name: 'New Milestone'}])
                            router.push('/app/research-plan')
                            router.refresh()
                        }}
                    >
                        <FaPlus />
                        Create an empty milestone
                    </Button>
                </div> */}
            </span>
        </div>
    )
}

export const MilestoneTemplateTabs = ({ selectedMilestones, setSelectedMilestones, createEmpty, inDialog = false }: {selectedMilestones: any[], setSelectedMilestones: (value: SetStateAction<any[]>) => void, createEmpty: () => void, inDialog?: boolean}) => {
    const [filter, setFilter] = useState("PROJECT")

    return (
        <div className="min-h-0 h-full flex flex-col">
            <Tabs defaultValue={filter} onValueChange={(value) => setFilter(value)} className="flex-1 flex flex-col min-h-0 items-start">
                {/* <TabsList>
                    {NODE_TYPE_OPTIONS.map(({label, value, description}, index) => (
                        <TabsTrigger key={index} value={value} className="flex gap-2">
                            {label}
                            <Tooltip>
                                <TooltipTrigger>
                                    <FaInfoCircle />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left">
                                        {description}
                                </TooltipContent>
                            </Tooltip>
                        </TabsTrigger>
                    ))}
                </TabsList> */}
                {filter === "ASSET" && (
                    // have to hide these due to the flex implementation to get the scroll area working
                    <TabsContent value="ASSET" className="flex-1 flex flex-col min-h-0">
                        <ScrollArea className="h-0 flex-1 w-full" type="always">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
                                <EmptyMilestoneCard handleClick={(e) => createEmpty()} inDialog={inDialog}/>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
                                <EmptyMilestoneCard handleClick={(e) => createEmpty()} inDialog={inDialog}/>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
                                <EmptyMilestoneCard handleClick={(e) => createEmpty()} inDialog={inDialog}/>
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
    )
}

const EmptyMilestoneCard = ({handleClick, inDialog}: {handleClick: (event: any) => void, inDialog: boolean}) => {
    if (inDialog) {
        return (
            <DialogClose className="p-0 m-0">
                <Button 
                    variant="secondary"
                    onClick={handleClick}
                    asChild
                >
                    <Card className="h-full w-full bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible">
                        <CardContent className="flex flex-col justify-center items-center gap-4 p-10 m-0 text-wrap text-center">
                            <CardTitle>{`Create an empty milestone`}</CardTitle>
                            <FaPlus />
                        </CardContent>
                    </Card>
                </Button>
            </DialogClose>
        )
    }

    return (
        <Button 
            variant="secondary"
            onClick={handleClick}
            asChild
        >
            <Card className="h-full bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible">
                <CardContent className="flex flex-col justify-center items-center gap-4 p-10 m-0 text-wrap text-center">
                    <CardTitle>{`Create an empty milestone`}</CardTitle>
                    <FaPlus />
                </CardContent>
            </Card>
        </Button>
    )
}

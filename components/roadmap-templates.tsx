"use client"

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import { ScrollArea} from "./ui/scroll-area";
import { SetStateAction, useState } from "react";
import { templateMilestones } from '@/lib/templates'
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import ComendLoadingSpinner from "./comend-loading-spinner";
import { MilestoneTemplateCardMultiSelect, MilestoneTemplateCardSingleSelect } from "./milestone-template-card";
import { Card, CardContent, CardTitle } from "./ui/card";
import { DialogClose } from "./ui/dialog";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const selector = (state: RoadmapState) => ({
    milestones: state.milestones,
    addNodes: state.addNodes,
})

export default function RoadmapTemplates() {
    const router = useRouter()
    const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const {
        milestones,
        addNodes,
    } = useRoadmapStore(useShallow(selector))

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
                    {`Projects are the pieces that make up your research plan. Add a template to your plan to see more information on projects like recommended steps.`}
                </p>
            </span>

            <MilestoneTemplateTabs 
                selectedMilestones={selectedMilestones}
                setSelectedMilestones={setSelectedMilestones}
                createEmpty={async () => {
                    setIsLoading(true)
                    // await addMilestones([{name: 'New Milestone'}])
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
                            // await addMilestones(selectedMilestones)
                            router.push('/app/research-plan')
                            router.refresh()
                        }}
                    >
                        Add selected projects
                    </Button>
                </div>
            </span>
        </div>
    )
}

export const MilestoneTemplateTabs = ({ selectedMilestones, setSelectedMilestones, createEmpty, inDialog = false }: {selectedMilestones: any[], setSelectedMilestones: (value: SetStateAction<any[]>) => void, createEmpty: () => void, inDialog?: boolean}) => {
    return (
        <div className="min-h-0 h-full flex flex-col">
            <ScrollArea className="h-0 flex-1 w-full" type="always">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
                    <EmptyMilestoneCard handleClick={(e) => createEmpty()} inDialog={inDialog}/>
                    {templateMilestones.map((milestoneData, index) => (
                        <MilestoneTemplateCardMultiSelect
                            key={index} 
                            milestoneData={milestoneData}
                            selectedMilestones={selectedMilestones}
                            setSelectedMilestones={setSelectedMilestones}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export const MilestoneTemplates = ({ selectedMilestonesTemplate, setSelectedMilestonesTemplate, createEmpty, inDialog = false }: {selectedMilestonesTemplate: any, setSelectedMilestonesTemplate: (value: SetStateAction<any>) => void, createEmpty: () => void, inDialog?: boolean}) => {
    const allCategories = Array.from(new Set(templateMilestones.flatMap(template => template.categories))) || []
    
    return(
        <div className="h-[50vh] max-h-[50vh]">
        <ScrollArea type="always" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
                {allCategories.map((category, index) => (
                    <>
                        <h3 key={`category-title-${index}`} className="col-span-full text-lg">{String(category).charAt(0).toUpperCase() + String(category).slice(1)}</h3>
                        {templateMilestones.filter(milestone => milestone.categories.includes(category)).map((milestoneData, index) => (
                            <MilestoneTemplateCardMultiSelect 
                                milestoneData={milestoneData}
                                selectedMilestones={selectedMilestonesTemplate}
                                setSelectedMilestones={setSelectedMilestonesTemplate}
                            />
                        ))}
                    </>
                ))}
            </div>
        </ScrollArea>
        </div>
    )
}

export const ResearchPlanTemplates = ({ selectedMilestonesTemplate, setSelectedMilestonesTemplate, createEmpty, inDialog = false }: {selectedMilestonesTemplate: any, setSelectedMilestonesTemplate: (value: SetStateAction<any>) => void, createEmpty: () => void, inDialog?: boolean}) => {
    const allCategories = Array.from(new Set(templateMilestones.flatMap(template => template.categories))) || []
    
    return(
        <div className="h-[50vh] max-h-[50vh]">
        <ScrollArea type="always" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
                {/* {allCategories.map((category, index) => (
                    <>
                        <h3 key={`category-title-${index}`} className="col-span-full text-lg">{String(category).charAt(0).toUpperCase() + String(category).slice(1)}</h3>
                        {templateMilestones.filter(milestone => milestone.categories.includes(category)).map((milestoneData, index) => (
                            <MilestoneTemplateCardMultiSelect 
                                milestoneData={milestoneData}
                                selectedMilestones={selectedMilestonesTemplate}
                                setSelectedMilestones={setSelectedMilestonesTemplate}
                            />
                        ))}
                    </>
                ))} */}
            </div>
        </ScrollArea>
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
                    className="hover:cursor-pointer"
                >
                    <Card className="h-full w-full bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible">
                        <CardContent className="flex flex-col justify-center items-center gap-4 p-10 m-0 text-wrap text-center">
                            <CardTitle>{`Create an empty milestone`}</CardTitle>
                            <Plus />
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
            className="hover:cursor-pointer"
        >
            <Card className="h-full bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible">
                <CardContent className="flex flex-col justify-center items-center gap-4 p-10 m-0 text-wrap text-center">
                    <CardTitle>{`Create an empty milestone`}</CardTitle>
                    <Plus />
                </CardContent>
            </Card>
        </Button>
    )
}

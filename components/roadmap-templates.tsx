"use client"

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import { ScrollArea} from "./ui/scroll-area";
import { SetStateAction, useState } from "react";
import { templateMilestones, templateResearchPlans } from '@/lib/templates'
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import ComendLoadingSpinner from "./comend-loading-spinner";
import { EmptyResearchPlanCard, MilestoneTemplateCardMultiSelect, ResearchPlanTemplateCardSelect } from "./milestone-template-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DialogClose } from "./ui/dialog";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASSOCIATED_CATEGORIES } from "@/lib/types";
import { MilestoneType } from "@prisma/client";
import { createRoadmap } from "@/lib/actions";

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

export const MilestoneTemplates = ({ 
    selectedMilestonesTemplate, 
    setSelectedMilestonesTemplate, 
    createEmpty, 
    inDialog = false, 
    className 
}: {
    selectedMilestonesTemplate: any, 
    setSelectedMilestonesTemplate: (value: SetStateAction<any>) => void, 
    createEmpty: () => void, 
    inDialog?: boolean,
    className?: string
}) => {
    const allCategories = Array.from(new Set(templateMilestones.flatMap(template => template.categories))) || []
    
    return(
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-5 pt-2", className)}>
            {/* {allCategories.map((category, index) => (
                <>
                    <h3 key={`category-title-${index}`} className="col-span-full text-2xl font-semibold">{String(category).charAt(0).toUpperCase() + String(category).slice(1)}</h3>
                    {ASSOCIATED_CATEGORIES.find(c => c.label === category) && <p>{ASSOCIATED_CATEGORIES.find(c => c.label === category)?.description}</p>}
                    {templateMilestones.filter(milestone => milestone.categories.includes(category)).map((milestoneData, index) => (
                        <MilestoneTemplateCardMultiSelect 
                            className={index === 0 ? "onborda-select-a-template": ""}
                            milestoneData={milestoneData}
                            selectedMilestones={selectedMilestonesTemplate}
                            setSelectedMilestones={setSelectedMilestonesTemplate}
                        />
                    ))}
                </>
            ))} */}
            {ASSOCIATED_CATEGORIES.map((categoryData, index) => (
                <>
                    <div className={cn("col-span-full", index !== 0 ? "mt-8" : "")}>
                    <h3 key={`category-title-${index}`} className="text-2xl font-semibold">{categoryData.label}</h3>
                    <p>{categoryData.description}</p>
                    </div>
                    {templateMilestones.filter(milestone => milestone.categories.includes(categoryData.value)).map((milestoneData, index) => (
                        <MilestoneTemplateCardMultiSelect 
                            className={index === 0 ? "onborda-select-a-template": ""}
                            milestoneData={milestoneData}
                            selectedMilestones={selectedMilestonesTemplate}
                            setSelectedMilestones={setSelectedMilestonesTemplate}
                        />
                    ))}
                </>
            ))}
        </div>
    )
}

// export const ResearchPlanTemplates = ({ milestoneTypes }: {milestoneTypes: any[]}) => {
//     return(
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
//             <EmptyResearchPlanCard />
//             {templateResearchPlans.map(template => (
//                 <ResearchPlanTemplateCardSelect
//                     milestoneTypes={milestoneTypes} 
//                     researchPlanData={template}
//                 />
//             ))}
//         </div>
//     )
// }

export const ResearchPlanTemplates = ({ selectedMilestonesTemplate, setSelectedMilestonesTemplate, inDialog = false }: {selectedMilestonesTemplate: any, setSelectedMilestonesTemplate: (value: SetStateAction<any>) => void, inDialog?: boolean}) => {
    const [selectedResearchPlanId, setSelectedResearchPlanId] = useState<string | undefined>(undefined)

    const handleSetSelectedResearchPlan = (researchPlanData: any) => {
        console.log(`handle set selected research plan`, researchPlanData)
        if (researchPlanData) {
            setSelectedResearchPlanId(researchPlanData.title)
            setSelectedMilestonesTemplate(researchPlanData.milestones)
        } else {
            setSelectedResearchPlanId(undefined)
            setSelectedMilestonesTemplate([])
        }
    }
    
    return(
        <div className="h-[50vh] max-h-[50vh]">
        <ScrollArea type="always" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-5 pt-2">
                {templateResearchPlans.map(template => (
                    <ResearchPlanTemplateCardSelect 
                        researchPlanData={template}
                        selectedResearchPlanId={selectedResearchPlanId}
                        setSelectedResearchPlanId={(id) => id === template.title ? handleSetSelectedResearchPlan(template) : handleSetSelectedResearchPlan(undefined)}
                    />
                ))}
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

export const ResearchPlanTemplatesCard = ({orgId}: {orgId: string}) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    Research Plan Templates
                </CardTitle>
                <CardDescription>Create a research plan from one of our curated templates.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <CreateEmptyResearchPlanCard orgId={orgId} />
                {templateResearchPlans.map(plan => (
                    <CreateResearchPlanFromTemplateCard plan={plan} orgId={orgId}/>
                ))}
            </CardContent>
        </Card>
    )
}

export const CreateEmptyResearchPlanCard = ({orgId}: {orgId: string}) => {
    const router = useRouter()

    return (
        <button
            onClick={async () => {
                const roadmap =  await createRoadmap(orgId, {})
                if (roadmap && roadmap.id) {
                    router.push(`/app/research-plan/${roadmap.id}`)
                }
            }}
            className="hover:cursor-pointer"
        >
            <Card className="h-full">
                <CardContent className="h-full flex flex-col justify-center items-center gap-4 p-10 m-0 text-wrap text-center">
                    <CardTitle className="text-xl font-normal">{`Create an empty Research Plan`}</CardTitle>
                    <Plus />
                </CardContent>
            </Card>
        </button>
    )
}

export const CreateResearchPlanFromTemplateCard = ({plan, orgId}: {plan: typeof templateResearchPlans[0], orgId: string}) => {
    const router = useRouter()

    return (
        <button
            onClick={async () => {
                const roadmap =  await createRoadmap(orgId, plan)
                if (roadmap && roadmap.id) {
                    router.push(`/app/research-plan/${roadmap.id}`)
                }
            }}
            className="hover:cursor-pointer"
        >
            <Card className="text-left h-full">
                <CardHeader>
                    <CardTitle className="text-xl font-normal">{plan.title}</CardTitle>
                    <CardDescription>
                        {plan.description}
                    </CardDescription>
                </CardHeader>
            </Card>
        </button>
    )
}

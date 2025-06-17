"use client"

import React, { SetStateAction, useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "./ui/card"
import { CheckBubble } from "./check-bubble"
import { cn } from "@/lib/utils";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { MilestoneType, MilestoneTypeOnMilestone } from "@prisma/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import mixpanel from "mixpanel-browser";

import {MILESTONE_TYPE_OPTIONS} from "@/lib/types";

const selector = (state: RoadmapState) => ({
    addMilestones: state.addMilestones
})

export function MilestoneTemplateCardMultiSelect({ milestoneData, selectedMilestones, setSelectedMilestones, className }: {milestoneData: any, selectedMilestones: any[], setSelectedMilestones: (value: SetStateAction<any[]>) => void, className?: string}) {
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        if (isChecked) {
            setSelectedMilestones([...selectedMilestones, milestoneData])
        } else {
            setSelectedMilestones(selectedMilestones.filter(m => (
                m.title !== milestoneData.title &&
                m.description !== milestoneData.description
            )))
        }
    }, [isChecked])
    
    return (
        <button onClick={() => {setIsChecked(prev => !prev)}} className={cn(className)}>
            <Card className="h-full relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible hover:bg-secondary cursor-pointer">
                <CheckBubble isChecked={isChecked} onCheckedChanged={(event: any) => setIsChecked(event.value)}/>
                {/* <TypeBadge className="w-fit" type={NODE_TYPE_OPTIONS.find((option) => (option.value === milestoneData?.nodeType))?.value || "PROJECT"}/> */}
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{milestoneData.title}</CardTitle>
                    <CardDescription>
                        {milestoneData.description}
                    </CardDescription>
                </CardHeader>
                {/* <CardContent className="flex flex-col gap-2 overflow-visible">
                    <CardTitle className="text-xl font-semibold">{milestoneData.title}</CardTitle>
                    <CardDescription>
                        {milestoneData.description}
                    </CardDescription>
                </CardContent> */}
            </Card>
        </button>
    )
}

export function EmptyResearchPlanCard() {
    const router = useRouter()

    return (
        <button onClick={() => {
            router.refresh()
        }}>
            <Card className="h-full relative bg-white shadow-sm rounded-lg text-left hover:bg-secondary cursor-pointer pt-6">
                <CardContent className="h-full flex flex-col justify-center items-center gap-2">
                    <CardTitle>{"Start from scratch"}</CardTitle>
                    <Plus className="h-20 w-20"/>
                    <CardDescription>{`Create an empty research plan`}</CardDescription>
                </CardContent>
            </Card>
        </button>
    )
}

// export function ResearchPlanTemplateCardSelect({ researchPlanData, milestoneTypes }: {researchPlanData: any, milestoneTypes: any[]}) {
//     const { addMilestones } = useRoadmapStore(useShallow(selector))

//     return (
//         <button onClick={() => {
//             console.log(`add milestones`, researchPlanData.milestones)
//             addMilestones(researchPlanData.milestones.map((template: any) => {
//                 return ({
//                     nodeType: "PROJECT",
//                     title: template?.title,
//                     description: template?.description,
//                     types: template?.types.map((type: string) => {
//                         const milestoneType = milestoneTypes.find(t => t.id === type)
//                         if (!milestoneType) return // milestone type not found, don't add it to created milestone
//                         return ({ 
//                             milestoneTypeId: type,
//                             milestoneType
//                         })
//                     }).filter((type: Partial<MilestoneTypeOnMilestone> | undefined) => type !== undefined),
//                     status: template?.status,
//                 })
//             }))
//         }}>
//             <Card className="relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible hover:bg-secondary cursor-pointer">
//                 <CardContent className="flex flex-col gap-2 overflow-visible">
//                     <CardHeader>
//                         <CardTitle>{researchPlanData.title}</CardTitle>
//                     </CardHeader>

//                     <ol className="list-decimal pl-4">
//                         {researchPlanData.milestones.map((milestone: any) => (
//                             <li>{milestone.title}</li>
//                         ))}
//                     </ol>
//                 </CardContent>
//             </Card>
//         </button>
//     )
// }

export function ResearchPlanTemplateCardSelect({ researchPlanData, selectedResearchPlanId, setSelectedResearchPlanId }: {researchPlanData: any, selectedResearchPlanId: string | undefined, setSelectedResearchPlanId: (value: SetStateAction<string | undefined>) => void}) {
    return (
        <button onClick={() => {selectedResearchPlanId !== researchPlanData.title ? setSelectedResearchPlanId(researchPlanData.title) : setSelectedResearchPlanId(undefined)}}>
            <Card className="h-full relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible hover:bg-secondary cursor-pointer">
                <CheckBubble isChecked={selectedResearchPlanId === researchPlanData.title} onCheckedChanged={() => {}}/>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        {`${researchPlanData.title}`}
                    </CardTitle>
                    <CardDescription>
                        {`${researchPlanData.description}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ol className="list-decimal pl-4">
                        {researchPlanData.milestones.map((milestone: any) => (
                            <li key={milestone.id}>{milestone.title}</li>
                        ))}
                    </ol>
                </CardContent>
            </Card>
            {/* <Card className="relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible hover:bg-secondary cursor-pointer">
                <CardHeader>
                    <CheckBubble isChecked={isChecked} onCheckedChanged={(event: any) => setIsChecked(event.value)}/>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 overflow-visible">
                    <CardTitle>{`Modality: ${researchPlanData.modalities.map((modalityOption: any)=> modalityOption.label).join(', ')}`}</CardTitle>
                    <ol className="list-decimal pl-4">
                        {researchPlanData.milestones.map((milestone: any) => (
                            <li>{milestone.title}</li>
                        ))}
                    </ol>
                </CardContent>
            </Card> */}
        </button>
    )
}

export function MilestoneTemplateCardSingleSelect({ milestoneData, selectedMilestoneTemplate, setSelectedMilestoneTemplate, className }: {milestoneData: any, selectedMilestoneTemplate: any, setSelectedMilestoneTemplate: (value: SetStateAction<any>) => void, className?: string}) {
    const handleCheck = () => {
        if (milestoneData.title !== selectedMilestoneTemplate?.title) {
            setSelectedMilestoneTemplate(milestoneData)
        } else {
            setSelectedMilestoneTemplate(undefined)
        }
    }
    
    return (
        <button onClick={handleCheck} className={className}>
            <Card 
                className="relative h-full bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible hover:bg-secondary cursor-pointer"
            >
                <CardHeader>
                    <CheckBubble isChecked={milestoneData.title === selectedMilestoneTemplate?.title} onCheckedChanged={handleCheck}/>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 overflow-visible">
                    <CardTitle>{milestoneData.title}</CardTitle>
                    <CardDescription>
                        {milestoneData.description}
                    </CardDescription>
                </CardContent>
            </Card>
        </button>
    )
}

import React, { SetStateAction, useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "./ui/card"
import { CheckBubble } from "./check-bubble"

export function MilestoneTemplateCardMultiSelect({ milestoneData, selectedMilestones, setSelectedMilestones }: {milestoneData: any, selectedMilestones: any[], setSelectedMilestones: (value: SetStateAction<any[]>) => void}) {
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
        <button onClick={() => {setIsChecked(prev => !prev)}}>
            <Card className="relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible hover:bg-secondary cursor-pointer">
                <CardHeader>
                    <CheckBubble isChecked={isChecked} onCheckedChanged={(event: any) => setIsChecked(event.value)}/>
                    {/* <TypeBadge className="w-fit" type={NODE_TYPE_OPTIONS.find((option) => (option.value === milestoneData?.nodeType))?.value || "PROJECT"}/> */}
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

export function ResearchPlanTemplateCardSelect({ researchPlanData, selectedMilestones, setSelectedMilestones }: {researchPlanData: any, selectedMilestones: any[], setSelectedMilestones: (value: SetStateAction<any[]>) => void}) {
    const [isChecked, setIsChecked] = useState(false)

    useEffect(() => {
        if (isChecked) {
            setSelectedMilestones(researchPlanData.milestones)
        } else {
            setSelectedMilestones([])
        }
    }, [isChecked])

    return (
        <button onClick={() => {setIsChecked(prev => !prev)}}>
            <Card className="relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible hover:bg-secondary cursor-pointer">
                <CardHeader>
                    <CheckBubble isChecked={isChecked} onCheckedChanged={(event: any) => setIsChecked(event.value)}/>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 overflow-visible">
                    <CardTitle>{`Modality: ${researchPlanData.modalities.map((modalityOption: any)=> modalityOption.label).join(', ')}`}</CardTitle>
                    <CardDescription>
                        {researchPlanData.description}
                    </CardDescription>

                    <ol className="list-decimal pl-4">
                        {researchPlanData.milestones.map((milestone: any) => (
                            <li>{milestone.title}</li>
                        ))}
                    </ol>
                </CardContent>
            </Card>
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
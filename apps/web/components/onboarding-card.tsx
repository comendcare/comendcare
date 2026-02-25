"use client"
import React, { useEffect, useRef } from "react"
import type { CardComponentProps } from "comend-pag-platform/components/onborda/types"
import { useOnborda } from "comend-pag-platform/components/onborda/OnbordaContext"
import { XIcon } from "lucide-react"
import confetti from "canvas-confetti"
import { Button } from "@comend/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@comend/components/ui/card"
import { ReactFlowProvider, useReactFlow, useStoreApi } from "@xyflow/react"
import { RoadmapState, useRoadmapStore } from "~web/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"

const selector = (state: RoadmapState) => ({
    setOnboardingActive: state.setOnboardingActive,
    nodes: state.nodes,
    setSelectedNodeIds: state.setSelectedNodeIds,
    addMilestones: state.addMilestones
})


const OnboardingCard: React.FC<CardComponentProps> = ({ step, currentStep, totalSteps, nextStep, prevStep, arrow }) => {
    // Onborda hooks
    const { closeOnborda } = useOnborda()
    const cardRef = useRef<HTMLDivElement>(null)
    const { fitView } = useReactFlow()

    const {
        setOnboardingActive,
        nodes,
        setSelectedNodeIds,
        addMilestones
    } = useRoadmapStore(useShallow(selector))

    function handleConfetti() {
        closeOnborda()
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })
    }

    useEffect(() => {
        setOnboardingActive(false)

        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                closeOnborda()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [closeOnborda, setOnboardingActive])

    const handleNextStep = async (e: any) => {
        e.preventDefault()
        let onboardingNodeId: string | undefined = nodes.sort((a: any, b: any) => b.createdAt - a.createdAt)[0]?.id

        // execute any actions that need to occur before we move to the next step
        if (step.selector === '.onborda-select-a-template') {
            // if there are no nodes, we create one to use for the onboarding flow
            if (nodes.length <= 0) {
                const newNodes = await addMilestones([{
                    title: `Basic Science`,
                    status: "PLANNED",
                }], "Onborda Tutorial")
                onboardingNodeId = newNodes?.[0]?.id
            }

            if (onboardingNodeId) fitView({ nodes: [{ id: onboardingNodeId }], padding: 2, duration: 500 })
        }

        if (step.selector === '.onborda-select-a-template' && onboardingNodeId) {
            setSelectedNodeIds([onboardingNodeId])
            fitView({ nodes: [{ id: onboardingNodeId }], padding: 2, duration: 500 })
        }

        if (step.selector === '.click-project-step') {
            const element = document.getElementById("edit-milestone-scroll-area")
            if (element) {
                element.scrollIntoView({block: "end", inline: "nearest", behavior: "smooth"}) // scroll to bottom
            }

            await new Promise(resolve => setTimeout(resolve, 500))
        }

        if (step.selector === '.organization-profile-tour-step1') {
            const element = document.getElementsByClassName("organization-profile-tour-step2")[0]
            if (element) {
                element.scrollIntoView({block: "end", inline: "nearest", behavior: "smooth"}) // scroll to bottom
            }

            await new Promise(resolve => setTimeout(resolve, 500))
        } else if (step.selector === '.organization-profile-tour-step2') {
            const element = document.getElementsByClassName("organization-profile-tour-step3")[0]
            if (element) {
                element.scrollIntoView({block: "start", inline: "nearest", behavior: "smooth"}) // scroll to bottom
            }

            await new Promise(resolve => setTimeout(resolve, 500))
        } else if (step.selector === '.organization-profile-tour-step-3') {
            const element = document.getElementsByClassName("organization-profile-tour-step4")[0]
            if (element) {
                element.scrollIntoView({block: "start", inline: "nearest", behavior: "smooth"}) // scroll to bottom
            }

            await new Promise(resolve => setTimeout(resolve, 500))
        } else if (step.selector === '.organization-profile-tour-step-4') {
            const element = document.getElementsByClassName("organization-profile-tour-step5")[0]
            if (element) {
                element.scrollIntoView({block: "end", inline: "nearest", behavior: "smooth"}) // scroll to bottom
            }

            await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
        nextStep()
    }

    return (
        <div>
        <Card ref={cardRef} className="border-0 rounded-3xl w-max max-w-[400px] pointer-events-auto flex flex-col gap-2 p-4">
            <CardHeader className="p-0">
                <div className="flex items-start justify-between w-full">
                    <div>
                        <CardTitle className="text-lg">
                            {step.icon} {step.title}
                        </CardTitle>
                    </div>
                    <Button variant="ghost" className="p-1 h-fit w-fit" onClick={() => closeOnborda()}>
                        <XIcon size={16} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">{step.content}</CardContent>
            <CardFooter className="p-0">
                <div className="flex justify-between w-full relative">
                    <CardDescription className="absolute w-full h-full flex justify-center items-center">
                        {currentStep + 1} of {totalSteps}
                    </CardDescription>
                    {currentStep === 0 && <div className="transparent"/>} 
                    {currentStep !== 0 && <Button onClick={() => prevStep()} className="z-10">Previous</Button>}
                    {currentStep + 1 !== totalSteps && (
                        <Button onClick={handleNextStep} className="ml-auto z-10">
                            Next
                        </Button>
                    )}
                    {currentStep + 1 === totalSteps && (
                        <Button onClick={() => handleConfetti()} className="ml-auto z-10">
                            🎉 Finish!
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
        <span className="text-card">{arrow}</span>
        </div>
    )
}

export default OnboardingCard

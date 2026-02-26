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

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
        <Card ref={cardRef} className="border-0 rounded-3xl w-max max-w-[400px] pointer-events-auto">
            <CardHeader>
                <div className="flex items-start justify-between w-full">
                    <div>
                        <CardTitle className="mb-2 text-lg">
                            {step.icon} {step.title}
                        </CardTitle>
                        <CardDescription>
                            {currentStep + 1} of {totalSteps}
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => closeOnborda()}>
                        <XIcon size={16} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>{step.content}</CardContent>
            <CardFooter>
                <div className="flex justify-between w-full space-x-2">
                    {currentStep !== 0 && <Button onClick={() => prevStep()}>Previous</Button>}
                    {currentStep + 1 !== totalSteps && (
                        <Button onClick={handleNextStep} className="ml-auto">
                            Next
                        </Button>
                    )}
                    {currentStep + 1 === totalSteps && (
                        <Button onClick={() => handleConfetti()} className="ml-auto">
                            🎉 Finish!
                        </Button>
                    )}
                </div>
            </CardFooter>
            <span className="text-card">{arrow}</span>
        </Card>
    )
}

export default OnboardingCard

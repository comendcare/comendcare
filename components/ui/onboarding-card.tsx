"use client"
import React, { useEffect, useRef } from "react"
import type { CardComponentProps } from "../onborda/types"
import { useOnborda } from "../onborda/OnbordaContext"
import { XIcon } from "lucide-react"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactFlowProvider, useReactFlow, useStoreApi } from "@xyflow/react"
import { nanoid } from "nanoid"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { types } from "node:util"

const selector = (state: RoadmapState) => ({
    setOnboardingActive: state.setOnboardingActive,
    nodes: state.nodes,
    setSelectedNodeId: state.setSelectedNodeId,
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
        setSelectedNodeId,
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
        if (step.selector === '.research-plan-tour-step1') {
            // if there are no nodes, we create one to use for the onboarding flow
            if (nodes.length <= 0) {
                const newNode = await addMilestones([{
                    types: [],
                    title: `New Milestone`,
                    status: "PLANNED",
                }])
                onboardingNodeId = newNode?.[0]?.id
            }

            if (onboardingNodeId) fitView({ nodes: [{ id: onboardingNodeId }], padding: 2, duration: 500 })
        }
        if (step.selector === '.research-plan-tour-step2' && onboardingNodeId) {
            setSelectedNodeId(onboardingNodeId)
            fitView({ nodes: [{ id: onboardingNodeId }], padding: 2, duration: 500 })
        } else if (step.selector === '.research-plan-tour-step3') {
            const element = document.getElementById("edit-milestone-scroll-area")
            if (element) {
                element.scrollIntoView({block: "end", inline: "nearest", behavior: "smooth"}) // scroll to bottom
            }

            await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
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
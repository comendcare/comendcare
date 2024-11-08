"use client"
import React, { useEffect, useRef } from "react"
import type { CardComponentProps } from "onborda"
import { useOnborda } from "onborda"
import { XIcon } from "lucide-react"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactFlowProvider, useReactFlow, useStoreApi } from "@xyflow/react"
import { nanoid } from "nanoid"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"

const selector = (state: RoadmapState) => ({
    nodes: state.nodes,
    addNode: state.addNode,
})


const OnboardingCard: React.FC<CardComponentProps> = ({ step, currentStep, totalSteps, nextStep, prevStep, arrow }) => {
    // Onborda hooks
    const { closeOnborda } = useOnborda()
    const cardRef = useRef<HTMLDivElement>(null)
    const store = useStoreApi()
    const { fitView } = useReactFlow()

    const {
        nodes,
        addNode,
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
        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                closeOnborda()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [closeOnborda])

    const addMilestone = (position?: { x: number; y: number }) => {
        // get center of viewport: https://stackoverflow.com/questions/76349086/how-can-i-prevent-nodes-from-being-added-outside-the-view-area-in-react-flow
        const {
            height,
            width,
            transform: [transformX, transformY, zoomLevel]
        } = store.getState()

        const zoomMultiplier = 1 / zoomLevel
        const centerX =
            -transformX * zoomMultiplier + (width * zoomMultiplier) / 2
        const centerY =
            -transformY * zoomMultiplier + (height * zoomMultiplier) / 2

        const id = nanoid()
        const newNode = {
            id: id,
            type: "MILESTONE",
            position: {
                x: position ? position?.x : centerX,
                y: position ? position?.y : centerY
            },
            data: {
                id: nanoid(),
                nodeId: id,
                title: `New Milestone`,
                papers: [],
                // tasks: [],
                status: "TODO"
            }
        }

        addNode(newNode)
        return newNode
    }

    const handleNextStep = async () => {
        console.log(`step`, step)
        let selectedNodeId: string | undefined = nodes[0]?.id

        if (step.selector === ".empty-roadmap-tour-step1") {
            const newNode = addMilestone()
            selectedNodeId = newNode.id
        }

        await new Promise(resolve => setTimeout(resolve, 500))

        if (selectedNodeId) {
            if (selectedNodeId) fitView({ nodes: [{ id: selectedNodeId }], padding: 2 })
        }

        await new Promise(resolve => setTimeout(resolve, 500))

        nextStep()
    }

    return (
        <Card ref={cardRef} className="border-0 rounded-3xl w-max max-w-[550px] pointer-events-auto">
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
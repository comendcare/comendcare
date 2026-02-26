"use client"

import Image from 'next/image';
import gif2 from "@/public/Screen Recording 2025-05-22 at 3.33.16 PM.gif"
import { temporal } from 'zundo';
import { create } from 'zustand';
import { useSession } from 'next-auth/react';
import { createBiosample } from '@comend/lib/actions';
import { BIOSAMPLE_TYPE_OPTIONS, editBiosampleForm } from '@comend/lib/types';
import { Session } from 'next-auth';
import z from 'zod';
import { getBiosamples } from '@comend/lib/fetchers';

export const onbordaTours: any[] = [
    {
        tour: "tools-tour",
        steps: [
            {
                icon: <>👋</>,
                title: "Types of tools",
                content: <>Comend has 3 types of tools that make up your toolkit, biosamples, disease models, and clinical datasets. You can manage each set of tools in their respective tabs.</>,
                selector: ".types-of-tools",
                side: "bottom",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "Create a single tool",
                content: <>You can create a single tool from the ‘Create’ button in the top right.</>,
                selector: ".single-tool-create",
                side: "left",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "Bulk create tools",
                content: <>You can use our bulk import feature to create many tools at a time via a spreadsheet. Use our template spreadsheet to get started.</>,
                selector: ".bulk-tool-create",
                side: "left",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "Manage tools",
                content: <>You can edit existing tools from the toolkit tables. Try searching or applying a filter to find tools faster.</>,
                selector: ".manage-tools",
                side: "top",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
                preFunc: async (context: {session: Session}) => {
                    const orgId = context?.session?.user?.organizationId
                    let existingBiosamplesCount = 0
                    const existingBiosamples = await getBiosamples(orgId, { id: true })

                    if (existingBiosamples.data) {
                        existingBiosamplesCount = existingBiosamples.data.length
                    }

                    // if the organization doesn't have any existing biosamples, we create an example biosample for them
                    // before showing off the table.
                    if (orgId && existingBiosamplesCount === 0) {
                        const newBiosample = await createBiosample(
                            orgId,
                            {
                                description: "This is a test biosample...",
                                types: [BIOSAMPLE_TYPE_OPTIONS[0]]
                            } as z.infer<typeof editBiosampleForm>
                        )
                    }
                }
            },
            {
                icon: <>⭐</>,
                title: "Publishing tools",
                content: <>By default tools are private, but you can choose to publish them. Published tools will be visible on your organization’s profile, and in the Comend marketplace.</>,
                selector: ".publish-tools",
                side: "top",
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
        ]
    }
]

export type Selector = 
    ".onborda-create-a-project" | 
    ".onborda-select-a-template" | 
    ".click-project-step" |
    ".onborda-editing-project-details" |
    ".onborda-save-project" | 
    ".onborda-recommendations"

export interface ResearchPlanOnbordaState {
    activeTour: string | undefined,
    setActiveTour: (tour: string | undefined) => void,
    step: Selector | undefined,
    setCurrentStep: (step: Selector | undefined) => void
    getCurrentStep: () => Selector | undefined,
    incrementCurrentStep: () => Selector | undefined, // changes state to the next step, and returns the next step
    decrementCurrentStep: () => Selector | undefined // changes state to previous step, and returns the previous step
}

export const useOnbordaStore = create<ResearchPlanOnbordaState>()(
    temporal((set, get) => ({
            activeTour: undefined,
            setActiveTour: (tour: string | undefined) => {
                set({ activeTour: tour })
            },
            step: undefined,
            setCurrentStep: (step: Selector | undefined) => {
                set({ step })
            },
            getCurrentStep: () => {
                return get().step
            },
            incrementCurrentStep: () => {
                const currentStep = get().step
                const activeTour = onbordaTours.find(tour => tour.tour === get().activeTour)
                if (!currentStep) return undefined
                if (!activeTour) return undefined

                const currentStepIndex = activeTour.steps.map((step: any) => step.selector).indexOf(currentStep)
                if (!currentStepIndex) {
                    console.error(`Could not find current onborda step: `, currentStep)
                    return undefined
                }

                if (currentStepIndex >= activeTour.steps.length) {
                    // if current step is the last step, set current step to undefined, since there are no more steps after this
                    set({ step: undefined })
                    return undefined
                } else {
                    set({ step: activeTour.steps[currentStepIndex + 1].selector as Selector })
                    return activeTour.steps[currentStepIndex + 1].selector as Selector
                }
            },
            decrementCurrentStep: () => {
                const currentStep = get().step
                const activeTour = onbordaTours.find(tour => tour.tour === get().activeTour)
                if (!currentStep) return undefined
                if (!activeTour) return undefined

                const currentStepIndex = activeTour.steps.map((step: any) => step.selector).indexOf(currentStep)
                if (!currentStepIndex) {
                    console.error(`Could not find current onborda step: `, currentStep)
                    return undefined
                }

                if (currentStepIndex <= 0) {
                    // if current step is the first step, set current step to undefined, since there are no more steps before this
                    set({ step: undefined })
                    return undefined
                } else {
                    set({ step: activeTour.steps[currentStepIndex - 1].selector as Selector })
                    return activeTour.steps[currentStepIndex - 1].selector as Selector
                }
            }
        }),
        {
            limit: 100, // limit the stored history states to 100
            onSave: (pastState, currentState) => {
                console.log(`Past onborda state:`, pastState)
                console.log(`Saved onborda state: `, currentState)
                return
            },
        })
    )

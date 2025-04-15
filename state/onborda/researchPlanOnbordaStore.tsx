import Image from 'next/image';
import gif1 from "@/public/onboarding-gif-1.gif"
import { temporal } from 'zundo';
import { create } from 'zustand';
import { Tour } from '@/components/onborda/types';
import { Step } from '@/components/onboarding-steps';

export const onbordaTours: Tour[] = [
    {
        tour: "research-plan-tour",
        steps: [
            {
                icon: <>👋</>,
                title: "Create a Project",
                content: <>{`Create a project from a template or import multiple projects at a time.`}</>,
                selector: ".onborda-create-a-project",
                side: "bottom-right" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "Select a template",
                content: <>{`Pick one of our project templates to get started. You will be able to edit the title and description.`}</>,
                selector: ".onborda-select-a-template",
                side:  "bottom-right" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            // {
            //     icon: <>⭐</>,
            //     title: "Editing Projects",
            //     content: <>{`Once you've created a project, select it to edit the project details.`}</>,
            //     selector: ".click-project-step",
            //     side:  "bottom-right" as any,
            //     showControls: true,
            //     pointerPadding: 10,
            //     pointerRadius: 10
            // },
            {
                icon: <>⭐</>,
                title: "Editing Project Details",
                content: <>{`Once you've created a project you can view and edit the details in the project side panel.`}</>,
                selector: ".onborda-editing-project-details",
                side:  "left" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Saving a Project",
                content: <>{`Click the save button to submit your changes.`}</>,
                selector: ".onborda-save-project",
                side:  "top-right" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "View marketplace recommendations",
                content: <>{`Once you've added some details to your project, check out our marketplace recommendations. Marketplace recommendations include results that may be relevant to the contents or goals of your project.`}</>,
                selector: ".onborda-recommendations",
                side:  "left" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            // {
            //     icon: <>⭐</>,
            //     title: "Connecting Milestones",
            //     content: <>
            //         {`Once you've created more than one milestone, you can create relationships between them by clicking and dragging from the + icon. You can remove relationships by clicking the trash icon.`}
            //         <Image src={gif1} alt="Short animation. Shows deleting an edge, from between two notes, then re-connecting a node in the middle."/>
            //     </>,                
            //     selector: ".research-plan-tour-step5",
            //     side:  "bottom-right" as any,
            //     showControls: true,
            //     pointerPadding: 10,
            //     pointerRadius: 10
            // }
        ]
    },
    {
        tour: "organization-profile-tour",
        steps: [
            {
                icon: <>👋</>,
                title: "About your organization",
                content: <>{`Your organization's information and members can be found here.`}</>,
                selector: ".organization-profile-tour-step1",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "About your condition",
                content: <>{`Information about your condition will appear here.`}</>,
                selector: ".organization-profile-tour-step2",
                side: "top" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>👋</>,
                title: "Updating your organization",
                content: <>{`If you'd like to update your organization's information, click the pencil icon near the content you want to edit.`}</>,
                selector: ".organization-profile-tour-step3",
                side: "bottom" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: <>⭐</>,
                title: "Your research plan",
                content: <>{`A timeline view of your research plan will be found here. To create and edit your plan, visit the Research Planner.`}</>,
                selector: ".organization-profile-tour-step4",
                side: "top-right" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            {
                icon: <>⭐</>,
                title: "Your miletones",
                content: <>{`Highlight your assets (ex/ data and models) and requests for proposals (ex/ funding opportunities) to potential partners. We recommend starting here!`}</>,
                selector: ".organization-profile-tour-step5",
                side: "left" as any,
                showControls: true,
                pointerPadding: 10,
                pointerRadius: 10
            },
            // {
            //     icon: <>⭐</>,
            //     title: "Your organization's activity",
            //     content: <>{`All posts related to your organization will appear in this tab.`}</>,
            //     selector: ".organization-profile-tour-step6",
            //     side: "left" as any,
            //     showControls: true,
            //     pointerPadding: 10,
            //     pointerRadius: 10
            // },
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

export const useResearchPlanOnbordaStore = create<ResearchPlanOnbordaState>()(
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

                const currentStepIndex = activeTour.steps.map(step => step.selector).indexOf(currentStep)
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

                const currentStepIndex = activeTour.steps.map(step => step.selector).indexOf(currentStep)
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

import { MILESTONE_TYPE_OPTIONS } from "@/prisma/seed/seed-options"
import { MODALITIES } from "./types"
import ASOResearchPlan from '@/data/research-plan-templates/ASO Research Plan-cmaqujvbw00007u8av9kl1u60.json'
import GeneTherapyResearchPlan from '@/data/research-plan-templates/Gene-Therapy-Template.json'

export const templateMilestones = MILESTONE_TYPE_OPTIONS.map(typeData => ({
    title: typeData.label,
    description: typeData.description,
    types: [typeData.id],
    categories: typeData.categories
}))

// export const templateResearchPlans = [
//     {
//         title: 'ASO Research Plan',
//         description: 'Outlines each stage of developing an ASO therapy, from identifying the target gene to advancing through clinical trials, with the goal of bringing a safe and effective treatment to patients who urgently need it.',
//         milestones: MILESTONE_TYPE_OPTIONS.filter((option: any) => [
//             'NATURALHISTORYSTUDY', 
//             'BASICSCIENCE', 
//             'MOUSEMODEL', 
//             'PATIENTDERIVEDCELLLINE', 
//             'TOXICOLOGYSTUDY'
//         ].includes(option.id)).map(typeData => ({
//             title: typeData.label,
//             description: typeData.description,
//             types: [typeData.id],
//             categories: typeData.categories
//         })),
//         modalities: MODALITIES.filter(modality => ['ANTISENSE_OLIGONUCLEOTIDE'].includes(modality.value))
//     }
// ]

export const templateResearchPlans = [
    ASOResearchPlan,
    GeneTherapyResearchPlan
]

export const emptyMilestoneTemplate = {
    title: 'New Milestone',
    description: '',
    types: [],
    attachments: [],
    tasks: []
}

export const emptyRoadmapTemplate = {
    title: '',
    description: '',
    milestones: []
}
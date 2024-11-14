export const templateMilestones = [
    {
        title: 'Natural History Study',
        description: 'Our observational research effort that follows individuals with a specific disease over time, collecting data on how the disease develops and progresses without intervention.',
        papers: [],
        tasks: []
    },
    {
        title: 'Review Literature',
        description: 'Examine existing research to better understand the disease, identify gaps in knowledge, and assess the latest findings on potential treatments.',
        papers: [],
        tasks: []
    },
    {
        title: 'Identify Existing Disease Models',
        description: 'Research and evaluate lab models.',
        status: 'INPROGRESS',
        papers: [],
        tasks: []
    },
    {
        title: 'Construct Mouse Models',
        description: '',
        status: 'INPROGRESS',
        papers: [],
        tasks: [
            { name: 'Secure Funding' },
            { name: 'Ethical Standards Advocacy' },
            { name: 'Prioritize Model Features', description: 'Work with researchers to prioritize features in the model that most directly address patient needs and research goals.' }
        ]
    },
    {
        title: 'Construct Patient-Derived Cells',
        description: 'Work with researchers to create cell lines that replicate disease characteristics.',
        papers: [],
        tasks: [
            { name: 'Coordinate Patient Participation' },
            { name: 'Secure Funding' },
            { name: 'Determine Cell Model Relevancy', description: 'Determine if each cell model is relevant for testing therapies and studying disease mechanisms that refect our patients real experiences.'}
        ]
    },
    {
        title: 'Design ASO Construct',
        description: 'Design an ASO (Antisense Oligonucleotide) construct that specifically targets the genetic mutations driving our disease.',
        papers: [],
        tasks: []
    },
    {
        title: 'Produce Plasmid',
        description: 'Create a DNA template essential for developing and testing therapies.',
        papers: [],
        tasks: []
    },
    {
        title: 'Proof-Of-Concept Study',
        description: 'Design and conduct initial experiments to demonstrate that a potential therapy or intervention can effectively target the disease.',
        papers: [],
        tasks: []
    },
    {
        title: 'Animal Toxicology Study',
        description: 'Conduct preclinical trials to evaluate the safety and potential side effects of a therapy.',
        papers: [],
        tasks: []
    }
]

export const templateRoadmaps = [
    {
        title: 'ASO Research Plan',
        description: 'By developing an ASO therapy, we aim to address the underlying genetic cause of our rare disease. Our plan outlines each stage, from identifying the target gene to advancing through clinical trials, with the goal of bringing a safe and effective treatment to patients who urgently need it.',
        milestones: templateMilestones
    }
]

export const emptyMilestoneTemplate = {
    title: 'New Milestone',
    description: '',
    papers: [],
    tasks: []
}

export const emptyRoadmapTemplate = {
    title: '',
    description: '',
    milestones: []
}
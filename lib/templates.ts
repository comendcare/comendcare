export const templateMilestones = [
    {
        title: 'Natural History Study',
        description: 'Our observational research effort that follows individuals with a specific disease over time, collecting data on how the disease develops and progresses without intervention.',
        type: 'NATURALHISTORYSTUDY',
        attachments: [],
        nodeType: "ASSET"
    },
    {
        title: 'Literature Review',
        description: 'Examine existing research to better understand the disease, identify gaps in knowledge, and assess the latest findings on potential treatments.',
        type: 'LITERATUREREVIEW',
        attachments: [],
        nodeType: "MILESTONE"
    },
    {
        title: 'Identify Existing Disease Models',
        description: 'Research and evaluate lab models.',
        status: 'INPROGRESS',
        // type: 'LITERATUREREVIEW',
        attachments: [],
        nodeType: "MILESTONE"
    },
    {
        title: 'Construct Mouse Models',
        description: 'Recommended tasks: Secure Funding, Ethical Standards Advocacy, and Prioritize Model Features.',
        status: 'INPROGRESS',
        type: 'MOUSEMODEL',
        attachments: [],
        nodeType: "PROJECT"
    },
    {
        title: 'Construct Patient-Derived Cells',
        description: 'Work with researchers to create cell lines that replicate disease characteristics.',
        type: 'CELLLINE',
        attachments: [],
        nodeType: "PROJECT"
    },
    {
        title: 'Design ASO Construct',
        description: 'Design an ASO (Antisense Oligonucleotide) construct that specifically targets the genetic mutations driving our disease.',
        type: 'CONSTRUCTDESIGN',
        attachments: [],
        nodeType: "PROJECT"
    },
    {
        title: 'Produce Plasmid',
        description: 'Create a DNA template essential for developing and testing therapies.',
        type: 'PLASMIDPRODUCTION',
        attachments: [],
        nodeType: "PROJECT"
    },
    {
        title: 'Proof-Of-Concept Study',
        description: 'Design and conduct initial experiments to demonstrate that a potential therapy or intervention can effectively target the disease.',
        type: 'PROOFOFCONCEPTSTUDY',
        attachments: [],
        nodeType: "PROJECT"
    },
    {
        title: 'Animal Toxicology Study',
        description: 'Conduct preclinical trials to evaluate the safety and potential side effects of a therapy.',
        type: 'TOXICOLOGYSTUDY',
        attachments: [],
        nodeType: "PROJECT"
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
    type: 'NOTYPE',
    attachments: [],
    tasks: []
}

export const emptyRoadmapTemplate = {
    title: '',
    description: '',
    milestones: []
}
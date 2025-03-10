export const templateMilestones = [
    {
        title: 'Natural History Study',
        description: 'Our observational research effort that follows individuals with a specific disease over time, collecting data on how the disease develops and progresses without intervention.',
        types: ['NATURALHISTORYSTUDY'],
        attachments: [],
        // nodeType: "ASSET"
        nodeType: "PROJECT",
        phase: "EARLY-STAGE"
    },
    {
        title: 'Literature Review',
        description: 'Examine existing research to better understand the disease, identify gaps in knowledge, and assess the latest findings on potential treatments.',
        types: ['LITERATUREREVIEW'],
        attachments: [],
        nodeType: "PROJECT",
        phase: "EARLY-STAGE"
    },
    {
        title: 'Identify Existing Disease Models',
        description: 'Research and evaluate lab models.',
        // types: ['LITERATUREREVIEW'],
        attachments: [],
        nodeType: "PROJECT",
        phase: "EARLY-STAGE"
    },
    {
        title: 'Construct Mouse Models',
        description: 'Recommended tasks: Secure Funding, Ethical Standards Advocacy, and Prioritize Model Features.',
        types: ['MOUSEMODEL'],
        attachments: [],
        // nodeType: "RFP"
        nodeType: "PROJECT",
        phase: "PRE-CLINICAL"
    },
    {
        title: 'Construct Patient-Derived Cells',
        description: 'Work with researchers to create cell lines that replicate disease characteristics.',
        types: ['PATIENTDERIVEDCELLLINE'],
        attachments: [],
        // nodeType: "RFP"
        nodeType: "PROJECT",
        phase: "PRE-CLINICAL"
    },
    {
        title: 'Design ASO Construct',
        description: 'Design an ASO (Antisense Oligonucleotide) construct that specifically targets the genetic mutations driving our disease.',
        types: ['CONSTRUCTDESIGN'],
        attachments: [],
        // nodeType: "RFP"
        nodeType: "PROJECT",
        phase: "PRE-CLINICAL"
    },
    {
        title: 'Produce Plasmid',
        description: 'Create a DNA template essential for developing and testing therapies.',
        types: ['PLASMIDPRODUCTION'],
        attachments: [],
        // nodeType: "RFP"
        nodeType: "PROJECT",
        phase: "PRE-CLINICAL"
    },
    {
        title: 'Proof-Of-Concept Study',
        description: 'Design and conduct initial experiments to demonstrate that a potential therapy or intervention can effectively target the disease.',
        types: ['PROOFOFCONCEPT'],
        attachments: [],
        // nodeType: "RFP"
        nodeType: "PROJECT",
        phase: "PRE-CLINICAL"
    },
    {
        title: 'Animal Toxicology Study',
        description: 'Conduct preclinical trials to evaluate the safety and potential side effects of a therapy.',
        types: ['TOXICOLOGY'],
        attachments: [],
        // nodeType: "RFP"
        nodeType: "PROJECT",
        phase: "PRE-CLINICAL"
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
    types: [],
    attachments: [],
    tasks: []
}

export const emptyRoadmapTemplate = {
    title: '',
    description: '',
    milestones: []
}
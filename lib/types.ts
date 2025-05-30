import {
    Tool as DBAsset,
    Comment,
    Company,
    ConditionToOrganization,
    Member,
    Milestone as DBMilestone,
    MilestoneType,
    Organization,
    Post,
    Prisma,
    Review,
    ReviewFeedback,
    RFP as DBRFP,
    SavedCompany,
    Service,
    User
} from "@prisma/client";
import {z} from "zod";

export type MilestoneKey =
    | "Add website and description"
    | "Provide financial & incorporation details"
    | "Complete condition data"
    | "Upload profile image"
    | "Upload header image"
    | "Add roadmap";

export interface CustomOrganization {
    website?: string;
    description?: string;
    yearFounded?: number;
    incorporationStatus?: string;
    moneyRaised?: number;
    moneyDeployed?: number;
    researchBudget?: number;
    image?: string;
    headerImage?: string;
    roadmaps?: any[];
}

export interface Condition {
    description?: string;
    associatedSystems: string[];
    associatedGenes: string[];
    causalGenes: string[];
    diseaseCategories: string[];
    prevalenceNumerator: number | null;
    prevalenceDenominator: number | null;
    numberOfPatientsEngaged: number | null;
    nationalEstimatedPopulation: number | null;
    globalEstimatedPopulation: number | null;
}

export type ImportField = {
    key: string,
    required: boolean,
    defaultValue: any,
    isValid: (value: any) => boolean
}

export type Roadmap = Prisma.RoadmapGetPayload<{
    include: {
        nodes: {
            include: {data: true},
            orderBy: [{ createdAt: "desc" }]
        },
        milestones: {
            include: {
                node: true,
                contacts: true,
                attachments: true,
                types: {include: { milestoneType: true }},
                tools: {include: {tool: true}},
                rfps: {include: {rfp: true}}
            },
            orderBy: [{ createdAt: "desc" }]
        },
        edges: true,
        organization: true
    }
}>

export type Asset = Omit<Prisma.ToolGetPayload<{
    include: {
        contacts: true,
        attachments: true,
        milestones: {
            include: {
                milestone: {
                    include: { types: true }
                }
            }
        }
    }
}>, "milestones"> & {
    milestones: Array<{
        tool?: DBAsset,
        toolId: string,
        milestone?: DBMilestone,
        milestoneId: string,
    }>
}

export type RFP = Omit<Prisma.RFPGetPayload<{
    include: {
        contacts: true,
        attachments: true,
        milestones: {
            include: {
                milestone: {
                    include: { types: true }
                }
            }
        }
    }
}>, "milestones"> & {
    milestones: Array<{
        rfp?: DBRFP,
        milestoneId?: string,
        rfpId: string
    }>
}

export type Milestone = Omit<Prisma.MilestoneGetPayload<{
    include: {
        node: true,
        contacts: true,
        roadmap: true,
        attachments: true,
        types: { include: { milestoneType: true, milestoneTypeId: true, milestoneId: true } },
        tools: { include: { tool: true, toolId: true, milestoneId: true } },
        rfps: { include: { rfp: true, rfpId: true, milestoneId: true } }
    }
}>, ("types" | "tools" | "rfps")> & {
    types: Array<{
        milestoneType?: MilestoneType; // Optional
        milestoneId?: string; // Optional
        milestoneTypeId: string; // Required
    }>,
    tools: Array<{
        tool?: DBAsset,
        milestoneId?: string,
        toolId: string
    }>,
    rfps: Array<{
        rfp?: DBRFP,
        milestoneId?: string,
        rfpId: string,
    }>
};

export interface Option {
    value: string;
    label: string;
    disable?: boolean;
    /** fixed option that can't be removed. */
    fixed?: boolean;

    /** Group the options by providing key. */
    [key: string]: any;
}

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
})

export type AssetTableData = Asset & {
    tool: Asset
}

export type SavedCompanyData = SavedCompany & {
    company: Company;
    milestone: Milestone;
};

export interface CompanyWithReviewsAndServices extends Company {
    reviews: ReviewWithAuthor[];
    services: Service[]
}

export type MembershipWithOrganization = Member & {
    organization?: Organization | null; // Optional because the organization might be null if not fetched
};

export type OrganizationsWithConditions = Organization & {
    conditions?: (ConditionToOrganization & {
        condition?: Condition | null;
    })[] | null;
};

export interface ReviewWithAuthor extends Review {
    author: User;
    organization: Organization;
    feedbacks: ReviewFeedback[];
}

export type MemberWithUser = Prisma.MemberGetPayload<{
    include: { user: true };
}>;

export type MemberRequestWithUser = Prisma.MemberRequestGetPayload<{
    include: { user: true };
}>;

export type CommentWithUser = Prisma.CommentGetPayload<{
    include: { author: true };
}>;

export type PostWithAuthorAndComments = Post & {
    author: User
    comments: Comment[]
}

export type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW'

export type NotificationType = 'NEW_TASK' | 'NEW_RECOMMENDATION'

export type NodeType = 'ASSET' | 'PROJECT' | 'RFP'

export const KANBAN_NOTIFICATIONS: NotificationType[] = ["NEW_TASK"]

export const DEFAULT_KANBAN_COLUMNS = [
    {
        name: 'Not started',
        kanbanPosition: 0
    },
    {
        name: 'Stuck',
        kanbanPosition: 1
    },
    {
        name: 'Working on it',
        kanbanPosition: 2
    },
    {
        name: 'Done',
        kanbanPosition: 3
    }
]

export const RFP_OPEN_TO_TYPE_OPTIONS: Option[] = [
    // {
    //     label: 'All',
    //     value: 'ALL',
    // },
    {
        label: 'Service Providers',
        value: 'CRO',
    },
    {
        label: 'Academics',
        value: 'ACADEMIC',
    },
    // {
    //     label: 'None',
    //     value: 'NONE',
    // },
]

export const MILESTONE_TYPE_OPTIONS: any[] = [
    {
        id: 'BASICSCIENCE',
        label: 'Basic science',
        services: ['Literature Searches/Reviews', 'Pathway Mapping'],
        categories: ['discovery'],
        description: 'Understand the fundamental biological processes that contribute to a disease'
    },
    {
        id: 'FUNCTIONALSTUDY',
        label: 'Functional study',
        services: ['DNA Mutagenesis', 'Mutation Data Profiling', 'SNP Characterization'],
        categories: ['discovery'],
        description: "Determine the effect of a mutation on a gene or protein’s function. This is important for identifying the disease mechanism of action."
    }, {
        id: 'NATURALHISTORYSTUDY',
        label: 'Natural history study',
        services: ['Health Economics and Outcomes Research (HEOR)', 'Non-Interventional Studies', 'Observational Research', 'Patient-Reported Outcome Studies', 'RWE/HEOR Data Analysis', 'RWE/HEOR/Market Access Data Analytics', 'Real World Evidence (RWE) Studies', 'Real-World Data', 'Real-World Evidence', 'eCOA - Electronic Clinical Outcomes Assessments', 'ePRO - Electronic Patient-reported Outcome'],
        categories: ['clinical study'],
        description: 'Observe how a disease naturally progresses over time under standard of care conditions. Outcomes are usually measured by clinical researchers through formal clinical visits.'
    }, {
        id: 'PATIENTREGISTRY',
        label: 'Patient registry',
        services: ['Clinical Data Registry', 'Patient Recruitment', 'Patient-Reported Outcome Studies', 'Registries - Disease', 'Registries - Patient', 'Registries - Product'],
        categories: ['clinical study'],
        description: 'Build a systematic database of patient information to track disease progression.'
    }, {
        id: 'BIOMARKER',
        label: 'Biomarker',
        services: ['Biomarker Analytical Validation', 'Biomarker Clinical Utility', 'Biomarker Clinical Validation', 'Biomarker Discovery', 'Biomarker Services', 'Biomarker Services Consulting', 'Clinical Biomarker Analysis', 'Diagnostic Biomarkers Discovery', 'Digital Biomarkers', 'Discovery Biomarker Analytics', 'Metabolomics Biomarker Discovery', 'Pharmacodynamic Biomarkers Discovery', 'Predictive Biomarkers Discovery', 'Prognostic Biomarkers Discovery', 'Translational Biomarker Discovery'],
        categories: ['discovery'],
        description: 'Identify measurable biological indicators that indicate treatment response in patients.'
    }, {
        id: 'OUTCOMEMEASURE',
        label: 'Outcome measure',
        services: ['Biomarker Analytical Validation', 'Biomarker Clinical Validation', 'Biomarker Discovery', 'Biomarker Services', 'Biomarker Services Consulting', 'Clinical Biomarker Analysis', 'Predictive Biomarkers Discovery', 'Prognostic Biomarkers Discovery', 'Translational Biomarker Discovery'],
        categories: ['clinical study'],
        description: 'Define clear criteria to judge whether a treatment is working in clinical studies.'
    }, {
        id: 'BIOBANK',
        label: 'Biobank',
        services: ['Biobanking'],
        categories: ['disease models'],
        description: 'Collect and store patient biological samples with associated clinical data securely.'
    }, {
        id: 'PATIENTDERIVEDCELLLINE',
        label: 'Patient-derived cell line',
        services: ['Cell Culture', 'Cell Line Authentication', 'Cell Line Characterization', 'Cell Line Construction', 'Human Immortalized Cell Culture', 'Human Primary Cells'],
        categories: ['disease models'],
        description: 'Grow cells taken directly from patients to study disease characteristics.'
    }, {
        id: 'ENGINEEREDCELLLINE',
        label: 'Engineered cell line',
        services: ['Cell Culture', 'Cell Line Authentication', 'Cell Line Characterization', 'Cell Line Construction', 'Gene-Edited iPSCs Disease Models', 'Human Immortalized Cell Culture', "Human iPSC's", 'Isogenic Knockout iPSC Lines'],
        categories: ['disease models'],
        description: 'Create modified cells that express or silence specific genes for research insights or models patient mutations.'
    }, {
        id: 'MOUSEMODEL',
        label: 'Mouse model',
        services: ['Knockin Mice', 'Knockout Mice', 'Sprague Dawley Rat'],
        categories: ['disease models'],
        description: 'Model genetic impacts on disease in order to understand the disease biology and the impacts of treatment on disease. '
    }, {
        id: 'OTHERDISEASEMODEL',
        label: 'Other disease model',
        services: ['3D Cell Culture', 'Animal Model Development', 'Human 3D cultures', 'Human Organoids', 'In Vitro Disease Models', 'Model Development', 'Non-Human Primate Models', 'Zebrafish Animal Model'],
        categories: ['disease models'],
        description: 'E.g. yeast, c.elegans, drosophilia, macaque, pig, dog, zebrafish, organoids, or in-silico models'
    }, {
        id: 'TARGETVALIDATION',
        label: 'Target validation',
        services: ['Target Validation', 'Target Validation Consulting'],
        categories: ['discovery'],
        description: ''
    }, {
        id: 'ASSAYDEVELOPMENT',
        label: 'Assay development',
        services: ['Assay Development', 'Assay Development Consulting', 'ELISA', 'In Vitro Assay Development', 'Metabolomics Biomarker Discovery'],
        categories: ['preclinical'],
        description: ''
    }, {
        id: 'DRUGSCREEN',
        label: 'Drug screen',
        services: ['Discovery Compound Screening Analytics', 'High Throughput Screening', 'Natural Product Libraries', 'Natural Product Screening'],
        categories: ['discovery'],
        description: 'Test many compounds rapidly in a disease model to find those with promising effects against the target.'
    }, {
        id: 'EFFICASYSTUDY',
        label: 'Efficacy study',
        services: ['In Vitro Efficacy Test', 'Mouse Efficacy Monotherapy', 'Rat Efficacy Monotherapy'],
        categories: ['preclinical'],
        description: ''
    }, {
        id: 'DOSEFINDINGSTUDY',
        label: 'Dose finding study',
        services: ['Dose Range Finding Study - Dog /Canine', 'Dose Range Finding Study - Mouse', 'Dose Range Finding Study - Other Species', 'Dose Range Finding Study - Rat', 'In Vitro Dose Determination Tests', 'In Vitro Toxicology Testing'],
        categories: ['preclinical'],
        description: 'Test a range of doses of the treatment to determine levels at which it has a biological effect and is safe.'
    }, {
        id: 'TOXICOLOGYSTUDY',
        label: 'Toxicology study',
        services: ['General Toxicology', 'In Vitro Toxicology Testing', 'Mammalian Toxicology', 'Toxicology Consulting'],
        categories: ['preclinical'],
        description: 'Assess potential harmful effects of a treatment in model systems before human trials.'
    }, {
        id: 'BIODISTRIBUTIONSTUDY',
        label: 'Biodistribution study',
        services: ['Drug Distribution Studies'],
        categories: ['preclinical'],
        description: ''
    }, {
        id: 'GENETHERAPYPRODUCTION',
        label: 'Gene therapy production',
        services: ['Adeno Associated Virus (AAV) Production', 'GLP Large Molecule Bioanalysis', 'Gene Synthesis', 'Gene/Oligo Synthesis', 'Oligo Synthesis', 'Plasmid DNA Preparation and Extraction', 'RNA oligo synthesis'],
        categories: ['design & manufacturing'],
        description: ''
    }, {
        id: 'GPMANUFACTURING',
        label: 'GMP manufacturing',
        services: ['Chemistry Manufacturing and Controls (CMC)', 'Chemistry Manufacturing and Controls (CMC) Consulting', 'GMP Synthesis', 'Large Scale Purification'],
        categories: ['design & manufacturing'],
        description: '(Good Manufacturing Practices)\n\nProduce clinical-grade materials under strict quality controls for human use.'
    }, {
        id: 'INTERACTMEETING',
        label: 'INTERACT meeting',
        services: [],
        categories: ['regulatory'],
        description: ''
    }, {
        id: 'PREINDMEETING',
        label: 'Pre-IND meeting',
        services: ['IND Enabling Package', 'IND Writing', 'IND Writing Consulting', 'Investigational Medicinal Product Dossier (IMPD) and Investigational New Drug (IND) Dossier', 'Regulatory Starting Materials'],
        categories: ['regulatory'],
        description: 'Discuss the preclinical data, manufacturing, plans for clinical testing and get feedback on the proposed clinical trial design, preclinical data, and regulatory requirements.'
    }, {
        id: 'INDSUBMISSION',
        label: 'IND submission',
        services: ['IND Enabling Package', 'IND Writing', 'IND Writing Consulting', 'Investigational Medicinal Product Dossier (IMPD) and Investigational New Drug (IND) Dossier', 'Regulatory Starting Materials'],
        categories: ['regulatory'],
        description: 'Submit an Investigational New Drug (IND) application to begin human clinical trials.'
    }, {
        id: 'SITESELECTION',
        label: 'Site selection',
        services: ['Site Selection', 'Study/Site Feasibility Study'],
        categories: ['clinical study'],
        description: ''
    }, {
        id: 'PATIENTRECRUITMENT',
        label: 'Patient recruitment',
        services: ['Clinical Trial Recruitment', 'Patient Recruitment'],
        categories: ['clinical study'],
        description: ''
    }, {
        id: 'TRIALDESIGN',
        label: 'Trial design',
        services: ['Clinical Trial Consulting', 'Clinical Trial Design', 'Clinical Trial Feasibility'],
        categories: ['clinical study'],
        description: ''
    }, {
        id: 'PHASE1',
        label: 'Phase 1',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical study'],
        description: 'Assess the safety of the drug, determine a safe dose, identify side effects, and study the pharmacological characteristics of the drug in humans'
    }, {
        id: 'PHASE1/2',
        label: 'Phase 1/2',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical study'],
        description: 'A combination of the first two phases of clinical testing, designed to evaluate both the safety and efficacy of a drug in a single trial.'
    }, {
        id: 'PHASE2',
        label: 'Phase 2',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical study'],
        description: 'Assess whether the drug works as intended and to monitor its side effects in a larger, disease-affected population'
    }, {
        id: 'PHASE3',
        label: 'Phase 3',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical study'],
        description: "Confirm the drug's efficacy, monitor side effects in a larger population, and compare it to current standard treatments."
    }, {
        id: 'FDAAPPROVAL',
        label: 'FDA approval',
        services: ['Regulatory Starting Materials'],
        categories: ['regulatory'],
        description: ''
    }, {
        id: 'PHASE4',
        label: 'Phase 4',
        services: ['Biomarker Services', 'Clinical Data Registry', 'Patient-Reported Outcome Studies', 'Post-Marketing (Phase 4) Studies', 'RWE/HEOR Data Analysis', 'RWE/HEOR/Market Access Data Analytics', 'Real World Evidence (RWE) Studies', 'Real-World Evidence'],
        categories: ['clinical study'],
        description: 'Occurs after FDA approval to monitor long-term effects and rare side effects that may not have appeared in earlier phases.'
    }
];

export const TREATMENT_TYPE = [
    {
        label: 'Gene Therapy',
        description: 'Fixes or replaces faulty genes',
        modalities: ['GENE_THERAPY_AAV', 'GENE_EDITING']
    },
    {
        id: '2',
        label: 'RNA Therapy',
        description: 'Targets how genes are read (e.g., ASOs)',
        modalities: ['ANTISENSE_OLIGONUCLEOTIDE', 'OTHER_RNA_THERAPY']
    },
    {
        id: '3',
        label: 'Cell Therapy',
        description: 'Uses modified or donor cells to treat disease',
    },
    {
        id: '4',
        label: 'Drug Therapy',
        description: 'Uses small molecules or repurposed drugs',
        modalities: ['DRUG_REPURPOSING_SCREENING']
    },
    {
        id: '5',
        label: 'Enzyme Therapy',
        description: 'Replaces missing or faulty enzymes',
        modalities: ['ENZYME_REPLACEMENT']
    },
    {
        id: '6',
        label: 'Protein Therapy',
        description: 'Delivers helpful proteins to cells',
    },
    {
        id: '7',
        label: 'Other',
        modalities: ['PATHWAY_MODULATORS', 'EXPLORATORY_RESEARCH']
    },
]

export const ADDITIONAL_RESEARCH_PLAN_TYPES: Option[] = [
    {
        id: '1',
        label: 'Drug Repurposing or Drug Screening',
        value: 'DRUG_REPURPOSING_SCREENING',
        description: 'Strategies to identify new therapeutic uses for existing drugs or discover novel compounds for specific diseases through systematic screening.',
        strengths: 'Reduces development timelines, leverages existing safety profiles, and cost-effective compared to de novo drug development.',
    },
    {
        id: '2',
        label: 'Pathway Modulators',
        value: 'PATHWAY_MODULATORS',
        description: 'Therapies designed to target and modulate biological pathways involved in disease processes, such as signaling cascades and metabolic pathways.',
        strengths: 'Addresses disease mechanisms at a systemic level, potential for broad applications, and integrates well with other therapeutic modalities.',
    },
    {
        id: '3',
        label: 'Exploratory Research',
        value: 'EXPLORATORY_RESEARCH',
    },
    {
        id: '4',
        label: 'Tool Development',
        value: 'TOOL_DEVELOPMENT',
    },
    {
        id: '5',
        label: 'Theraputic-Agnostic',
        value: 'THERAPUTIC_AGNOSTIC',
    },
    {
        id: '6',
        label: 'Other',
        value: 'OTHER_NON_MODALITY',
    },
]

export const milestoneCategories = {
    'PLANNING': {
        option: {value: 'PLANNING', label: 'Planning', variant: 'amber'},
        types: []
    },
    'DATA_COLLECTION': {
        option: {value: 'DATA_COLLECTION', label: 'Patient Data Collection', variant: 'yellow'},
        types: ['NATURALHISTORYSTUDY', 'PATIENTREGISTRY', 'OUTCOMEMEASURE']
    },
    'DISCOVERY': {
        option: {value: 'DISCOVERY', label: 'Discovery', variant: 'lime'},
        types: ['BASICSCIENCE', 'FUNCTIONALSTUDY', 'BIOMARKER', 'TARGETVALIDATION', 'DRUGSCREEN']
    },
    'DISEASE_MODELS': {
        option: {value: 'DISEASE_MODELS', label: 'Disease Models', variant: 'emerald'},
        types: ['BIOBANK', 'PATIENTDERIVEDCELLLINE', 'ENGINEEREDCELLLINE', 'MOUSEMODEL', 'OTHERDISEASEMODEL']
    },
    'DESIGN_MANUFACTURING': {
        option: {value: 'DESIGN_MANUFACTURING', label: 'Design & Manufacturing', variant: 'cyan'},
        types: ['GENETHERAPYPRODUCTION', 'GPMANUFACTURING']
    },
    'PRECLINICAL': {
        option: {value: 'PRECLINICA', label: 'Preclinical', variant: 'indigo'},
        types: ['ASSAYDEVELOPMENT', 'EFFICASYSTUDY', 'DOSEFINDINGSTUDY', 'TOXICOLOGYSTUDY', 'BIODISTRIBUTIONSTUDY']
    },
    'CLINICAL_TRIAL': {
        option: {value: 'CLINICAL_TRIAL', label: 'Clinical Trial', variant: 'purple'},
        types: ['SITESELECTION', 'PATIENTRECRUITMENT', 'TRIALDESIGN', 'PHASE1', 'PHASE1/2', 'PHASE2', 'PHASE3', 'PHASE4']
    },
    'REGULATORY': {
        option: {value: 'REGULATORY', label: 'Regulatory', variant: 'pink'},
        types: ['INTERACTMEETING', 'PREINDMEETING', 'INDSUBMISSION', 'FDAAPPROVAL']
    },
}

export const MODALITIES: Option[] = [
    {
        id: '1',
        label: 'Gene Therapy (AAV)',
        value: 'GENE_THERAPY_AAV',
        description: 'A therapeutic approach using adeno-associated viruses (AAV) to deliver genetic material into cells, often to correct or replace defective genes.',
        strengths: 'High precision in targeting specific cells, long-term expression of therapeutic genes, and growing clinical success in various diseases.',
    },
        {
        id: '2',
        label: 'Gene Therapy (non-AAV)',
        value: 'GENE_THERAPY',
        description: 'A therapeutic approach using adeno-associated viruses (AAV) to deliver genetic material into cells, often to correct or replace defective genes.',
        strengths: 'High precision in targeting specific cells, long-term expression of therapeutic genes, and growing clinical success in various diseases.',
    },
    {
        id: '3',
        label: 'Gene Editing',
        value: 'GENE_EDITING',
        description: 'A technology for directly altering the DNA of an organism, including techniques like CRISPR/Cas9 to modify genes for therapeutic purposes.',
        strengths: 'Highly versatile, precise gene modifications, and potential for permanent therapeutic outcomes.',
    },
    {
        id: '4',
        label: 'Antisense Oligonucleotide (ASO)',
        value: 'ANTISENSE_OLIGONUCLEOTIDE',
        description: 'Short, synthetic strands of DNA or RNA designed to bind to specific mRNA sequences, modifying gene expression or protein production.',
        strengths: 'Targets specific genes, reversible effects, and customizable for various genetic disorders.',
    },
    {
        id: '5',
        label: 'Other RNA Therapy',
        value: 'OTHER_RNA_THERAPY',
        description: 'A broad category of therapies leveraging RNA molecules, such as RNA interference (RNAi) and mRNA vaccines, to modulate gene expression or induce immune responses.',
        strengths: 'Rapid development timelines, adaptable to different diseases, and avoids permanent DNA alterations.',
    },
    {
        id: '6',
        label: 'Enzyme or Protein Replacement',
        value: 'ENZYME_REPLACEMENT',
        description: 'A treatment approach involving the administration of exogenous enzymes to replace deficient or malfunctioning enzymes in patients.',
        strengths: 'Addresses underlying enzyme deficiencies, well-established for several metabolic disorders, and provides symptomatic relief.',
    },
    {
        id: '9',
        label: 'Antibodies',
        value: 'ANTIBODIES',
        description: 'Biologics that use engineered or natural antibodies to target specific proteins or antigens for therapeutic purposes.',
        strengths: 'Highly specific targeting, strong efficacy in immune-related diseases, and a proven track record in therapy.',
    },
    {
        id: '10',
        label: 'Small Molecule',
        value: 'NOVEL_CHEMISTRY',
        description: 'Innovative small molecule drugs designed using advanced chemical techniques to target unique mechanisms of action.',
        strengths: 'Highly customizable for specific targets, scalable production, and potential for oral administration.',
    },
    {
        id: '11',
        label: 'Vaccine',
        value: 'VACCINE',
        description: 'Biological preparations that provide immunity to specific diseases, often by stimulating the immune system to recognize and combat pathogens.',
        strengths: 'Prevents disease proactively, adaptable to various pathogens, and scalable for public health impact.',
    },
    {
        id: '12',
        label: 'Cell Therapies',
        value: 'STEM_CELL_TRANSPLANT',
        description: 'The use of stem cells to regenerate or repair damaged tissues and treat conditions like hematological diseases and genetic disorders.',
        strengths: 'Potential for long-term regeneration, versatile applications, and addresses root causes of diseases.',
    },
    {
        id: '13',
        label: 'Other',
        value: 'OTHER',
        description: 'Any additional or emerging therapeutic approaches not covered in the predefined categories.',
        strengths: 'Flexibility to incorporate novel, interdisciplinary methods and adaptability to unique challenges.',
    },
]

export const RESEARCH_PLAN_TYPES: Option[] = MODALITIES.concat(ADDITIONAL_RESEARCH_PLAN_TYPES)

export const ASSOCIATED_SYSTEMS: Option[] = [
    {
        id: '1',
        label: 'Neurological',
        value: 'NEUROLOGICAL',
        description: 'Associated with neurological systems, including the brain, spinal cord, and peripheral nerves.',
        strengths: 'Focuses on diseases and conditions affecting neural pathways and cognitive functions.',
    },
    {
        id: '2',
        label: 'Musculoskeletal',
        value: 'MUSCULOSKELETAL',
        description: 'Pertains to the musculoskeletal system, including bones, muscles, and connective tissues.',
        strengths: 'Addresses conditions like degenerative diseases, structural defects, and mobility impairments.',
    },
    {
        id: '3',
        label: 'Hepatic',
        value: 'HEPATIC',
        description: 'Relates to the liver and its associated functions in metabolism and detoxification.',
        strengths: 'Targets liver-specific conditions and systemic metabolic disorders.',
    },
    {
        id: '4',
        label: 'Cardiovascular',
        value: 'CARDIOVASCULAR',
        description: 'Concerns the heart and blood vessels, including circulatory system-related disorders.',
        strengths: 'Focuses on cardiovascular health, blood flow optimization, and structural heart issues.',
    },
    {
        id: '5',
        label: 'Respiratory',
        value: 'RESPIRATORY',
        description: 'Involves the lungs and respiratory pathways, addressing diseases affecting breathing and oxygen exchange.',
        strengths: 'Targets conditions such as asthma, fibrosis, and respiratory infections.',
    },
    {
        id: '6',
        label: 'Urological',
        value: 'UROLOGICAL',
        description: 'Pertains to the urinary system, including kidneys, ureters, bladder, and urethra.',
        strengths: 'Addresses urological disorders like renal diseases and urinary tract issues.',
    },
    {
        id: '7',
        label: 'Dermatological',
        value: 'DERMATOLOGICAL',
        description: 'Relates to the skin, hair, and nails, including various dermatological diseases and conditions.',
        strengths: 'Targets skin-related issues, including genetic disorders and immune-mediated skin diseases.',
    },
    {
        id: '8',
        label: 'Endocrine',
        value: 'ENDOCRINE',
        description: 'Concerns the endocrine system, including glands that regulate hormones.',
        strengths: 'Focuses on hormonal imbalances, glandular disorders, and metabolic dysfunction.',
    },
    {
        id: '9',
        label: 'Metabolic',
        value: 'METABOLIC',
        description: 'Involves metabolic pathways and disorders, such as enzyme deficiencies and inborn errors of metabolism.',
        strengths: 'Addresses systemic metabolic dysfunctions and energy production issues.',
    },
    {
        id: '10',
        label: 'Hematological',
        value: 'HEMATOLOGICAL',
        description: 'Pertains to blood and its components, including red cells, white cells, platelets, and plasma.',
        strengths: 'Targets conditions like anemias, clotting disorders, and blood cancers.',
    },
    {
        id: '11',
        label: 'Immune',
        value: 'IMMUNE',
        description: 'Relates to the immune system, focusing on disorders like immunodeficiency, autoimmunity, and hypersensitivities.',
        strengths: 'Addresses immune system regulation and immune-related genetic conditions.',
    },
    {
        id: '12',
        label: 'Ophthalmic',
        value: 'OPHTHALMIC',
        description: 'Associated with the eyes and vision-related disorders.',
        strengths: 'Focuses on conditions impacting visual acuity, ocular structures, and retinal health.',
    },
    {
        id: '13',
        label: 'Other',
        value: 'OTHER',
        description: 'Any additional or unclassified associated systems not included in the predefined categories.',
        strengths: 'Allows flexibility to include emerging or unique system-related conditions.',
    },
]

export const ASSOCIATED_CATEGORIES: { id: string; label: string; value: string; description: string }[] = [
    {
        id: '1',
        label: 'Discovery',
        value: 'discovery',
        description: 'Focuses on early-stage research, hypothesis generation, and initial identification of potential treatments.',
    },
    {
        id: '2',
        label: 'Preclinical',
        value: 'preclinical',
        description: 'Covers laboratory and animal studies to assess the safety and efficacy of new treatments before clinical trials.',
    },
    {
        id: '3',
        label: 'Clinical Study',
        value: 'clinical study',
        description: 'Involves human trials to evaluate the safety, efficacy, and outcomes of new medical interventions.',
    },
    {
        id: '4',
        label: 'Disease Models',
        value: 'disease models',
        description: 'Utilizes experimental models to study disease mechanisms and test potential treatments.',
    },
    {
        id: '5',
        label: 'Design & Manufacturing',
        value: 'design & manufacturing',
        description: 'Focuses on the engineering, production, and optimization of medical products and therapeutics.',
    },
    {
        id: '6',
        label: 'Regulatory',
        value: 'regulatory',
        description: 'Covers compliance, approval processes, and regulatory frameworks governing medical treatments and interventions.',
    },
];

export const BUSINESS_TYPES: { id: string; label: string; value: string; description: string }[] = [
    {
        id: '1',
        label: 'Mid-Sized Business',
        value: 'Mid-Sized Business (10-100M TTM Revenue)',
        description: 'Businesses with total trailing twelve-month revenue between $10M and $100M.',
    },
    {
        id: '2',
        label: 'Small Business',
        value: 'Small Business (1-10M TTM Revenue)',
        description: 'Businesses with total trailing twelve-month revenue between $1M and $10M.',
    },
    {
        id: '3',
        label: 'Academic Core Facility',
        value: 'Academic Core Facility',
        description: 'Facilities within academic institutions providing research services and resources.',
    },
    {
        id: '4',
        label: 'New Startup',
        value: 'New Startup (0-1M TTM Revenue)',
        description: 'Early-stage companies with total trailing twelve-month revenue below $1M.',
    },
    {
        id: '5',
        label: 'Consultant',
        value: 'Consultant (5 or more employees)',
        description: 'Consulting firms with at least five employees providing specialized services.',
    },
    {
        id: '6',
        label: 'Large Business',
        value: 'Large Business (>100M TTM Revenue)',
        description: 'Businesses with total trailing twelve-month revenue exceeding $100M.',
    },
    {
        id: '7',
        label: 'Consultant',
        value: 'Consultant (<5 employees)',
        description: 'Independent consultants or small consulting firms with fewer than five employees.',
    },
    {
        id: '8',
        label: 'Non-Profit',
        value: 'Non-Profit',
        description: 'Non-Profits that provide a variety of services',
    },
];

export const CRO_CERTIFICATIONS: { id: string; label: string; value: string; description: string }[] = [
    {
        id: '1',
        label: 'Good Clinical Practice (GCP)',
        value: 'Good Clinical Practice (GCP)',
        description: 'A set of ethical and scientific quality standards for designing, conducting, recording, and reporting clinical trials.',
    },
    {
        id: '2',
        label: 'Good Laboratory Practice (GLP)',
        value: 'Good Laboratory Practice (GLP)',
        description: 'Regulations ensuring the quality and integrity of non-clinical laboratory studies used for research and regulatory submissions.',
    },
    {
        id: '3',
        label: 'Good Manufacturing Practice (GMP)',
        value: 'Good Manufacturing Practice (GMP)',
        description: 'Regulations ensuring that products are consistently produced and controlled according to quality standards.',
    },
    {
        id: '4',
        label: 'Clinical Laboratory Improvement Amendments (CLIA)',
        value: 'Clinical Laboratory Improvement Amendments (CLIA)',
        description: 'Federal regulations establishing quality standards for laboratory testing to ensure accuracy, reliability, and timeliness of results.',
    },
    {
        id: '5',
        label: 'Good Clinical Laboratory Practice (GCLP)',
        value: 'Good Clinical Laboratory Practice (GCLP)',
        description: 'Guidelines ensuring clinical laboratory studies are conducted under regulatory and quality standards for patient safety.',
    },
    {
        id: '6',
        label: 'American Society for Clinical Pathology (ASCP)',
        value: 'American Society for Clinical Pathology (ASCP)',
        description: 'A professional association for pathologists and laboratory professionals setting standards for certification and practice.',
    },
    {
        id: '7',
        label: 'Diplomate of the American Board of Toxicology  (DABT)',
        value: 'Diplomate of the American Board of Toxicology  (DABT)',
        description: 'A certification credential for toxicologists demonstrating expertise in the field of toxicology.',
    },
    {
        id: '8',
        label: 'Assessment and Accreditation of Laboratory Animal Care (AAALAC)',
        value: 'Assessment and Accreditation of Laboratory Animal Care (AAALAC)',
        description: 'A voluntary accreditation organization promoting humane treatment and care of research animals in laboratories.',
    },
    {
        id: '9',
        label: 'Institutional animal care and use committee (IACUC)',
        value: 'Institutional animal care and use committee (IACUC)',
        description: 'A committee overseeing and evaluating all aspects of an institution’s animal care and use program.',
    },
    {
        id: '10',
        label: 'Office of Laboratory Animal Welfare (OLAW)',
        value: 'Office of Laboratory Animal Welfare (OLAW)',
        description: 'A division of the NIH overseeing compliance with policies related to the humane care and use of laboratory animals.',
    },
    {
        id: '11',
        label: 'United States Department of Agriculture (USDA)',
        value: 'United States Department of Agriculture (USDA)',
        description: 'A government agency regulating animal welfare, food safety, and agricultural research to ensure public health and safety.',
    },
];

export const CRO_TAGS: { id: string; label: string; value: string; description: string }[] = [
    {
        id: '1',
        label: 'Experienced in rare disease',
        value: 'Experienced in rare disease',
        description: 'These companies and service providers have experience working within rare disease.',
    },
    {
        id: '1',
        label: 'PAG friendly',
        value: 'PAG friendly',
        description: 'These companies and service providers have experience working with PAGs.',
    },
];

export const MOLECULAR_MECHANISMS: Option[] = [
    {
        id: '1',
        label: 'Loss-of-Function',
        value: 'LOSS_OF_FUNCTION',
        description: 'A molecular mechanism where a mutation results in the reduced or complete loss of a protein\'s normal activity.',
    },
    {
        id: '2',
        label: 'Gain-of-Function',
        value: 'GAIN_OF_FUNCTION',
        description: 'A molecular mechanism where a mutation results in increased, novel, or constitutive activity of a protein.',
    },
    {
        id: '3',
        label: 'Haploinsufficiency',
        value: 'HAPLOINSUFFICIENCY',
        description: 'A mechanism where one copy of a gene is insufficient to produce adequate protein levels for normal function.',
    },
    {
        id: '4',
        label: 'Unknown',
        value: 'UNKNOWN',
        description: 'A molecular mechanism where the specific effect of the mutation on the protein\'s function is not yet determined.',
    },
    {
        id: '5',
        label: 'Other',
        value: 'OTHER',
        description: 'None of the above',
    },
]

export const NODE_TYPE_OPTIONS: Option[] = [
    { 
        label: 'Tool', 
        value: 'ASSET',
        description: 'A tool is a milestone outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.'
    },
    { 
        label: 'Project', 
        value: 'PROJECT',
        description: 'A project is a milestone that is being planned or is under development.'
    },
    { 
        label: 'RFP (Request for Proposals)', 
        value: 'RFP',
        description: 'An RFP is a milestone you’re interested in supporting through funding and/or other resources.'
    },
]

export type StatusType = 'PLANNED' | 'INPROGRESS' | 'COMPLETED'

export const MILESTONE_STATUS_OPTIONS: Option[] = [
    { label: 'Planned', value: 'PLANNED' },
    { label: 'In-Progress', value: 'INPROGRESS' },
    { label: 'Completed', value: 'COMPLETED' }
]

export interface AddressType {
    address1: string;
    address2: string;
    formattedAddress: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    lat: number;
    lng: number;
}

export type DomainVerificationStatusProps =
    | "Valid Configuration"
    | "Invalid Configuration"
    | "Pending Verification"
    | "Domain Not Found"
    | "Unknown Error"

// From https://vercel.com/docs/rest-api/endpoints#get-a-project-domain
export interface DomainResponse {
    name: string
    apexName: string
    projectId: string
    redirect?: string | null
    redirectStatusCode?: (307 | 301 | 302 | 308) | null
    gitBranch?: string | null
    updatedAt?: number
    createdAt?: number
    /** `true` if the domain is verified for use with the project. If `false` it will not be used as an alias on this project until the challenge in `verification` is completed. */
    verified: boolean
    /** A list of verification challenges, one of which must be completed to verify the domain for use on the project. After the challenge is complete `POST /projects/:idOrName/domains/:domain/verify` to verify the domain. Possible challenges: - If `verification.type = TXT` the `verification.domain` will be checked for a TXT record matching `verification.value`. */
    verification: {
        type: string
        domain: string
        value: string
        reason: string
    }[]
}

// From https://vercel.com/docs/rest-api/endpoints#get-a-domain-s-configuration
export interface DomainConfigResponse {
    /** How we see the domain's configuration. - `CNAME`: Domain has a CNAME pointing to Vercel. - `A`: Domain's A record is resolving to Vercel. - `http`: Domain is resolving to Vercel but may be behind a Proxy. - `null`: Domain is not resolving to Vercel. */
    configuredBy?: ("CNAME" | "A" | "http") | null
    /** Which challenge types the domain can use for issuing certs. */
    acceptedChallenges?: ("dns-01" | "http-01")[]
    /** Whether or not the domain is configured AND we can automatically generate a TLS certificate. */
    misconfigured: boolean
}

// From https://vercel.com/docs/rest-api/endpoints#verify-project-domain
export interface DomainVerificationResponse {
    name: string
    apexName: string
    projectId: string
    redirect?: string | null
    redirectStatusCode?: (307 | 301 | 302 | 308) | null
    gitBranch?: string | null
    updatedAt?: number
    createdAt?: number
    /** `true` if the domain is verified for use with the project. If `false` it will not be used as an alias on this project until the challenge in `verification` is completed. */
    verified: boolean
    /** A list of verification challenges, one of which must be completed to verify the domain for use on the project. After the challenge is complete `POST /projects/:idOrName/domains/:domain/verify` to verify the domain. Possible challenges: - If `verification.type = TXT` the `verification.domain` will be checked for a TXT record matching `verification.value`. */
    verification?: {
        type: string
        domain: string
        value: string
        reason: string
    }[]
}

export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string };

export type SERVICE_CATEGORY_MAP = {
    'Literature Searches/Reviews': 'discovery',
    'Pathway Mapping': 'discovery',
    'DNA Mutagenesis': 'discovery',
    'Mutation Data Profiling': 'discovery',
    'SNP Characterization': 'discovery',
    'Health Economics and Outcomes Research (HEOR)': 'clinical study',
    'Non-Interventional Studies': 'clinical study',
    'Observational Research': 'clinical study',
    'Patient-Reported Outcome Studies': 'clinical study',
    'RWE/HEOR Data Analysis': 'clinical study',
    'RWE/HEOR/Market Access Data Analytics': 'clinical study',
    'Real World Evidence (RWE) Studies': 'clinical study',
    'Real-World Data': 'clinical study',
    'Real-World Evidence': 'clinical study',
    'eCOA - Electronic Clinical Outcomes Assessments': 'clinical study',
    'ePRO - Electronic Patient-reported Outcome': 'clinical study',
    'Clinical Data Registry': 'clinical study',
    'Patient Recruitment': 'clinical study',
    'Registries - Disease': 'clinical study',
    'Registries - Patient': 'clinical study',
    'Registries - Product': 'clinical study',
    'Biomarker Analytical Validation': [ 'discovery', 'clinical study' ],
    'Biomarker Clinical Utility': 'discovery',
    'Biomarker Clinical Validation': [ 'discovery', 'clinical study' ],
    'Biomarker Discovery': [ 'discovery', 'clinical study' ],
    'Biomarker Services': [ 'discovery', 'clinical study' ],
    'Biomarker Services Consulting': [ 'discovery', 'clinical study' ],
    'Clinical Biomarker Analysis': [ 'discovery', 'clinical study' ],
    'Diagnostic Biomarkers Discovery': 'discovery',
    'Digital Biomarkers': 'discovery',
    'Discovery Biomarker Analytics': 'discovery',
    'Metabolomics Biomarker Discovery': [ 'discovery', 'preclinical' ],
    'Pharmacodynamic Biomarkers Discovery': 'discovery',
    'Predictive Biomarkers Discovery': [ 'discovery', 'clinical study' ],
    'Prognostic Biomarkers Discovery': [ 'discovery', 'clinical study' ],
    'Translational Biomarker Discovery': [ 'discovery', 'clinical study' ],
    'Biobanking': 'disease models',
    'Cell Culture': 'disease models',
    'Cell Line Authentication': 'disease models',
    'Cell Line Characterization': 'disease models',
    'Cell Line Construction': 'disease models',
    'Human Immortalized Cell Culture': 'disease models',
    'Human Primary Cells': 'disease models',
    'Gene-Edited iPSCs Disease Models': 'disease models',
    "Human iPSC's": 'disease models',
    'Isogenic Knockout iPSC Lines': 'disease models',
    'Knockin Mice': 'disease models',
    'Knockout Mice': 'disease models',
    'Sprague Dawley Rat': 'disease models',
    '3D Cell Culture': 'disease models',
    'Animal Model Development': 'disease models',
    'Human 3D cultures': 'disease models',
    'Human Organoids': 'disease models',
    'In Vitro Disease Models': 'disease models',
    'Model Development': 'disease models',
    'Non-Human Primate Models': 'disease models',
    'Zebrafish Animal Model': 'disease models',
    'Target Validation': 'discovery',
    'Target Validation Consulting': 'discovery',
    'Assay Development': 'preclinical',
    'Assay Development Consulting': 'preclinical',
    'ELISA': 'preclinical',
    'In Vitro Assay Development': 'preclinical',
    'Discovery Compound Screening Analytics': 'discovery',
    'High Throughput Screening': 'discovery',
    'Natural Product Libraries': 'discovery',
    'Natural Product Screening': 'discovery',
    'In Vitro Efficacy Test': 'preclinical',
    'Mouse Efficacy Monotherapy': 'preclinical',
    'Rat Efficacy Monotherapy': 'preclinical',
    'Dose Range Finding Study - Dog /Canine': 'preclinical',
    'Dose Range Finding Study - Mouse': 'preclinical',
    'Dose Range Finding Study - Other Species': 'preclinical',
    'Dose Range Finding Study - Rat': 'preclinical',
    'In Vitro Dose Determination Tests': 'preclinical',
    'In Vitro Toxicology Testing': 'preclinical',
    'General Toxicology': 'preclinical',
    'Mammalian Toxicology': 'preclinical',
    'Toxicology Consulting': 'preclinical',
    'Drug Distribution Studies': 'preclinical',
    'Adeno Associated Virus (AAV) Production': 'design & manufacturing',
    'GLP Large Molecule Bioanalysis': 'design & manufacturing',
    'Gene Synthesis': 'design & manufacturing',
    'Gene/Oligo Synthesis': 'design & manufacturing',
    'Oligo Synthesis': 'design & manufacturing',
    'Plasmid DNA Preparation and Extraction': 'design & manufacturing',
    'RNA oligo synthesis': 'design & manufacturing',
    'Chemistry Manufacturing and Controls (CMC)': 'design & manufacturing',
    'Chemistry Manufacturing and Controls (CMC) Consulting': 'design & manufacturing',
    'GMP Synthesis': 'design & manufacturing',
    'Large Scale Purification': 'design & manufacturing',
    'IND Enabling Package': 'regulatory',
    'IND Writing': 'regulatory',
    'IND Writing Consulting': 'regulatory',
    'Investigational Medicinal Product Dossier (IMPD) and Investigational New Drug (IND) Dossier': 'regulatory',
    'Regulatory Starting Materials': 'regulatory',
    'Site Selection': 'clinical study',
    'Study/Site Feasibility Study': 'clinical study',
    'Clinical Trial Recruitment': 'clinical study',
    'Clinical Trial Consulting': 'clinical study',
    'Clinical Trial Design': 'clinical study',
    'Clinical Trial Feasibility': 'clinical study',
    'Phase 1-3 Studies': 'clinical study',
    'Post-Marketing (Phase 4) Studies': 'clinical study'
}

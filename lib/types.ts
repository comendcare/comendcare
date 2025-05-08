import {
    User,
    Post,
    Comment,
    Prisma,
    Review,
    Organization,
    Member,
    Company,
    SavedCompany,
    MilestoneType,
    ExternalContact,
    ExternalAttachment,
    ReviewFeedback, Service,
    Milestone as DBMilestone,
    Asset as DBAsset,
    RFP as DBRFP
} from "@prisma/client";
import { StaticImageData } from "next/image";

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

export type Asset = Omit<Prisma.AssetGetPayload<{
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
        asset?: DBAsset,
        assetId: string,
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
        attachments: true,
        types: { include: { milestoneType: true, milestoneTypeId: true, milestoneId: true } },
        assets: { include: { asset: true, assetId: true, milestoneId: true } },
        rfps: { include: { rfp: true, rfpId: true, milestoneId: true } }
    }
}>, ("types" | "assets" | "rfps")> & {
    types: Array<{
        milestoneType?: MilestoneType; // Optional
        milestoneId?: string; // Optional
        milestoneTypeId: string; // Required
    }>,
    assets: Array<{
        asset?: DBAsset,
        milestoneId?: string,
        assetId: string
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

export type AssetTableData = Asset & {
    asset: Asset
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

export type TagType = "start" | "contribute" | "rules" | "resource" | "guide" | "collections"

export interface ArticleType {
    prompt: string
    description?: string
    href: string
    tags: TagType[]
    thumbnailSrc?: StaticImageData
    imgParams: string
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
        label: 'Gene Editing',
        value: 'GENE_EDITING',
        description: 'A technology for directly altering the DNA of an organism, including techniques like CRISPR/Cas9 to modify genes for therapeutic purposes.',
        strengths: 'Highly versatile, precise gene modifications, and potential for permanent therapeutic outcomes.',
    },
    {
        id: '3',
        label: 'Antisense Oligonucleotide (ASO)',
        value: 'ANTISENSE_OLIGONUCLEOTIDE',
        description: 'Short, synthetic strands of DNA or RNA designed to bind to specific mRNA sequences, modifying gene expression or protein production.',
        strengths: 'Targets specific genes, reversible effects, and customizable for various genetic disorders.',
    },
    {
        id: '4',
        label: 'Other RNA Therapy',
        value: 'OTHER_RNA_THERAPY',
        description: 'A broad category of therapies leveraging RNA molecules, such as RNA interference (RNAi) and mRNA vaccines, to modulate gene expression or induce immune responses.',
        strengths: 'Rapid development timelines, adaptable to different diseases, and avoids permanent DNA alterations.',
    },
    {
        id: '5',
        label: 'Enzyme Replacement',
        value: 'ENZYME_REPLACEMENT',
        description: 'A treatment approach involving the administration of exogenous enzymes to replace deficient or malfunctioning enzymes in patients.',
        strengths: 'Addresses underlying enzyme deficiencies, well-established for several metabolic disorders, and provides symptomatic relief.',
    },
    {
        id: '6',
        label: 'Drug Repurposing or Drug Screening',
        value: 'DRUG_REPURPOSING_SCREENING',
        description: 'Strategies to identify new therapeutic uses for existing drugs or discover novel compounds for specific diseases through systematic screening.',
        strengths: 'Reduces development timelines, leverages existing safety profiles, and cost-effective compared to de novo drug development.',
    },
    {
        id: '7',
        label: 'Pathway Modulators',
        value: 'PATHWAY_MODULATORS',
        description: 'Therapies designed to target and modulate biological pathways involved in disease processes, such as signaling cascades and metabolic pathways.',
        strengths: 'Addresses disease mechanisms at a systemic level, potential for broad applications, and integrates well with other therapeutic modalities.',
    },
    {
        id: '8',
        label: 'Antibodies',
        value: 'ANTIBODIES',
        description: 'Biologics that use engineered or natural antibodies to target specific proteins or antigens for therapeutic purposes.',
        strengths: 'Highly specific targeting, strong efficacy in immune-related diseases, and a proven track record in therapy.',
    },
    {
        id: '9',
        label: 'Vaccine',
        value: 'VACCINE',
        description: 'Biological preparations that provide immunity to specific diseases, often by stimulating the immune system to recognize and combat pathogens.',
        strengths: 'Prevents disease proactively, adaptable to various pathogens, and scalable for public health impact.',
    },
    {
        id: '10',
        label: 'Novel Chemistry',
        value: 'NOVEL_CHEMISTRY',
        description: 'Innovative small molecule drugs designed using advanced chemical techniques to target unique mechanisms of action.',
        strengths: 'Highly customizable for specific targets, scalable production, and potential for oral administration.',
    },
    {
        id: '11',
        label: 'Stem Cell Transplant',
        value: 'STEM_CELL_TRANSPLANT',
        description: 'The use of stem cells to regenerate or repair damaged tissues and treat conditions like hematological diseases and genetic disorders.',
        strengths: 'Potential for long-term regeneration, versatile applications, and addresses root causes of diseases.',
    },
    {
        id: '12',
        label: 'Other',
        value: 'OTHER',
        description: 'Any additional or emerging therapeutic approaches not covered in the predefined categories.',
        strengths: 'Flexibility to incorporate novel, interdisciplinary methods and adaptability to unique challenges.',
    },
]

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


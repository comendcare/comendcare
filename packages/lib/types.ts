import type {
    Column,
    RequestComment,
    PostComment,
    Company,
    ConditionToOrganization,
    Member,
    Milestone as DBMilestone,
    MilestoneType,
    Organization,
    Post,
    Review,
    ReviewFeedback,
    RFP as DBRFP,
    SavedCompany,
    Service,
    Tool as DBAsset,
    User,
    MaterialAndDataAccessRequest,
    Researcher,
    Institution,
    SavedOrganization,
    Biosample,
    DiseaseModel,
    Invitation,
    Tool
} from "@prisma/client";
import {Prisma} from "@prisma/client";
import {z} from "zod";
import type {BadgeVariantType} from "@comend/components/ui/badge"

export const BIOMARKER_TYPES = [
    { id: "DIAGNOSTIC", label: "Diagnostic Biomarker", value: "diagnostic" },
    { id: "MONITORING", label: "Monitoring Biomarker", value: "monitoring" },
    { id: "PREDICTIVE", label: "Predictive Biomarker", value: "predictive" },
    { id: "PROGNOSTIC", label: "Prognostic Biomarker", value: "prognostic" },
    { id: "RESPONSE", label: "Response Biomarker", value: "response" },
    { id: "SAFETY", label: "Safety Biomarker", value: "safety" },
    { id: "SUSCEPTIBILITY_RISK", label: "Susceptibility/Risk Biomarker", value: "susceptibility_risk" },
    { id: "MULTICOMPONENT", label: "Multicomponent Biomarker", value: "multicomponent" },
]

export const ACADEMIC_ROLES = [
    {
        id: "PI",
        label: "Principal Investigator",
        value: "pi",
    },
    {
        id: "POSTDOC",
        label: "Postdoc",
        value: "postdoc",
    },
    {
        id: "PHD_STUDENT",
        label: "PhD Student",
        value: "phd_student",
    },
    {
        id: "OTHER",
        label: "Other",
        value: "other",
    },
];

export const COUNTRIES: Option[] = [
    { id: "1", label: "Afghanistan", value: "AF" },
    { id: "2", label: "Albania", value: "AL" },
    { id: "3", label: "Algeria", value: "DZ" },
    { id: "4", label: "Andorra", value: "AD" },
    { id: "5", label: "Angola", value: "AO" },
    { id: "6", label: "Antigua and Barbuda", value: "AG" },
    { id: "7", label: "Argentina", value: "AR" },
    { id: "8", label: "Armenia", value: "AM" },
    { id: "9", label: "Australia", value: "AU" },
    { id: "10", label: "Austria", value: "AT" },
    { id: "11", label: "Azerbaijan", value: "AZ" },
    { id: "12", label: "Bahamas", value: "BS" },
    { id: "13", label: "Bahrain", value: "BH" },
    { id: "14", label: "Bangladesh", value: "BD" },
    { id: "15", label: "Barbados", value: "BB" },
    { id: "16", label: "Belarus", value: "BY" },
    { id: "17", label: "Belgium", value: "BE" },
    { id: "18", label: "Belize", value: "BZ" },
    { id: "19", label: "Benin", value: "BJ" },
    { id: "20", label: "Bhutan", value: "BT" },
    { id: "21", label: "Bolivia", value: "BO" },
    { id: "22", label: "Bosnia and Herzegovina", value: "BA" },
    { id: "23", label: "Botswana", value: "BW" },
    { id: "24", label: "Brazil", value: "BR" },
    { id: "25", label: "Brunei", value: "BN" },
    { id: "26", label: "Bulgaria", value: "BG" },
    { id: "27", label: "Burkina Faso", value: "BF" },
    { id: "28", label: "Burundi", value: "BI" },
    { id: "29", label: "Cabo Verde", value: "CV" },
    { id: "30", label: "Cambodia", value: "KH" },
    { id: "31", label: "Cameroon", value: "CM" },
    { id: "32", label: "Canada", value: "CA" },
    { id: "33", label: "Central African Republic", value: "CF" },
    { id: "34", label: "Chad", value: "TD" },
    { id: "35", label: "Chile", value: "CL" },
    { id: "36", label: "China", value: "CN" },
    { id: "37", label: "Colombia", value: "CO" },
    { id: "38", label: "Comoros", value: "KM" },
    { id: "39", label: "Congo (Congo-Brazzaville)", value: "CG" },
    { id: "40", label: "Costa Rica", value: "CR" },
    { id: "41", label: "Croatia", value: "HR" },
    { id: "42", label: "Cuba", value: "CU" },
    { id: "43", label: "Cyprus", value: "CY" },
    { id: "44", label: "Czechia", value: "CZ" },
    { id: "45", label: "Democratic Republic of the Congo", value: "CD" },
    { id: "46", label: "Denmark", value: "DK" },
    { id: "47", label: "Djibouti", value: "DJ" },
    { id: "48", label: "Dominica", value: "DM" },
    { id: "49", label: "Dominican Republic", value: "DO" },
    { id: "50", label: "Ecuador", value: "EC" },
    { id: "51", label: "Egypt", value: "EG" },
    { id: "52", label: "El Salvador", value: "SV" },
    { id: "53", label: "Equatorial Guinea", value: "GQ" },
    { id: "54", label: "Eritrea", value: "ER" },
    { id: "55", label: "Estonia", value: "EE" },
    { id: "56", label: "Eswatini", value: "SZ" },
    { id: "57", label: "Ethiopia", value: "ET" },
    { id: "58", label: "Fiji", value: "FJ" },
    { id: "59", label: "Finland", value: "FI" },
    { id: "60", label: "France", value: "FR" },
    { id: "61", label: "Gabon", value: "GA" },
    { id: "62", label: "Gambia", value: "GM" },
    { id: "63", label: "Georgia", value: "GE" },
    { id: "64", label: "Germany", value: "DE" },
    { id: "65", label: "Ghana", value: "GH" },
    { id: "66", label: "Greece", value: "GR" },
    { id: "67", label: "Grenada", value: "GD" },
    { id: "68", label: "Guatemala", value: "GT" },
    { id: "69", label: "Guinea", value: "GN" },
    { id: "70", label: "Guinea-Bissau", value: "GW" },
    { id: "71", label: "Guyana", value: "GY" },
    { id: "72", label: "Haiti", value: "HT" },
    { id: "73", label: "Honduras", value: "HN" },
    { id: "74", label: "Hungary", value: "HU" },
    { id: "75", label: "Iceland", value: "IS" },
    { id: "76", label: "India", value: "IN" },
    { id: "77", label: "Indonesia", value: "ID" },
    { id: "78", label: "Iran", value: "IR" },
    { id: "79", label: "Iraq", value: "IQ" },
    { id: "80", label: "Ireland", value: "IE" },
    { id: "81", label: "Israel", value: "IL" },
    { id: "82", label: "Italy", value: "IT" },
    { id: "83", label: "Jamaica", value: "JM" },
    { id: "84", label: "Japan", value: "JP" },
    { id: "85", label: "Jordan", value: "JO" },
    { id: "86", label: "Kazakhstan", value: "KZ" },
    { id: "87", label: "Kenya", value: "KE" },
    { id: "88", label: "Kiribati", value: "KI" },
    { id: "89", label: "Kuwait", value: "KW" },
    { id: "90", label: "Kyrgyzstan", value: "KG" },
    { id: "91", label: "Laos", value: "LA" },
    { id: "92", label: "Latvia", value: "LV" },
    { id: "93", label: "Lebanon", value: "LB" },
    { id: "94", label: "Lesotho", value: "LS" },
    { id: "95", label: "Liberia", value: "LR" },
    { id: "96", label: "Libya", value: "LY" },
    { id: "97", label: "Liechtenstein", value: "LI" },
    { id: "98", label: "Lithuania", value: "LT" },
    { id: "99", label: "Luxembourg", value: "LU" },
    { id: "100", label: "Madagascar", value: "MG" },
    { id: "101", label: "Malawi", value: "MW" },
    { id: "102", label: "Malaysia", value: "MY" },
    { id: "103", label: "Maldives", value: "MV" },
    { id: "104", label: "Mali", value: "ML" },
    { id: "105", label: "Malta", value: "MT" },
    { id: "106", label: "Marshall Islands", value: "MH" },
    { id: "107", label: "Mauritania", value: "MR" },
    { id: "108", label: "Mauritius", value: "MU" },
    { id: "109", label: "Mexico", value: "MX" },
    { id: "110", label: "Micronesia", value: "FM" },
    { id: "111", label: "Moldova", value: "MD" },
    { id: "112", label: "Monaco", value: "MC" },
    { id: "113", label: "Mongolia", value: "MN" },
    { id: "114", label: "Montenegro", value: "ME" },
    { id: "115", label: "Morocco", value: "MA" },
    { id: "116", label: "Mozambique", value: "MZ" },
    { id: "117", label: "Myanmar", value: "MM" },
    { id: "118", label: "Namibia", value: "NA" },
    { id: "119", label: "Nauru", value: "NR" },
    { id: "120", label: "Nepal", value: "NP" },
    { id: "121", label: "Netherlands", value: "NL" },
    { id: "122", label: "New Zealand", value: "NZ" },
    { id: "123", label: "Nicaragua", value: "NI" },
    { id: "124", label: "Niger", value: "NE" },
    { id: "125", label: "Nigeria", value: "NG" },
    { id: "126", label: "North Korea", value: "KP" },
    { id: "127", label: "North Macedonia", value: "MK" },
    { id: "128", label: "Norway", value: "NO" },
    { id: "129", label: "Oman", value: "OM" },
    { id: "130", label: "Pakistan", value: "PK" },
    { id: "131", label: "Palau", value: "PW" },
    { id: "132", label: "Panama", value: "PA" },
    { id: "133", label: "Papua New Guinea", value: "PG" },
    { id: "134", label: "Paraguay", value: "PY" },
    { id: "135", label: "Peru", value: "PE" },
    { id: "136", label: "Philippines", value: "PH" },
    { id: "137", label: "Poland", value: "PL" },
    { id: "138", label: "Portugal", value: "PT" },
    { id: "139", label: "Qatar", value: "QA" },
    { id: "140", label: "Romania", value: "RO" },
    { id: "141", label: "Russia", value: "RU" },
    { id: "142", label: "Rwanda", value: "RW" },
    { id: "143", label: "Saint Kitts and Nevis", value: "KN" },
    { id: "144", label: "Saint Lucia", value: "LC" },
    { id: "145", label: "Saint Vincent and the Grenadines", value: "VC" },
    { id: "146", label: "Samoa", value: "WS" },
    { id: "147", label: "San Marino", value: "SM" },
    { id: "148", label: "Sao Tome and Principe", value: "ST" },
    { id: "149", label: "Saudi Arabia", value: "SA" },
    { id: "150", label: "Senegal", value: "SN" },
    { id: "151", label: "Serbia", value: "RS" },
    { id: "152", label: "Seychelles", value: "SC" },
    { id: "153", label: "Sierra Leone", value: "SL" },
    { id: "154", label: "Singapore", value: "SG" },
    { id: "155", label: "Slovakia", value: "SK" },
    { id: "156", label: "Slovenia", value: "SI" },
    { id: "157", label: "Solomon Islands", value: "SB" },
    { id: "158", label: "Somalia", value: "SO" },
    { id: "159", label: "South Africa", value: "ZA" },
    { id: "160", label: "South Korea", value: "KR" },
    { id: "161", label: "South Sudan", value: "SS" },
    { id: "162", label: "Spain", value: "ES" },
    { id: "163", label: "Sri Lanka", value: "LK" },
    { id: "164", label: "Sudan", value: "SD" },
    { id: "165", label: "Suriname", value: "SR" },
    { id: "166", label: "Sweden", value: "SE" },
    { id: "167", label: "Switzerland", value: "CH" },
    { id: "168", label: "Syria", value: "SY" },
    { id: "169", label: "Taiwan", value: "TW" },
    { id: "170", label: "Tajikistan", value: "TJ" },
    { id: "171", label: "Tanzania", value: "TZ" },
    { id: "172", label: "Thailand", value: "TH" },
    { id: "173", label: "Timor-Leste", value: "TL" },
    { id: "174", label: "Togo", value: "TG" },
    { id: "175", label: "Tonga", value: "TO" },
    { id: "176", label: "Trinidad and Tobago", value: "TT" },
    { id: "177", label: "Tunisia", value: "TN" },
    { id: "178", label: "Turkey", value: "TR" },
    { id: "179", label: "Turkmenistan", value: "TM" },
    { id: "180", label: "Tuvalu", value: "TV" },
    { id: "181", label: "Uganda", value: "UG" },
    { id: "182", label: "Ukraine", value: "UA" },
    { id: "183", label: "United Arab Emirates", value: "AE" },
    { id: "184", label: "United Kingdom", value: "GB" },
    { id: "185", label: "United States", value: "US" },
    { id: "186", label: "Uruguay", value: "UY" },
    { id: "187", label: "Uzbekistan", value: "UZ" },
    { id: "188", label: "Vanuatu", value: "VU" },
    { id: "189", label: "Vatican City", value: "VA" },
    { id: "190", label: "Venezuela", value: "VE" },
    { id: "191", label: "Vietnam", value: "VN" },
    { id: "192", label: "Yemen", value: "YE" },
    { id: "193", label: "Zambia", value: "ZM" },
    { id: "194", label: "Zimbabwe", value: "ZW" },
];

export const mechanisms = [
    {id: "GENETIC_MUTATION", name: "Genetic mutation"},
    {id: "CHROMOSOMAL_ABNORMALITY", name: "Chromosomal abnormality"},
    {id: "IMMUNE_DYSFUNCTION", name: "Immune dysfunction"},
    {id: "METABOLIC_DEFECT", name: "Metabolic pathway defect"},
    {id: "MITOCHONDRIAL_ABNORMALITY", name: "Mitochondrial abnormality"},
    {id: "EPIGENETIC_MODIFICATION", name: "Epigenetic modification"}
];

export const orgForAnalyticsInclude = Prisma.validator<Prisma.OrganizationSelect>()({
    id: true,
    public: true,
    verified: true,
    published: true,
    name: true,
    description: true,
    contactEmail: true,
    logo: true,
    image: true,
    headerImage: true,
    biopharmaConsentSettings: true,
    subdomain: true,
    customDomain: true,
    statedGoal: true,
    yearFounded: true,
    incorporationStatus: true,
    therapeuticsOfInterest: true,
    therapeuticsInDevelopment: true,
    website: true,
    moneyRaised: true,
    moneyDeployed: true,
    researchBudget: true,
    createdAt: true,
    updatedAt: true,
    user: true,
    userId: true,
    roadmaps: true,
    members: true,
    clients: true,
    invitations: true,
    membershipRequests: true,
    kanban: true,
    milestones: true,
    platformNotifications: true,
    reviews: true,
    savedCompanies: true,
    tools: true,
    rfps: true,
    conditions: { include: { condition: true } }, // keep nested include here
    biosamples: true,
    diseaseModel: true,
    materialAndDataAccessRequests: true,
    metadata: true,
});

// Type of an Organization with the relations above
export type OrganizationForAnalytics = Prisma.OrganizationGetPayload<{
    include: typeof orgForAnalyticsInclude;
}>;

export const GLOBAL_FEED_TYPES = [
    "SERVICE_PROVIDER_CREATED",
    "PAG_PROFILE_CREATED",
] as const

export type Actor = { userId: string; userName?: string };

export type FeedItemType =
    | "RFP_DEADLINE_APPROACHING"
    | "RFP_CLOSED"
    | "FDA_MEDWATCH_ALERT"
    | "FDA_WHATS_NEW_DRUGS"
    | "FDA_WHATS_NEW_VBB"
    | "FDA_PRESS_RELEASE"
    | "CTG_TRIAL_POSTED"
    | "ORG_UPDATED"
    | "ORG_RESEARCH_PLAN_CREATED"
    | "ORG_RESEARCH_PLAN_UPDATED"
    | "ORG_CREATED_PROJECT"
    | "ORG_UPDATED_PROJECT"
    | "ORG_CREATED_TOOL"
    | "ORG_UPDATED_TOOL"
    | "ORG_CREATED_RFP"
    | "PAPER_PUBLISHED_AGNOSTIC"
    | "PAPER_PUBLISHED_GROUP"
    | "SERVICE_PROVIDER_CREATED"
    | "PAG_PROFILE_CREATED"
    | "TOOL_REQUEST_CREATED"
    | "TOOL_REQUEST_COMMENT_CREATED"
    | "TOOL_REQUEST_APPROVED"
    | "FEED_POST_CREATED"
    | "COMEND_UPDATE"
    | "SERVICE_PROVIDER_RECOMMENDED"
    | "PAG_RECOMMENDED"
    | "PROJECTS_RECOMMENDED"
    | "ANALYTICS_GOAL_REACHED"
    | "RESEARCHER_RECOMMENDED"
    | "USER_ACCEPTED_ORGANIZATION_INVITATION";

export interface FeedItemDTO {
    id: string;
    type: FeedItemType;
    title: string;
    content: Record<string, any> | null;
    source: "USER" | "PLATFORM" | "THIRD_PARTY";
    externalUrl?: string | null;
    createdAt: string; // ISO from API
    orgId?: string | null;
    orgSubdomain?: string | null;
    userId?: string | null;
}

export interface FeedPageDTO {
    items: FeedItemDTO[];
    nextCursor: { createdAt: string; id: string } | null;
}

export const FeedItemType = z.enum([
    "ORG_UPDATED", "ORG_RESEARCH_PLAN_CREATED", "ORG_RESEARCH_PLAN_UPDATED", "ORG_CREATED_PROJECT", "ORG_UPDATED_PROJECT", "ORG_CREATED_TOOL", "ORG_UPDATED_TOOL", "ORG_CREATED_RFP",
    "RFP_DEADLINE_APPROACHING", "RFP_CLOSED",
    "PAPER_PUBLISHED_AGNOSTIC", "PAPER_PUBLISHED_GROUP",
    "SERVICE_PROVIDER_CREATED", "PAG_PROFILE_CREATED",
    "TOOL_REQUEST_CREATED", "TOOL_REQUEST_COMMENT_CREATED", "TOOL_REQUEST_APPROVED", "FEED_POST_CREATED",
    "COMEND_UPDATE", "SERVICE_PROVIDER_RECOMMENDED", "PAG_RECOMMENDED",
    "PROJECTS_RECOMMENDED", "ANALYTICS_GOAL_REACHED",
    "RESEARCHER_RECOMMENDED", "CTG_TRIAL_POSTED",
    "FDA_MEDWATCH_ALERT", "FDA_WHATS_NEW_DRUGS", "FDA_WHATS_NEW_VBB", "FDA_PRESS_RELEASE",
    "USER_ACCEPTED_ORGANIZATION_INVITATION"
]);

export const FeedSource = z.enum(["USER", "PLATFORM", "THIRD_PARTY"]);

export const CanonicalFeed = z.object({
    type: FeedItemType,
    source: FeedSource,
    title: z.string().min(1),
    content: z.record(z.any()).optional(), // JSONB payload (typed per type below)
    externalUrl: z.string().url().optional(),
    orgId: z.string().optional(),
    userId: z.string().optional(),
    occurredAt: z.date(),
    // must uniquely identify the logical item for idempotency (hashable)
    idempotencyKey: z.string().min(8),
});

export type RequestFiltersType = {
    statuses: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    types: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
}

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
        biosamples: { include: {biosample: true, biosampleId: true, milestoneId: true}},
        diseaseModels: {include: {diseaseModel: true, diseaseModelId: true, milestoneId: true}},
        tools: { include: { tool: true, toolId: true, milestoneId: true } },
        rfps: { include: { rfp: true, rfpId: true, milestoneId: true } },
        companies: {include: {company: true, companyId: true, milestoneId: true}},
        institutions: {include: {institution: true, institutionId: true, milestoneId: true}}
        createFacilityRequests: true,
    }
}>, ("types" | "tools" | "rfps")> & {
    types: Array<{
        milestoneType?: MilestoneType; // Optional
        milestoneId?: string; // Optional
        milestoneTypeId: string; // Required
    }>,
    biosamples: Array<{
        biosample?: Biosample,
        milestoneId?: string,
        biosampleId: string
    }>,
    diseaseModels: Array<{
        diseaseModel?: DiseaseModel,
        milestoneId?: string,
        diseaseModelId: string
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
    }>,
    companies: Array<{
        company?: Company,
        milestoneId?: string,
        companyId: string,
    }>,
    institutions: Array<{
        institution?: Institution,
        milestoneId?: string,
        institutionId: string,
    }>
    label?: string // used for badges in the provider marketplace
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
    img: z.string().optional(),
    variant: z.custom<BadgeVariantType>().optional()
})

export type ImportSchemaEntry = {
    spreadsheetKey: string,
    databaseKey: string,
    required: boolean,
    defaultValue: any,
    isValid: (entry: string) => boolean,
    fetchDatabaseValue?: (entry: string) => Promise<any>,
}

export type AssetTableData = Asset & {
    tool: Asset
}

export type SavedCompanyData = SavedCompany & {
    company: Company;
    milestone: Milestone;
};

export type SavedOrganizationData = SavedOrganization & {
    organization: Organization,
    savedOrganization: Organization
}

export interface CompanyWithReviewsAndServices extends Company {
    biosamples: Biosample[];
    diseaseModel: DiseaseModel[];
    tool: Tool[];
    reviews: ReviewWithAuthor[];
    services: Service[]
}

export type MembershipWithOrganization = Partial<Member> & {
    organization?: Partial<Organization> | null; // Optional because the organization might be null if not fetched
};

export type InvitationWithOrganization = Partial<Invitation> & {
    organization?: Partial<Organization> | null; // Optional because the organization might be null if not fetched
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

export type MemberRequestWithUserAndOrganization = Prisma.MemberRequestGetPayload<{
    include: { user: true, organization: true };
}>;

export type CommentWithUser = Prisma.RequestCommentGetPayload<{
    include: { author: true };
}>;

export type PostWithAuthorAndComments = Post & {
    author: User
    comments: PostComment[]
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

export const BIOSAMPLE_AVAILABILTIY_OPTIONS: Option[] = [
    {label: 'Available', value: 'AVAILABLE'},
    {label: 'Reserved', value: 'RESERVED'},
    {label: 'Depleted', value: 'DEPLETED'}
]

export const SAMPLE_PRESERVATION_METHOD_OPTIONS: Option[] = [
    {
        label: 'Fresh',
        value: 'FRESH'
    },
    {
        label: 'Frozen',
        value: 'FROZEN'
    },
    {
        label: 'Formalin-Fixed Paraffin-Embedded (FFPE)',
        value: 'FFPE'
    },
    {
        label: 'Stabilized in RNAlater',
        value: 'RNALATER'
    },
    {
        label: 'Lyophilized (Freeze-Dried)',
        value: 'LYOPHILIZED'
    },
    {
        label: 'Cryopreserved',
        value: 'CRYOPRESERVED'
    },
    {
        label: 'Preserved in Alcohol',
        value: 'ALCOHOL'
    },
    {
        label: 'Room Temperature Stabilized',
        value: 'ROOMTEMP'
    },
    {
        label: 'Other Chemical Fixative',
        value: 'FIXED_OTHER'
    },
    {
        label: 'Unknown',
        value: 'UNKNOWN'
    }
];

export const ANATOMICAL_SITE_OPTIONS: Option[] = [
    {label: 'Anterior abdominal wall / Peritoneal cavity', value: 'ANTERIORABDOMINALWALL/PERITONEALCAVITY'},
    { label: 'Blood vessels', value: 'BLOODVESSELS' },
    { label: 'Bladder', value: 'BLADDER' },
    { label: 'Bone marrow', value: 'BONEMARROW' },
    { label: 'Brain', value: 'BRAIN' },
    { label: 'Buccal mucosa (cheek)', value: 'BUCCALMUCOSA(CHEEK)' },
    { label: 'Colon / Rectum', value: 'COLON/RECTUM' },
    { label: 'Eye (anterior chamber)', value: 'EYE(ANTERIORCHAMBER)' },
    { label: 'Eye (retro-orbital sinus)', value: 'EYE(RETRO-ORBITALSINUS' },
    { label: 'Fingertip / Heel', value: 'FINGERTIP/HEEL' },
    { label: 'Hair follicle / Nails', value: 'HAIRFOLLICLE/NAILS' },
    { label: 'Heart', value: 'HEART' },
    { label: 'Liver', value: 'LIVER' },
    { label: 'Lung', value: 'LUNG' },
    { label: 'Muscle', value: 'MUSCLE' },
    { label: 'Oral cavity / Salivary', value: 'ORALCAVITY/SALIVARY' },
    { label: 'Skin', value: 'SKIN' },
    { label: 'Spinal cord / Cistern', value: 'SPINALCORD/CISTERN' },
    { label: 'Tail (mouse)', value: 'TAIL' },
    { label: 'Tissues / Organs (general)', value: 'TISSUES/ORGANS' },
    { label: 'Urinary tract / Urethr', value: 'URINARYTRACT/URETHR' },
    { label: 'Other', value: 'OTHER' },
    { label: 'Unknown', value: 'UNKNOWN' }
]

export const SAMPLE_TRANSPORT_METHOD_OPTIONS: Option[] = [
    {
        label: 'Ambient Temperature',
        value: 'AMBIENT'
    },
    {
        label: 'Cold Pack (2–8°C)',
        value: 'COLD_PACK'
    },
    {
        label: 'Dry Ice (−78.5°C)',
        value: 'DRY_ICE'
    },
    {
        label: 'Liquid Nitrogen (LN₂)',
        value: 'LN2'
    },
    {
        label: 'Courier / Hand Delivery',
        value: 'COURIER'
    },
    {
        label: 'Standard Mail / Postal Service',
        value: 'MAIL'
    },
    {
        label: 'Specialized Medical Transport',
        value: 'SPECIALIZED'
    },
    {
        label: 'Transport with Electronic Tracking',
        value: 'ELECTRONIC_TRACKING'
    },
    {
        label: 'Unknown',
        value: 'UNKNOWN'
    }
];

export const DIAGNOSIS_SEVERITY_OPTIONS: Option[] = [
    {label: 'Mild', value: 'MILD', badgeVariant: 'cyan'},
    // {label: 'Moderate', value: 'MODERATE', badgeVariant: 'emerald'},
    // {label: 'Severe', value: 'SEVERE', badgeVariant: 'lime'},
    // {label: 'Life-threatening/Critical', value: 'CRITICAL', badgeVariant: 'yellow'},
    // {label: 'Terminal', value: 'TERMINAL', badgeVariant: 'orange'},
    {label: 'Moderate', value: 'MODERATE', badgeVariant: 'cyan'},
    {label: 'Severe', value: 'SEVERE', badgeVariant: 'cyan'},
    {label: 'Life-threatening/Critical', value: 'CRITICAL', badgeVariant: 'cyan'},
    {label: 'Terminal', value: 'TERMINAL', badgeVariant: 'cyan'},
]

export const AVAILABILITY_OPTIONS: Option[] = [
    {label: 'Available', value: 'AVAILABLE', badgeVariant: 'green'},
    {label: 'Reserved', value: 'RESERVED', badgeVariant: 'yellow'},
    {label: 'Depleted', value: 'DEPLETED', badgeVariant: 'red'},
]

export const COUNTRY_OPTIONS: Option[] = [
  { label: 'United States of America', value: 'US' },
  { label: 'Canada', value: 'CA' },
  { label: 'Afghanistan', value: 'AF' },
  { label: 'Albania', value: 'AL' },
  { label: 'Algeria', value: 'DZ' },
  { label: 'Andorra', value: 'AD' },
  { label: 'Angola', value: 'AO' },
  { label: 'Antigua and Barbuda', value: 'AG' },
  { label: 'Argentina', value: 'AR' },
  { label: 'Armenia', value: 'AM' },
  { label: 'Australia', value: 'AU' },
  { label: 'Austria', value: 'AT' },
  { label: 'Azerbaijan', value: 'AZ' },
  { label: 'Bahamas', value: 'BS' },
  { label: 'Bahrain', value: 'BH' },
  { label: 'Bangladesh', value: 'BD' },
  { label: 'Barbados', value: 'BB' },
  { label: 'Belarus', value: 'BY' },
  { label: 'Belgium', value: 'BE' },
  { label: 'Belize', value: 'BZ' },
  { label: 'Benin', value: 'BJ' },
  { label: 'Bhutan', value: 'BT' },
  { label: 'Bolivia', value: 'BO' },
  { label: 'Bosnia and Herzegovina', value: 'BA' },
  { label: 'Botswana', value: 'BW' },
  { label: 'Brazil', value: 'BR' },
  { label: 'Brunei', value: 'BN' },
  { label: 'Bulgaria', value: 'BG' },
  { label: 'Burkina Faso', value: 'BF' },
  { label: 'Burundi', value: 'BI' },
  { label: 'Cabo Verde', value: 'CV' },
  { label: 'Cambodia', value: 'KH' },
  { label: 'Cameroon', value: 'CM' },
  { label: 'Central African Republic', value: 'CF' },
  { label: 'Chad', value: 'TD' },
  { label: 'Chile', value: 'CL' },
  { label: 'China', value: 'CN' },
  { label: 'Colombia', value: 'CO' },
  { label: 'Comoros', value: 'KM' },
  { label: 'Congo (DRC)', value: 'CD' },
  { label: 'Congo (Republic)', value: 'CG' },
  { label: 'Costa Rica', value: 'CR' },
  { label: 'Côte d’Ivoire', value: 'CI' },
  { label: 'Croatia', value: 'HR' },
  { label: 'Cuba', value: 'CU' },
  { label: 'Cyprus', value: 'CY' },
  { label: 'Czechia', value: 'CZ' },
  { label: 'Denmark', value: 'DK' },
  { label: 'Djibouti', value: 'DJ' },
  { label: 'Dominican Republic', value: 'DO' },
  { label: 'Ecuador', value: 'EC' },
  { label: 'Egypt', value: 'EG' },
  { label: 'El Salvador', value: 'SV' },
  { label: 'Equatorial Guinea', value: 'GQ' },
  { label: 'Eritrea', value: 'ER' },
  { label: 'Estonia', value: 'EE' },
  { label: 'Eswatini', value: 'SZ' },
  { label: 'Ethiopia', value: 'ET' },
  { label: 'Fiji', value: 'FJ' },
  { label: 'Finland', value: 'FI' },
  { label: 'France', value: 'FR' },
  { label: 'Gabon', value: 'GA' },
  { label: 'Gambia', value: 'GM' },
  { label: 'Georgia', value: 'GE' },
  { label: 'Germany', value: 'DE' },
  { label: 'Ghana', value: 'GH' },
  { label: 'Greece', value: 'GR' },
  { label: 'Grenada', value: 'GD' },
  { label: 'Guatemala', value: 'GT' },
  { label: 'Guinea', value: 'GN' },
  { label: 'Guinea-Bissau', value: 'GW' },
  { label: 'Guyana', value: 'GY' },
  { label: 'Haiti', value: 'HT' },
  { label: 'Honduras', value: 'HN' },
  { label: 'Hungary', value: 'HU' },
  { label: 'Iceland', value: 'IS' },
  { label: 'India', value: 'IN' },
  { label: 'Indonesia', value: 'ID' },
  { label: 'Iran', value: 'IR' },
  { label: 'Iraq', value: 'IQ' },
  { label: 'Ireland', value: 'IE' },
  { label: 'Israel', value: 'IL' },
  { label: 'Italy', value: 'IT' },
  { label: 'Jamaica', value: 'JM' },
  { label: 'Japan', value: 'JP' },
  { label: 'Jordan', value: 'JO' },
  { label: 'Kazakhstan', value: 'KZ' },
  { label: 'Kenya', value: 'KE' },
  { label: 'Kiribati', value: 'KI' },
  { label: 'North Korea', value: 'KP' },
  { label: 'South Korea', value: 'KR' },
  { label: 'Kuwait', value: 'KW' },
  { label: 'Kyrgyzstan', value: 'KG' },
  { label: 'Laos', value: 'LA' },
  { label: 'Latvia', value: 'LV' },
  { label: 'Lebanon', value: 'LB' },
  { label: 'Lesotho', value: 'LS' },
  { label: 'Liberia', value: 'LR' },
  { label: 'Libya', value: 'LY' },
  { label: 'Liechtenstein', value: 'LI' },
  { label: 'Lithuania', value: 'LT' },
  { label: 'Luxembourg', value: 'LU' },
  { label: 'Madagascar', value: 'MG' },
  { label: 'Malawi', value: 'MW' },
  { label: 'Malaysia', value: 'MY' },
  { label: 'Maldives', value: 'MV' },
  { label: 'Mali', value: 'ML' },
  { label: 'Malta', value: 'MT' },
  { label: 'Marshall Islands', value: 'MH' },
  { label: 'Mauritania', value: 'MR' },
  { label: 'Mauritius', value: 'MU' },
  { label: 'Mexico', value: 'MX' },
  { label: 'Micronesia', value: 'FM' },
  { label: 'Moldova', value: 'MD' },
  { label: 'Monaco', value: 'MC' },
  { label: 'Mongolia', value: 'MN' },
  { label: 'Montenegro', value: 'ME' },
  { label: 'Morocco', value: 'MA' },
  { label: 'Mozambique', value: 'MZ' },
  { label: 'Myanmar', value: 'MM' },
  { label: 'Namibia', value: 'NA' },
  { label: 'Nauru', value: 'NR' },
  { label: 'Nepal', value: 'NP' },
  { label: 'Netherlands', value: 'NL' },
  { label: 'New Zealand', value: 'NZ' },
  { label: 'Nicaragua', value: 'NI' },
  { label: 'Niger', value: 'NE' },
  { label: 'Nigeria', value: 'NG' },
  { label: 'North Macedonia', value: 'MK' },
  { label: 'Norway', value: 'NO' },
  { label: 'Oman', value: 'OM' },
  { label: 'Pakistan', value: 'PK' },
  { label: 'Palau', value: 'PW' },
  { label: 'Palestine', value: 'PS' },
  { label: 'Panama', value: 'PA' },
  { label: 'Papua New Guinea', value: 'PG' },
  { label: 'Paraguay', value: 'PY' },
  { label: 'Peru', value: 'PE' },
  { label: 'Philippines', value: 'PH' },
  { label: 'Poland', value: 'PL' },
  { label: 'Portugal', value: 'PT' },
  { label: 'Qatar', value: 'QA' },
  { label: 'Romania', value: 'RO' },
  { label: 'Russia', value: 'RU' },
  { label: 'Rwanda', value: 'RW' },
  { label: 'Saint Kitts and Nevis', value: 'KN' },
  { label: 'Saint Lucia', value: 'LC' },
  { label: 'Saint Vincent and the Grenadines', value: 'VC' },
  { label: 'Samoa', value: 'WS' },
  { label: 'San Marino', value: 'SM' },
  { label: 'Sao Tome and Principe', value: 'ST' },
  { label: 'Saudi Arabia', value: 'SA' },
  { label: 'Senegal', value: 'SN' },
  { label: 'Serbia', value: 'RS' },
  { label: 'Seychelles', value: 'SC' },
  { label: 'Sierra Leone', value: 'SL' },
  { label: 'Singapore', value: 'SG' },
  { label: 'Slovakia', value: 'SK' },
  { label: 'Slovenia', value: 'SI' },
  { label: 'Solomon Islands', value: 'SB' },
  { label: 'Somalia', value: 'SO' },
  { label: 'South Africa', value: 'ZA' },
  { label: 'South Sudan', value: 'SS' },
  { label: 'Spain', value: 'ES' },
  { label: 'Sri Lanka', value: 'LK' },
  { label: 'Sudan', value: 'SD' },
  { label: 'Suriname', value: 'SR' },
  { label: 'Sweden', value: 'SE' },
  { label: 'Switzerland', value: 'CH' },
  { label: 'Syria', value: 'SY' },
  { label: 'Tajikistan', value: 'TJ' },
  { label: 'Tanzania', value: 'TZ' },
  { label: 'Thailand', value: 'TH' },
  { label: 'Timor-Leste', value: 'TL' },
  { label: 'Togo', value: 'TG' },
  { label: 'Tonga', value: 'TO' },
  { label: 'Trinidad and Tobago', value: 'TT' },
  { label: 'Tunisia', value: 'TN' },
  { label: 'Turkey', value: 'TR' },
  { label: 'Turkmenistan', value: 'TM' },
  { label: 'Tuvalu', value: 'TV' },
  { label: 'Uganda', value: 'UG' },
  { label: 'Ukraine', value: 'UA' },
  { label: 'United Arab Emirates', value: 'AE' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Uruguay', value: 'UY' },
  { label: 'Uzbekistan', value: 'UZ' },
  { label: 'Vanuatu', value: 'VU' },
  { label: 'Venezuela', value: 'VE' },
  { label: 'Vietnam', value: 'VN' },
  { label: 'Yemen', value: 'YE' },
  { label: 'Zambia', value: 'ZM' },
  { label: 'Zimbabwe', value: 'ZW' }
];

export const QUANTITY_OPTIONS: Option[] = [
    {
        value: 'microliters',
        label: 'μL',
    },
    {
        value: 'ml',
        label: 'ml'
    },
    {
        value: 'units',
        label: 'units',
    },
    {
        value: 'mg',
        label: 'mg'
    },
    {
        value: 'sqmm',
        label: 'mm'
    }
]

export const DONOR_SEX_OPTIONS: Option[] = [
    {
        label: 'Male',
        value: 'M'
    },
    {
        label: 'Female',
        value: 'F'
    },
    {
        label: 'Intersex',
        value: 'I'
    },
    {
        label: 'Other',
        value: 'O'
    },
    {
        label: 'Unknown',
        value: 'U'
    },
    {
        label: 'Prefer not to say',
        value: 'PNTS'
    }
];

export const DONOR_GENDER_OPTIONS: Option[] = [
    {
        label: 'Man',
        value: 'M'
    },
    {
        label: 'Woman',
        value: 'F'
    },
    {
        label: 'Non-Binary',
        value: 'NB'
    },
    {
        label: 'Other',
        value: 'O'
    },
    {
        label: 'Unknown',
        value: 'U'
    },
    {
        label: 'Prefer not to say',
        value: 'PNTS'
    }
];

export const DONOR_RACE_OPTIONS: Option[] = [
    {
        label: 'American Indian or Alaska Native',
        value: 'AIAN'
    },
    {
        label: 'Asian',
        value: 'A'
    },
    {
        label: 'Black or African American',
        value: 'BAA'
    },
    {
        label: 'Native Hawaiian or Other Pacific Islander',
        value: 'NHPI'
    },
    {
        label: 'White',
        value: 'W'
    },
    {
        label: 'Other',
        value: 'O'
    },
    {
        label: 'Unknown',
        value: 'U'
    },
    {
        label: 'Prefer not to say',
        value: 'PNTS'
    }
];

export const DONOR_ETHNICITY_OPTIONS: Option[] = [
    {
        label: 'Hispanic or Latino',
        value: 'HL'
    },
    {
        label: 'Not Hispanic or Latino',
        value: 'NHL'
    },
    {
        label: 'Other',
        value: 'O'
    },
    {
        label: 'Unknown',
        value: 'U'
    },
    {
        label: 'Prefer not to say',
        value: 'PNTS'
    }
];

export const RFP_OPEN_TO_TYPE_OPTIONS: Option[] = [
    // {
    //     label: 'All',
    //     value: 'ALL',
    // },
    {
        label: 'Service providers',
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

export const DISEASE_MODEL_TYPE_OPTIONS: Option[] = [
  { value: 'MOUSE', label: 'Mouse', group: 'Mammalian' },
  { value: 'RAT', label: 'Rat', group: 'Mammalian' },
  { value: 'NON_HUMAN_PRIMATES', label: 'Non-human primates', group: 'Mammalian' },

  { value: 'ZEBRAFISH', label: 'Zebrafish', group: 'Non-mammalian' },
  { value: 'FRUIT_FLY', label: 'Fruit fly', group: 'Non-mammalian' },
  { value: 'ROUNDWORM', label: 'Roundworm', group: 'Non-mammalian' },
  { value: 'YEAST', label: 'Yeast', group: 'Non-mammalian' },

  { value: 'IPSCS', label: 'iPSCs', group: 'Cell-based' },
  { value: 'STEM_CELLS', label: 'Stem cells', group: 'Cell-based' },
  { value: 'ORGANOIDS', label: 'Organoids', group: 'Cell-based' },
  { value: 'OTHER_CELL', label: 'Other cell lines', group: 'Cell-based' },

  { value: 'OTHER', label: 'Other', group: 'Other' },
]

export const RFP_STATUS_TYPE_OPTIONS: Option[] = [
    {value: 'OPEN', label: 'Open'},
    {value: 'ROLLING', label: 'Rolling'},
    {value: 'COMINGSOON', label: 'Coming soon'},
    {value: 'CLOSED', label: 'Closed'}
]

export const BIOSAMPLE_TYPE_OPTIONS: Option[] = [
    { value: 'IPSCS', label: 'Induced pluripotent stem cells (iPSCs)' },
    { value: 'FIBROBLAST', label: 'Fibroblast' },
    { value: 'PBMC', label: 'PBMC' },
    { value: 'PLASMA', label: 'Plasma' },
    { value: 'SERUM', label: 'Serum' },
    { value: 'WBC', label: 'WBC — buffy coat' },
    { value: 'URINE', label: 'Urine' },
    { value: 'BLOODSPOT', label: 'Blood spot' },
    { value: 'WHOLEBLOOD', label: 'Whole blood' },
    { value: 'TISSUE', label: 'Tissue' },
    { value: 'AQUEOUSHUMOR', label: 'Aqueous humor' },
    { value: 'CSF', label: 'Cerebrospinal fluid (CSF)' },
    { value: 'DNA', label: 'DNA' },
    { value: 'RNA', label: 'RNA' },
    { value: 'SALIVA', label: 'Saliva' },
    { value: 'STOOL', label: 'Stool' },
    { value: 'OTHER', label: 'Other' }
]

export const TOOL_TYPE_OPTIONS: Option[] = [
    { value: 'FUNCTIONALSTUDY', label: 'Functional study' },
    { value: 'NATURALHISTORYSTUDY', label: 'Natural history study' },
    { value: 'PATIENTREGISTRY', label: 'Patient registry' },
    { value: 'BIOMARKER', label: 'Biomarker' },
    { value: 'DRUGSCREEN', label: 'Drug screen' }, 
    { value: 'EFFICASYSTUDY', label: 'Efficacy study' }, 
    { value: 'DOSEFINDINGSTUDY', label: 'Dose finding study' }, 
    { value: 'TOXICOLOGYSTUDY', label: 'Toxicology study' },
    { value: 'EEG', label: 'EEG' },
    { value: 'STRUCTURALMRI', label: 'Structural MRI' },
    { value: 'OTHER', label: 'Other' }
]

export const REQUEST_STATUS_OPTIONS: any[] = [
    {
        id: 'REQUESTED',
        label: 'Requested',
    },
    {
        id: 'ADDITIONAL_INFORMATION',
        label: 'Additional Information Required',
    },
    {
        id: 'ACCEPTED',
        label: 'Accepted',
    },
    {
        id: 'SHIPPED',
        label: 'Shipped',
    },
    {
        id: 'DENIED',
        label: 'Denied',
    },
]

export const MILESTONE_TYPE_OPTIONS: any[] = [
    // Molecular disease characterization
    {
        id: 'BASICSCIENCE',
        value: 'BASICSCIENCE',
        label: 'Basic science',
        services: ['Literature Searches/Reviews', 'Pathway Mapping'],
        categories: ['molecular disease characterization'],
        description: 'Foundational research aimed at understanding the fundamental biological mechanisms and pathways underlying a specific disease.'
    },
    {
        id: 'FUNCTIONALSTUDY',
        value: 'FUNCTIONALSTUDY',
        label: 'Functional study',
        services: ['DNA Mutagenesis', 'Mutation Data Profiling', 'SNP Characterization'],
        categories: ['molecular disease characterization'],
        description: "Experiments designed to determine the specific biological role of a gene or protein and how its dysfunction leads to disease."
    }, 
    {
        id: 'BIOMARKER',
        value: 'BIOMARKER',
        label: 'Biomarker discovery',
        services: ['Biomarker Analytical Validation', 'Biomarker Clinical Utility', 'Biomarker Clinical Validation', 'Biomarker Discovery', 'Biomarker Services', 'Biomarker Services Consulting', 'Clinical Biomarker Analysis', 'Diagnostic Biomarkers Discovery', 'Digital Biomarkers', 'Discovery Biomarker Analytics', 'Metabolomics Biomarker Discovery', 'Pharmacodynamic Biomarkers Discovery', 'Predictive Biomarkers Discovery', 'Prognostic Biomarkers Discovery', 'Translational Biomarker Discovery'],
        categories: ['molecular disease characterization'],
        description: 'The identification of measurable biological indicators, such as proteins or tissue morphology that can objectively evaluate disease presence or progression.'
    }, 
    {
        id: 'GENOMICS',
        value: 'GENOMICS',
        label: 'Genomics',
        services: [],
        categories: ['molecular disease characterization'],
        description: '',
    }, 
    {
        id: 'TRANSCRIPTOMICS',
        value: 'TRANSCRIPTOMICS',
        label: 'Transcriptomics',
        services: [],
        categories: ['molecular disease characterization'],
        description: '',
    }, 
    {
        id: 'PROTEOMICS',
        value: 'PROTEOMICS',
        label: 'Proteomics',
        services: [],
        categories: ['molecular disease characterization'],
        description: '',
    }, 
    {
        id: 'METABOLOMICS',
        value: 'METABOLOMICS',
        label: 'Metabolomics',
        services: [],
        categories: ['molecular disease characterization'],
        description: '',
    }, 
    {
        id: 'EPIGENOMICS',
        value: 'EPIGENOMICS',
        label: 'Epigenomics',
        services: [],
        categories: ['molecular disease characterization'],
        description: '',
    }, 


    // Clinical studies
    {
        id: 'NATURALHISTORYSTUDY',
        value: 'NATURALHISTORYSTUDY',
        label: 'Natural history study',
        services: ['Health Economics and Outcomes Research (HEOR)', 'Non-Interventional Studies', 'Observational Research', 'Patient-Reported Outcome Studies', 'RWE/HEOR Data Analysis', 'RWE/HEOR/Market Access Data Analytics', 'Real World Evidence (RWE) Studies', 'Real-World Data', 'Real-World Evidence', 'eCOA - Electronic Clinical Outcomes Assessments', 'ePRO - Electronic Patient-reported Outcome'],
        categories: ['clinical studies'],
        description: 'An observational study that tracks the course of a disease over time in the absence of a specific experimental treatment.'
    }, 
    {
        id: 'PATIENTREGISTRY',
        value: 'PATIENTREGISTRY',
        label: 'Patient registry',
        services: ['Clinical Data Registry', 'Patient Recruitment', 'Patient-Reported Outcome Studies', 'Registries - Disease', 'Registries - Patient', 'Registries - Product'],
        categories: ['clinical studies'],
        description: 'A centralized database that collects uniform information about individuals diagnosed with a specific disease to support research and clinical care.'
    }, 
    {
        id: 'DISEASECONCEPTMODEL',
        value: 'DISEASECONCEPTMODEL',
        label: 'Disease concept model',
        services: [],
        categories: ['clinical studies'],
        description: 'A structured framework that defines the symptoms and impacts of a disease that are most meaningful to patients, used to guide drug development.'
    }, 
    {
        id: 'GENOTYPEPHENOTYPEANALYSIS',
        value: 'GENOTYPEPHENOTYPEANALYSIS',
        label: 'Genotype-phenotype analysis',
        services: [],
        categories: ['clinical studies'],
        description: 'Correlating specific genetic mutations (genotype) with the observable physical traits and symptoms (phenotype) of patients.'
    }, 
    {
        id: 'OUTCOMEMEASURE',
        value: 'OUTCOMEMEASURE',
        label: 'Endpoint selection',
        services: ['Biomarker Analytical Validation', 'Biomarker Clinical Validation', 'Biomarker Discovery', 'Biomarker Services', 'Biomarker Services Consulting', 'Clinical Biomarker Analysis', 'Predictive Biomarkers Discovery', 'Prognostic Biomarkers Discovery', 'Translational Biomarker Discovery'],
        categories: ['clinical studies'],
        description: 'The process of choosing specific, measurable outcomes that will determine if a treatment is effective in a clinical trial.'
    }, 
    {
        id: 'OTHERCLINICALSTUDY',
        value: 'OTHERCLINICALSTUDY',
        label: 'Other clinical study',
        services: [],
        categories: ['clinical studies'],
        description: 'Any other observational or non-interventional research involving human participants.'
    }, 



    // Disease models
    {
        id: 'BIOSAMPLECOLLECTION',
        value: 'BIOSAMPLECOLLECTION',
        label: 'Biosample collection',
        services: [],
        categories: ['disease models'],
        description: 'The systematic gathering of biological materials like blood, tissue, or saliva from patients for research purposes.'
    }, 
    // {
    //     id: 'BIOBANK',
    //     value: 'BIOBANK',
    //     label: 'Biobank',
    //     services: ['Biobanking'],
    //     categories: ['disease models'],
    //     description: 'Collect and store patient biological samples with associated clinical data securely.'
    // }, 
    {
        id: 'PATIENTDERIVEDCELLLINE',
        value: 'PATIENTDERIVEDCELLLINE',
        label: 'Patient-derived cell line',
        services: ['Cell Culture', 'Cell Line Authentication', 'Cell Line Characterization', 'Cell Line Construction', 'Human Immortalized Cell Culture', 'Human Primary Cells'],
        categories: ['disease models'],
        description: 'Cells taken from a patient and immortalized in the lab to create an infinite supply of disease-specific biological material.'
    }, 
    {
        id: 'ENGINEEREDCELLLINE',
        value: 'ENGINEEREDCELLLINE',
        label: 'Engineered cell line',
        services: ['Cell Culture', 'Cell Line Authentication', 'Cell Line Characterization', 'Cell Line Construction', 'Gene-Edited iPSCs Disease Models', 'Human Immortalized Cell Culture', "Human iPSC's", 'Isogenic Knockout iPSC Lines'],
        categories: ['disease models'],
        description: 'Healthy cells that have been genetically modified in a laboratory to mimic specific disease mutations or behaviours, e.g. induced pluripotent stem cells (iPSCs).'
    }, 
    {
        id: 'MOUSEMODEL',
        value: 'MOUSEMODEL',
        label: 'Mouse model',
        services: ['Knockin Mice', 'Knockout Mice', 'Sprague Dawley Rat'],
        categories: ['disease models'],
        description: 'A strain of mice genetically modified or treated to exhibit symptoms similar to the human disease, used for testing potential therapies.'
    }, 
    {
        id: 'OTHERDISEASEMODEL',
        value: 'OTHERDISEASEMODEL',
        label: 'Other disease model',
        services: ['3D Cell Culture', 'Animal Model Development', 'Human 3D cultures', 'Human Organoids', 'In Vitro Disease Models', 'Model Development', 'Non-Human Primate Models', 'Zebrafish Animal Model'],
        categories: ['disease models'],
        description: 'Alternative biological systems, such as organoids, fruit flies, or large animals, used to study disease pathology and test treatments.'
    }, 



    // Discovery
    {
        id: 'ASSAYDEVELOPMENT',
        value: 'ASSAYDEVELOPMENT',
        label: 'Assay development',
        services: ['Assay Development', 'Assay Development Consulting', 'ELISA', 'In Vitro Assay Development', 'Metabolomics Biomarker Discovery'],
        categories: ['discovery'],
        description: 'The creation and optimization of experimental tests used to measure biological activity or the effect of a drug on a target.'
    }, 
    {
        id: 'DRUGSCREEN',
        value: 'DRUGSCREEN',
        label: 'Drug screen',
        services: ['Discovery Compound Screening Analytics', 'High Throughput Screening', 'Natural Product Libraries', 'Natural Product Screening'],
        categories: ['discovery'],
        description: 'The high-throughput testing of large libraries of chemical compounds to identify those that have a desired effect on the disease target.'
    }, 
    {
        id: 'DRUGREPURPOSING',
        value: 'DRUGREPURPOSING',
        label: 'Drug repurposing',
        services: [],
        categories: ['discovery'],
        description: 'Investigating whether existing drugs already approved for other conditions can be effective in treating a different disease.'
    }, 
    // {
    //     id: 'TARGETVALIDATION',
    //     value: 'TARGETVALIDATION',
    //     label: 'Target validation',
    //     services: ['Target Validation', 'Target Validation Consulting'],
    //     categories: ['molecular disease characterization'],
    //     description: ''
    // }, 


    // Design and manufacturing
    {
        id: 'GENETHERAPYPRODUCTION',
        value: 'GENETHERAPYPRODUCTION',
        label: 'Construct design',
        services: ['Adeno Associated Virus (AAV) Production', 'GLP Large Molecule Bioanalysis', 'Gene Synthesis', 'Gene/Oligo Synthesis', 'Oligo Synthesis', 'Plasmid DNA Preparation and Extraction', 'RNA oligo synthesis'],
        categories: ['design and manufacturing'],
        description: 'The genetic engineering process of designing the specific DNA sequence (transgene and promoter) that will be delivered to treat the disease.'
    }, 
    {
        id: 'PLASMIDPRODUCTION',
        value: 'PLASMIDPRODUCTION',
        label: 'Plasmid production',
        services: [],
        categories: ['design and manufacturing'],
        description: 'The manufacturing of circular DNA molecules used as the template to produce viral vectors for gene therapy.'
    }, 
    {
        id: 'VECTORPRODUCTION',
        value: 'VECTORPRODUCTION',
        label: 'Vector production',
        services: [],
        categories: ['design and manufacturing'],
        description: 'The process of manufacturing the viral delivery vehicles (such as AAV or lentivirus) that carry a therapeutic gene into cells.'
    }, 
    {
        id: 'OLIGONUCELOTIDESYNTHESIS',
        value: 'OLIGONUCELOTIDESYNTHESIS',
        label: 'Oligonucelotide synthesis',
        services: [],
        categories: ['design and manufacturing'],
        description: 'The chemical synthesis of short strands of nucleic acids (DNA or RNA) designed to modulate gene expression.'
    }, 
    {
        id: 'GPMANUFACTURING',
        value: 'GPMANUFACTURING',
        label: 'GMP manufacturing',
        services: ['Chemistry Manufacturing and Controls (CMC)', 'Chemistry Manufacturing and Controls (CMC) Consulting', 'GMP Synthesis', 'Large Scale Purification'],
        categories: ['design and manufacturing'],
        description: 'Production of the therapy under "Good Manufacturing Practice" regulations to ensure it is safe, pure, and consistent for human use.'
    }, 


    // Pre-clinical
    {
        id: 'EFFICASYSTUDY',
        value: 'EFFICASYSTUDY',
        label: 'Proof of concept (efficacy)',
        services: ['In Vitro Efficacy Test', 'Mouse Efficacy Monotherapy', 'Rat Efficacy Monotherapy'],
        categories: ['pre-clinical'],
        description: ''
    }, 
    {
        id: 'TOXICOLOGYSTUDY',
        value: 'TOXICOLOGYSTUDY',
        label: 'Toxicology',
        services: ['General Toxicology', 'In Vitro Toxicology Testing', 'Mammalian Toxicology', 'Toxicology Consulting'],
        categories: ['pre-clinical'],
        description: ''
    },
    {
        id: 'DOSEFINDINGSTUDY',
        value: 'DOSEFINDINGSTUDY',
        label: 'Dose finding',
        services: ['Dose Range Finding Study - Dog /Canine', 'Dose Range Finding Study - Mouse', 'Dose Range Finding Study - Other Species', 'Dose Range Finding Study - Rat', 'In Vitro Dose Determination Tests', 'In Vitro Toxicology Testing'],
        categories: ['pre-clinical'],
        description: ''
    },  
    {
        id: 'BIODISTRIBUTIONSTUDY',
        value: 'BIODISTRIBUTIONSTUDY',
        label: 'Biodistribution',
        services: ['Drug Distribution Studies'],
        categories: ['pre-clinical'],
        description: ''
    }, 



    // Regulatory
    {
        id: 'ICD-10 CODE',
        value: 'ICD-10 CODE',
        label: 'ICD-10 code',
        services: [],
        categories: ['regulatory'],
        description: ''
    }, 
    {
        id: 'INTERACTMEETING',
        value: 'INTERACTMEETING',
        label: 'INTERACT meeting',
        services: [],
        categories: ['regulatory'],
        description: ''
    }, 
    {
        id: 'PREINDMEETING',
        value: 'PREINDMEETING',
        label: 'Pre-IND meeting',
        services: ['IND Enabling Package', 'IND Writing', 'IND Writing Consulting', 'Investigational Medicinal Product Dossier (IMPD) and Investigational New Drug (IND) Dossier', 'Regulatory Starting Materials'],
        categories: ['regulatory'],
        description: ''
    }, 
    {
        id: 'INDSUBMISSION',
        value: 'INDSUBMISSION',
        label: 'IND submission',
        services: ['IND Enabling Package', 'IND Writing', 'IND Writing Consulting', 'Investigational Medicinal Product Dossier (IMPD) and Investigational New Drug (IND) Dossier', 'Regulatory Starting Materials'],
        categories: ['regulatory'],
        description: ''
    }, 
    {
        id: 'ORPHANDRUGDESIGNATION',
        value: 'ORPHANDRUGDESIGNATION',
        label: 'Orphan drug designation',
        services: [],
        categories: ['regulatory'],
        description: ''
    }, 
    {
        id: 'FDAAPPROVAL',
        value: 'FDAAPPROVAL',
        label: 'FDA approval',
        services: ['Regulatory Starting Materials'],
        categories: ['regulatory'],
        description: ''
    }, 


    // Clincal trials
    {
        id: 'TRIALDESIGN',
        value: 'TRIALDESIGN',
        label: 'Trial design',
        services: ['Clinical Trial Consulting', 'Clinical Trial Design', 'Clinical Trial Feasibility'],
        categories: ['clinical trials'],
        description: ''
    }, 
    {
        id: 'SITESELECTION',
        value: 'SITESELECTION',
        label: 'Site selection',
        services: ['Site Selection', 'Study/Site Feasibility Study'],
        categories: ['clinical trials'],
        description: ''
    }, 
    {
        id: 'PATIENTRECRUITMENT',
        value: 'PATIENTRECRUITMENT',
        label: 'Patient recruitment',
        services: ['Clinical Trial Recruitment', 'Patient Recruitment'],
        categories: ['clinical trials'],
        description: ''
    }, 
    {
        id: 'PHASE1',
        value: 'PHASE1',
        label: 'Phase I',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical trials'],
        description: ''
    }, 
    {
        id: 'PHASE1/2',
        value: 'PHASE1/2',
        label: 'Phase I/II',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical trials'],
        description: ''
    }, 
    {
        id: 'PHASE2',
        value: 'PHASE2',
        label: 'Phase II',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical trials'],
        description: ''
    }, 
    {
        id: 'PHASE3',
        value: 'PHASE3',
        label: 'Phase III',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical trials'],
        description: ""
    }, 
    {
        id: 'PHASE4',
        value: 'PHASE4',
        label: 'Phase IV',
        services: ['Biomarker Services', 'Clinical Data Registry', 'Patient-Reported Outcome Studies', 'Post-Marketing (Phase 4) Studies', 'RWE/HEOR Data Analysis', 'RWE/HEOR/Market Access Data Analytics', 'Real World Evidence (RWE) Studies', 'Real-World Evidence'],
        categories: ['clinical trials'],
        description: ""
    }, 
    {
        id: 'OTHER',
        value: 'OTHER',
        label: 'Other',
        services: [],
        categories: [],
        description: ''
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

// export const ADDITIONAL_RESEARCH_PLAN_TYPES: Option[] = [
//     {
//         id: '1',
//         label: 'Drug Repurposing or Drug Screening',
//         value: 'DRUG_REPURPOSING_SCREENING',
//         description: 'Strategies to identify new therapeutic uses for existing drugs or discover novel compounds for specific diseases through systematic screening.',
//         strengths: 'Reduces development timelines, leverages existing safety profiles, and cost-effective compared to de novo drug development.',
//     },
//     // {
//     //     id: '2',
//     //     label: 'Pathway Modulators',
//     //     value: 'PATHWAY_MODULATORS',
//     //     description: 'Therapies designed to target and modulate biological pathways involved in disease processes, such as signaling cascades and metabolic pathways.',
//     //     strengths: 'Addresses disease mechanisms at a systemic level, potential for broad applications, and integrates well with other therapeutic modalities.',
//     // },
//     {
//         id: '3',
//         label: 'Basic science',
//         value: 'EXPLORATORY_RESEARCH',
//     },
//     {
//         id: '4',
//         label: 'Tool development',
//         value: 'TOOL_DEVELOPMENT',
//     },
//     // {
//     //     id: '5',
//     //     label: 'Therapeutic-agnostic',
//     //     value: 'THERAPEUTIC_AGNOSTIC',
//     // },
//     {
//         id: '6',
//         label: 'Other',
//         value: 'OTHER_NON_MODALITY',
//     },
// ]

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
        option: {value: 'PRECLINICAL', label: 'Preclinical', variant: 'indigo'},
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

export const RESEARCH_STAGE: Option[] = [
    {
        id: 'DISCOVERY',
        label: 'Discovery',
        value: 'DISCOVERY',
        variant: 'orange'
    },
    {
        id: 'PRECLINICAL',
        label: 'Pre-clinical',
        value: 'PRECLINICAL',
        variant: 'yellow'
    },
    {
        id: 'INDAPPROVED',
        label: 'IND-approved',
        value: 'INDAPPROVED',
        variant: 'lime'
    },
    {
        id: 'EXPANDEDACCESS',
        label: 'Expanded access',
        value: 'EXPANDEDACCESS',
        variant: 'green'
    },
    {
        id: 'PHASE1/2',
        label: 'Phase I/II',
        value: 'PHASE1/2',
        variant: 'emerald'
    },
    {
        id: 'PHASE1',
        label: 'Phase I',
        value: 'PHASE1',
        variant: 'emerald'
    },
    {
        id: 'PHASE2',
        label: 'Phase II',
        value: 'PHASE2',
        variant: 'emerald'
    },
    {
        id: 'PHASE3',
        label: 'Phase III',
        value: 'PHASE3',
        variant: 'emerald'
    },
    {
        id: 'FDAAPPROVED',
        label: 'FDA approved',
        value: 'FDAAPPROVED',
        variant: 'blue'
    },
]

export const RESEARCH_PLAN_STATUS: Option[] = [
    {
        id: 'PLANNING',
        label: 'Planning',
        value: 'PLANNING',
    },
    {
        id: 'ONGOING',
        label: 'Ongoing',
        value: 'ONGOING',
    },
    {
        id: 'PAUSED',
        label: 'Paused or shelved',
        value: 'PAUSED',
    },
    {
        id: 'FAILED',
        label: 'Failed',
        value: 'FAILED',
    },
    {
        id: 'SEEKINGPARTNERS',
        label: 'Seeking partners (sponsors, fundraising, licensing, etc.)',
        value: 'SEEKINGPARTNERS',
    },
    {
        id: 'COMPLETED',
        label: 'Completed',
        value: 'COMPLETED',
    },
]

export const MODALITIES: Option[] = [
    {
        id: '1',
        label: 'Gene replacement therapy',
        value: 'GENE_THERAPY_AAV',
        description: 'A therapeutic approach using adeno-associated viruses (AAV) to deliver genetic material into cells, often to correct or replace defective genes.',
        strengths: 'High precision in targeting specific cells, long-term expression of therapeutic genes, and growing clinical success in various diseases.',
    },
    {
        id: '2',
        label: 'Drug screening or repurposing',
        value: 'DRUG_REPURPOSING_SCREENING',
        description: 'Strategies to identify new therapeutic uses for existing drugs or discover novel compounds for specific diseases through systematic screening.',
        strengths: 'Reduces development timelines, leverages existing safety profiles, and cost-effective compared to de novo drug development.',
    },
    {
        id: '3',
        label: 'Antisense oligonucleotide (ASO)',
        value: 'ANTISENSE_OLIGONUCLEOTIDE',
        description: 'Short, synthetic strands of DNA or RNA designed to bind to specific mRNA sequences, modifying gene expression or protein production.',
        strengths: 'Targets specific genes, reversible effects, and customizable for various genetic disorders.',
    },
    {
        id: '4',
        label: 'Therapeutic-agnostic tool development',
        value: 'TOOL_DEVELOPMENT',
    },
    {
        id: '5',
        label: 'Enzyme or protein replacement',
        value: 'ENZYME_REPLACEMENT',
        description: 'A treatment approach involving the administration of exogenous enzymes to replace deficient or malfunctioning enzymes in patients.',
        strengths: 'Addresses underlying enzyme deficiencies, well-established for several metabolic disorders, and provides symptomatic relief.',
    },
    {
        id: '6',
        label: 'Small molecule',
        value: 'NOVEL_CHEMISTRY',
        description: 'Innovative small molecule drugs designed using advanced chemical techniques to target unique mechanisms of action.',
        strengths: 'Highly customizable for specific targets, scalable production, and potential for oral administration.',
    },
    {
        id: '7',
        label: 'Gene editing',
        value: 'GENE_EDITING',
        description: 'A technology for directly altering the DNA of an organism, including techniques like CRISPR/Cas9 to modify genes for therapeutic purposes.',
        strengths: 'Highly versatile, precise gene modifications, and potential for permanent therapeutic outcomes.',
    },
    {
        id: '8',
        label: 'Other RNA therapy',
        value: 'OTHER_RNA_THERAPY',
        description: 'A broad category of therapies leveraging RNA molecules, such as RNA interference (RNAi) and mRNA vaccines, to modulate gene expression or induce immune responses.',
        strengths: 'Rapid development timelines, adaptable to different diseases, and avoids permanent DNA alterations.',
    },
    {
        id: '9',
        label: 'Cell therapies',
        value: 'STEM_CELL_TRANSPLANT',
        description: 'The use of stem cells to regenerate or repair damaged tissues and treat conditions like hematological diseases and genetic disorders.',
        strengths: 'Potential for long-term regeneration, versatile applications, and addresses root causes of diseases.',
    },
    {
        id: '10',
        label: 'Disease characterization',
        value: 'DISEASE_CHARACTERIZATION',
    },
    {
        id: '11',
        label: 'Basic science',
        value: 'EXPLORATORY_RESEARCH',
    },
    {
        id: '12',
        label: 'Supplements',
        value: 'SUPPLEMENTS',
    },
    {
        id: '13',
        label: 'Antibody therapy',
        value: 'ANTIBODIES',
        description: 'Biologics that use engineered or natural antibodies to target specific proteins or antigens for therapeutic purposes.',
        strengths: 'Highly specific targeting, strong efficacy in immune-related diseases, and a proven track record in therapy.',
    },
    {
        id: '14',
        label: 'Vaccine',
        value: 'VACCINE',
        description: 'Biological preparations that provide immunity to specific diseases, often by stimulating the immune system to recognize and combat pathogens.',
        strengths: 'Prevents disease proactively, adaptable to various pathogens, and scalable for public health impact.',
    },
    {
        id: '15',
        label: 'Medical device',
        value: 'MEDICAL_DEVICE',
    },
    {
        id: '16',
        label: 'Other',
        value: 'OTHER',
    },
]

export const RESEARCH_PLAN_TYPES: Option[] = MODALITIES

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
        label: 'Molecular disease characterization',
        value: 'molecular disease characterization',
        description: 'Focuses on early-stage research, hypothesis generation, and initial identification of potential treatments.',
    },
    {
        id: '2',
        label: 'Clinical studies',
        value: 'clinical studies',
        description: 'Involves human trials to evaluate the safety, efficacy, and outcomes of new medical interventions.',
    },
    {
        id: '3',
        label: 'Disease models',
        value: 'disease models',
        description: 'Utilizes experimental models to study disease mechanisms and test potential treatments.',
    },
    {
        id: '4',
        label: 'Discovery',
        value: 'discovery',
        description: 'Covers laboratory and animal studies to assess the safety and efficacy of new treatments before clinical trials.',
    },
    {
        id: '5',
        label: 'Design and manufacturing',
        value: 'design and manufacturing',
        description: 'Focuses on the engineering, production, and optimization of medical products and therapeutics.',
    },
    {
        id: '6',
        label: 'Pre-clinical',
        value: 'pre-clinical',
        description: '',
    },
    {
        id: '7',
        label: 'Regulatory',
        value: 'regulatory',
        description: 'Covers compliance, approval processes, and regulatory frameworks governing medical treatments and interventions.',
    },
    {
        id: '8',
        label: 'Clinical trials',
        value: 'clinical trials',
        description: '',
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
        label: 'Chromosomal Rearrangement',
        value: 'CHROMOSOMAL_ABERRATION',
        description: 'A mechanism involving structural or numerical changes in chromosomes that can disrupt normal gene function or regulation.',
    },
    {
        id: '5',
        label: 'Unknown',
        value: 'UNKNOWN',
        description: 'A molecular mechanism where the specific effect of the mutation on the protein\'s function is not yet determined.',
    },
    {
        id: '6',
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
    'Literature Searches/Reviews': 'molecular disease characterization',
    'Pathway Mapping': 'molecular disease characterization',
    'DNA Mutagenesis': 'molecular disease characterization',
    'Mutation Data Profiling': 'molecular disease characterization',
    'SNP Characterization': 'molecular disease characterization',
    'Health Economics and Outcomes Research (HEOR)': 'clinical studies',
    'Non-Interventional Studies': 'clinical studies',
    'Observational Research': 'clinical studies',
    'Patient-Reported Outcome Studies': 'clinical studies',
    'RWE/HEOR Data Analysis': 'clinical studies',
    'RWE/HEOR/Market Access Data Analytics': 'clinical studies',
    'Real World Evidence (RWE) Studies': 'clinical studies',
    'Real-World Data': 'clinical studies',
    'Real-World Evidence': 'clinical studies',
    'eCOA - Electronic Clinical Outcomes Assessments': 'clinical studies',
    'ePRO - Electronic Patient-reported Outcome': 'clinical studies',
    'Clinical Data Registry': 'clinical studies',
    'Patient Recruitment': 'clinical studies',
    'Registries - Disease': 'clinical studies',
    'Registries - Patient': 'clinical studies',
    'Registries - Product': 'clinical studies',
    'Biomarker Analytical Validation': [ 'molecular disease characterization', 'clinical studies' ],
    'Biomarker Clinical Utility': 'molecular disease characterization',
    'Biomarker Clinical Validation': [ 'molecular disease characterization', 'clinical studies' ],
    'Biomarker Discovery': [ 'molecular disease characterization', 'clinical studies' ],
    'Biomarker Services': [ 'molecular disease characterization', 'clinical studies' ],
    'Biomarker Services Consulting': [ 'molecular disease characterization', 'clinical studies' ],
    'Clinical Biomarker Analysis': [ 'molecular disease characterization', 'clinical studies' ],
    'Diagnostic Biomarkers Discovery': 'molecular disease characterization',
    'Digital Biomarkers': 'molecular disease characterization',
    'Discovery Biomarker Analytics': 'molecular disease characterization',
    'Metabolomics Biomarker Discovery': [ 'molecular disease characterization', 'discovery' ],
    'Pharmacodynamic Biomarkers Discovery': 'molecular disease characterization',
    'Predictive Biomarkers Discovery': [ 'molecular disease characterization', 'clinical studies' ],
    'Prognostic Biomarkers Discovery': [ 'molecular disease characterization', 'clinical studies' ],
    'Translational Biomarker Discovery': [ 'molecular disease characterization', 'clinical studies' ],
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
    'Target Validation': 'molecular disease characterization',
    'Target Validation Consulting': 'molecular disease characterization',
    'Assay Development': 'discovery',
    'Assay Development Consulting': 'discovery',
    'ELISA': 'discovery',
    'In Vitro Assay Development': 'discovery',
    'Discovery Compound Screening Analytics': 'molecular disease characterization',
    'High Throughput Screening': 'molecular disease characterization',
    'Natural Product Libraries': 'molecular disease characterization',
    'Natural Product Screening': 'molecular disease characterization',
    'In Vitro Efficacy Test': 'discovery',
    'Mouse Efficacy Monotherapy': 'discovery',
    'Rat Efficacy Monotherapy': 'discovery',
    'Dose Range Finding Study - Dog /Canine': 'discovery',
    'Dose Range Finding Study - Mouse': 'discovery',
    'Dose Range Finding Study - Other Species': 'discovery',
    'Dose Range Finding Study - Rat': 'discovery',
    'In Vitro Dose Determination Tests': 'discovery',
    'In Vitro Toxicology Testing': 'discovery',
    'General Toxicology': 'discovery',
    'Mammalian Toxicology': 'discovery',
    'Toxicology Consulting': 'discovery',
    'Drug Distribution Studies': 'discovery',
    'Adeno Associated Virus (AAV) Production': 'design and manufacturing',
    'GLP Large Molecule Bioanalysis': 'design and manufacturing',
    'Gene Synthesis': 'design and manufacturing',
    'Gene/Oligo Synthesis': 'design and manufacturing',
    'Oligo Synthesis': 'design and manufacturing',
    'Plasmid DNA Preparation and Extraction': 'design and manufacturing',
    'RNA oligo synthesis': 'design and manufacturing',
    'Chemistry Manufacturing and Controls (CMC)': 'design and manufacturing',
    'Chemistry Manufacturing and Controls (CMC) Consulting': 'design and manufacturing',
    'GMP Synthesis': 'design and manufacturing',
    'Large Scale Purification': 'design and manufacturing',
    'IND Enabling Package': 'regulatory',
    'IND Writing': 'regulatory',
    'IND Writing Consulting': 'regulatory',
    'Investigational Medicinal Product Dossier (IMPD) and Investigational New Drug (IND) Dossier': 'regulatory',
    'Regulatory Starting Materials': 'regulatory',
    'Site Selection': 'clinical studies',
    'Study/Site Feasibility Study': 'clinical studies',
    'Clinical Trial Recruitment': 'clinical studies',
    'Clinical Trial Consulting': 'clinical studies',
    'Clinical Trial Design': 'clinical studies',
    'Clinical Trial Feasibility': 'clinical studies',
    'Phase 1-3 Studies': 'clinical studies',
    'Post-Marketing (Phase 4) Studies': 'clinical studies'
}

export interface Task {
    columnId: string;
    id: string
    status: StatusType
    name: string
    description?: string
    checklist?: any[],
    orderPosition: number,
    kanbanPosition: number,
    stakeholders?: any[],
    endDate: Date,
    priority: PriorityType
    milestone: DBMilestone
}

export type ColumnType = "Column"

export interface ColumnDragData {
    type: ColumnType
    column: Column
}

export type TaskType = "Task"

export interface TaskDragData {
    type: TaskType
    task: Task
}

export const companyTypeMap: Record<string, string> = {
    "Mid-Sized Business (10-100M TTM Revenue)": "Mid-Sized Business",
    "Small Business (1-10M TTM Revenue)": "Small Business",
    "Academic Core Facility": "Academic Core Facility",
    "New Startup (0-1M TTM Revenue)": "New Startup",
    "Consultant (5 or more employees)": "Consultant",
    "Large Business (>100M TTM Revenue)": "Large Business",
    "Consultant (<5 employees)": "Consultant",
};

export interface MaterialAndDataAccessRequestWithResearcherAndComments extends MaterialAndDataAccessRequest {
    researcher: Researcher & { user: User | null };
    institutions: Institution[]
    comments: RequestComment[];
}

export const REQUEST_TYPE_OPTIONS: any[] = [
    {
        id: 'BIOSAMPLE',
        label: 'Biosample',
        value: 'BIOSAMPLE'
    },
    {
        id: 'DATA',
        label: 'Data',
        value: 'DATA'
    },
];

export const REQUEST_STATUS_TYPE_OPTIONS: any[] = [
    {
        id: 'APPROVED',
        label: 'Approved',
        value: 'APPROVED'
    },
    {
        id: 'PENDING',
        label: 'Pending',
        value: 'PENDING'
    },
    {
        id: 'IN-PROGRESS',
        label: 'In Progress',
        value: 'IN-PROGRESS'
    },
    {
        id: 'REJECTED',
        label: 'Rejected',
        value: 'REJECTED'
    },
    {
        id: 'COMPLETED',
        label: 'Completed',
        value: 'COMPLETED'
    },
];

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

const moneyField = z.preprocess(
    (v) => (v === "" || v === null || typeof v === "undefined" ? undefined : Number(v)),
    z.number().min(0).optional()
);

export const editOrgFormSchema = z.object({
    name: z.string().min(2).max(60),
    subdomain: z.string().min(2, {
        message: "Your organization's nickname must be at least 2 characters."
    }).max(60, {
        message: "Your organization's nickname must be a maximum of 50 characters."
    }),
    contactEmail: z.preprocess(
        (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
        z.string().email({ message: "Please enter a valid email address." }).optional()
    ),
    yearFounded: z.string().optional(),
    incorporationStatus: z.enum(["YES", "NO", "INPROGRESS"]).optional(),
    raised: moneyField,
    deployed: moneyField,
    budget: moneyField,

    description: z.string().max(500, {
        message: "Your organization's description must be less than 500 characters long."
    }).optional(),
    website: z.preprocess(
        (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
        z.string().url({
            message: "Enter a valid URL for your organization's website."
        }).optional()
    ),
    therapeuticsInDevelopment: z.array(optionSchema).min(0).optional(),
    otherTherapeuticsInDevelopment: z.string().optional(),
    therapeuticsOfInterest: z.array(optionSchema).min(0).optional(),
    otherTherapeuticsOfInterest: z.string().optional(),

    image: z.string().nullable().optional(),
    headerImage: z.string().nullable().optional(),
})

export const diagnosisSchema = z.object({
    diagnosis: z.array(optionSchema)
        .min(1, "A diagnosis type is required")
        .max(1, "Only one diagnosis type is allowed"),
    severity: z.string().optional(),
})

export const editResearchPlanForm = z.object({
    title: z
        .string({ required_error: "Please provide a title" })
        .min(1, "Title is required")
        .max(60, "Title must be less than 60 characters"),
    modalities: z.array(optionSchema)
        .min(1, "Please select a research strategy")    
        .max(1, "You can only select one type"),
    partners: z.array(z.custom<any>()).optional(),
    description: z
        .string()
        .max(1500, "Description must be less than 1500 characters")
        .optional(),
    stages: z.array(optionSchema)
        .min(1, "Please select a stage")
        .max(1, "You can only select one stage"),
    statuses: z.array(optionSchema)
        .min(1, "Please select a status")  
        .max(1, "You can only select one status"),
    links: z.array(z.custom<any>()).optional(),
    otherModalities: z.string().optional(),
    metadata: z.string().optional()
})

export const editBiosampleForm = z.object({
    id: z.string().optional(),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    types: z.array(optionSchema)
        .min(1, "Type is required")
        .max(1, "Max one type"),
    otherTypeDetails: z.string().optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    milestones: z.array(z.custom<Milestone>()).optional(),

    // biosmaple properties
    genes: z.array(optionSchema).optional(),
    variant: z.string().optional(),
    // institutions: z.array(optionSchema).optional(),
    storageFacility: z.array(optionSchema).optional(),
    createRequests: z.array(z.custom<any>()).optional(),
    anatomicalSite: z.string().optional(),
    preservationMethod: z.string().optional(),
    preservation: z.string().optional(),
    methodOfTransport: z.string().optional(),
    currentCountry: z.string().optional(),
    countryOfCollection: z.string().optional(),
    collectionDate: z.date().optional(),
    genotype: z.string().optional(),
    // volume: z.string().optional(),
    // mass: z.string().optional(),
    // area: z.string().optional(),
    availability: z.string().optional(),
    quantity: z.string().optional(),
    quantityUnit: z.string(),
    productCode: z.string().optional(),
    bsiId: z.string().optional(),
    // priceUSD: z.string().optional(),
    // priceGBP: z.string().optional(),
    // priceEUR: z.string().optional(),
    price: z.string().optional(),
    priceUnit: z.string(),
    premiumGroup: z.string().optional(),
    caseId: z.string().optional(),
    specimenId: z.string().optional(),
    format: z.string().optional(),
    subFormat: z.string().optional(),
    biosampleDiagnosis: z.string().optional(),
    measurement: z.number().optional(),
    significantVariantPositive: z.string().optional(),
    significantVariantWildtype: z.string().optional(),
    fusionPositive: z.string().optional(),
    fusionWildtype: z.string().optional(),
    cnvAbnormal: z.boolean().optional(),
    cnvNormal: z.boolean().optional(),
    hlaType: z.string().optional(),
    icf: z.string().optional(),
    irbLetter: z.string().optional(),
    yearOfExcision: z.string().optional(),
    classifier: z.string().optional(),
    primaryTumorOrgan: z.string().optional(),
    stage: z.string().optional(),
    stageGroup: z.string().optional(),
    serology: z.string().optional(),
    clinicalTestResults: z.string().optional(),
    serumAvailable: z.boolean().optional(),
    plasmaAvailable: z.boolean().optional(),
    wholeBloodAvailable: z.boolean().optional(),
    ffpeTumorAvailable: z.boolean().optional(),
    frozenTumorAvailable: z.boolean().optional(),
    er: z.string().optional(),
    pr: z.string().optional(),
    hercepTest: z.string().optional(),
    matchedPairId: z.string().optional(),
    mirroredPairId: z.string().optional(),
    ageAtExcision: z.string().optional(),
    notes: z.string().optional(),

    // donor properties
    donorId: z.string().optional(),
    internalDonorId: z.string().optional(),
    donor: z.array(optionSchema).optional(),
    donorInternalId: z.string().optional(),
    age: z.string().optional(),
    sex: z.string().optional(),
    gender: z.string().optional(),
    race: z.string().optional(),
    ethnicity: z.string().optional(),
    treatments: z.array(z.string()).optional(),
    diagnoses: z.array(diagnosisSchema).optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    bmi: z.string().optional(),
    menopausalStatus: z.boolean().optional(),
    ageAtLastMenstualPeriod: z.string().optional(),
    numberOfPregnancies: z.string().optional(),
    numberOfLiveBirths: z.string().optional(),
    smokingStatus: z.boolean().optional(),
    cigarettesPerDay: z.string().optional(),
    alcoholStatus: z.boolean().optional(),
    drinksPerDay: z.string().optional(),
    alcoholDuration: z.string().optional(),
    medications: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
    if (data.contacts?.length && data.contacts.some(c => !c.email)) {
        ctx.addIssue({
            path: ["contacts"],
            message: "All contacts require an email address.",
            code: z.ZodIssueCode.custom,
        });
    }
})

export const editDiseaseModelForm = z.object({
    id: z.string().optional(),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    types: z.array(optionSchema)
        .min(1, "Type is required")
        .max(1, "Max one type"),
    otherTypeDetails: z.string().optional(),
    attachments: z.array(z.custom<any>()).optional(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    milestones: z.array(z.custom<Milestone>()).optional(),
    genotype: z.string().optional(),
    strain: z.string().optional(),
    notes: z.string().optional(),

    // disease model properties
    genes: z.array(optionSchema).optional(),
    // institutions: z.array(optionSchema).optional(),
    storageFacility: z.array(optionSchema).optional(),
    createRequests: z.array(z.custom<any>()).optional(),
}).superRefine((data, ctx) => {
    if (data.contacts?.length && data.contacts.some(c => !c.email)) {
        ctx.addIssue({
            path: ["contacts"],
            message: "All contacts require an email address.",
            code: z.ZodIssueCode.custom,
        });
    }
})

export const editDataToolForm = z.object({
    id: z.string().optional(),
    title: z
        .string({
            required_error: "Please provide a title"
        })
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    types: z.array(optionSchema)
        .min(1, "Type is required")
        .max(1, "Max one type"),
    otherTypeDetails: z.string().optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    milestones: z.array(z.custom<Milestone>()).optional(),
    notes: z.string().optional(),

    genes: z.array(optionSchema).optional(),
    cohortSize: z.string().optional(),
    // institutions: z.array(optionSchema).optional(),
    storageFacility: z.array(optionSchema).optional(),
    createRequests: z.array(z.custom<any>()).optional(),
}).superRefine((data, ctx) => {
    if (data.contacts?.length && data.contacts.some(c => !c.email)) {
        ctx.addIssue({
            path: ["contacts"],
            message: "All contacts require an email address.",
            code: z.ZodIssueCode.custom,
        });
    }
})

const nilOrEmptyToUndef = <T extends z.ZodTypeAny>(inner: T) =>
    z.preprocess(v => (v === "" || v === null ? undefined : v), inner.optional());

export const editMilestoneForm = z.object({
    nodeType: z.string(),
    title: z
        .string({
            required_error: "Please provide a title"
        })
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    types: z.array(z.custom<MilestoneType>()).optional(),
    otherTypeDetails: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    budget: nilOrEmptyToUndef(z.number().max(2147483647).min(0)),
    attachments: z.array(z.custom<any>()).optional(),
    status: z.string(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    openTo: z.array(z.string()).optional(),
    tools: z.array(z.custom<Option>()).optional(),
    rfps: z.array(z.custom<RFP>()).optional(),
    notes: z.array(z.record(z.any()))
}).refine(
    (m) => m.startDate && m.endDate ? m.startDate?.getTime() <= m.endDate?.getTime() : true,
    {
        message: "Error: Please adjust the dates so the start date comes before the end date.",
        path: ["endDate"]
    }
)

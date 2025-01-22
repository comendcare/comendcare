import type { Option } from "@/components/ui/multiple-selector"
import {User, Post, Comment, Prisma} from "@prisma/client";

export type CommentWithUser = Prisma.CommentGetPayload<{
    include: { author: true };
}>;

export type PostWithAuthorAndComments = Post & {
    author: User
    comments: Comment[]
}

export const RFP_OPEN_TO_TYPE_OPTIONS: Option[] = [
    {
        label: 'All',
        value: 'ALL',
    },
    {
        label: 'CROs',
        value: 'CRO',
    },
    {
        label: 'Academics',
        value: 'ACADEMIC',
    },
    {
        label: 'None',
        value: 'NONE',
    },
]

export const MILESTONE_TYPE_OPTIONS: Option[] = [
    { label: 'Basic science', value: 'BASICSCIENCE' },
    { label: 'Functional study', value: 'FUNCTIONALSTUDY' },
    { label: 'Patient-derived cell line', value: 'PATIENTDERIVEDCELLLINE' },
    { label: 'Engineered cell line', value: 'ENGINEEREDCELLLINE' },
    { label: 'Other cell line', value: 'OTHERCELLLINE' },
    { label: 'Zebrafish model', value: 'ZEBRAFISHMODEL' },
    { label: 'Yeast model', value: 'YEASTMODEL' },
    { label: 'Mouse model', value: 'MOUSEMODEL' },
    { label: 'Other animal model', value: 'OTHERANIMALMODEL' },
    { label: 'Organoid', value: 'ORGANOID' },
    { label: 'Patient registry', value: 'PATIENTREGISTRY' },
    { label: 'Natural history study', value: 'NATURALHISTORYSTUDY' },
    { label: 'Biobank', value: 'BIOBANK' },
    { label: 'Natural history', value: 'NATURALHISTORY' },
    { label: 'Literature review', value: 'LITERATUREREVIEW' },
    { label: 'Assay', value: 'ASSAY' },
    { label: 'Construct design', value: 'CONSTRUCTDESIGN' },
    { label: 'Plasmid production', value: 'PLASMIDPRODUCTION' },
    { label: 'AAV production', value: 'AAVPRODUCTION' },
    { label: 'Target identification', value: 'TARGETIDENTIFICATION' },
    { label: 'Drug screen', value: 'DRUGSCREEN' },
    { label: 'In-vitro verification', value: 'INVITROVERIFICATION' },
    { label: 'In-vivo verification', value: 'INVIVOVERIFICATION' },
    { label: 'Proof-of-concept', value: 'PROOFOFCONCEPT' },
    { label: 'GMP manufacturing', value: 'GMPMANUFACTURING' },
    { label: 'Dosing', value: 'DOSING' },
    { label: 'Efficacy', value: 'EFFICACY' },
    { label: 'Pharmacology', value: 'PHARMACOLOGY' },
    { label: 'Toxicology', value: 'TOXICOLOGY' },
    { label: 'Biomarker', value: 'BIOMARKER' },
    { label: 'Outcome measure', value: 'OUTCOMEMEASURE' },
    { label: 'Orphan drug designation', value: 'ORPHANDRUGDESIGNATION' },
    { label: 'INTERACT meeting', value: 'INTERACTMEETING' },
    { label: 'FDA listening session', value: 'FDALISTENINGSESSION' },
    { label: 'IND submission', value: 'INDSUBMISSION' },
    { label: 'IND approval', value: 'INDAPPROVAL' },
    { label: 'No type', value: 'NOTYPE'}
]

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


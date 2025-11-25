import type {User} from "@prisma/client"

export interface EnrichedResearcher {
    user: {
        name?: string | null;
        email?: string | null;
    };

    researcher: {
        id: string;
        userId?: string;
        user: User,
        image?: string | null;
        title?: "researcher" | "pm" | "pi" | "student" | "other" | null;
        orcid?: string | null;
        description?: string | null;
        website?: string | null;
        country?: string | null;
        researchInterests?: string[];
        therapeuticsOfInterest: string[];
        conditionsOfInterest?: string[];
        genesOfInterest?: string[];
        affiliations?: {
            institution: {
                id: string;
                name: string;
                type?: string | null;
                country?: string | null;
            };
        }[];
        notificationSettings?: boolean;
        consentSettings?: boolean;
    };

    openAlex: {
        id?: string;
        display_name?: string;
        display_name_alternatives?: string[];
        works_count?: number;
        cited_by_count?: number;
        summary_stats?: {
            h_index?: number;
        };
        counts_by_year?: { year: number; works_count: number; cited_by_count: number }[];
        last_known_institutions?: { display_name: string; country_code?: string }[];
        affiliations?: {
            institution?: {
                display_name: string;
                type?: string;
            };
            years?: (number | string)[];
        }[];
        topics?: { display_name: string }[];
        works_api_url?: string;
    };

    mergedFields: {
        name: string;
        title?: string | null;
        email?: string | null;
        researchInterests?: string[];
    };

    crossref?: any[];
    europePmc?: any[];
    datacite?: any[];
}

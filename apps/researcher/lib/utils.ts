import {ACADEMIC_ROLES} from "@/packages/lib/types";
import z from "zod";

// enum values aligned with ACADEMIC_ROLES.value in types.ts
export const TitleEnum = z.enum(["pi", "postdoc", "phd_student", "other"]);

export const mapTitleToValue = (
    title?: string | null
): z.infer<typeof TitleEnum> | undefined => {
    if (!title) return undefined;

    const normalized = title.toLowerCase();

    // 2) Match against current ACADEMIC_ROLES by value / label / id
    const match = ACADEMIC_ROLES.find(
        (role) =>
            role.value === normalized ||
            role.label.toLowerCase() === normalized ||
            role.id.toLowerCase() === normalized
    );

    return match?.value as z.infer<typeof TitleEnum> | undefined;
};

// (optional but handy)
export const mapTitleValueToLabel = (value?: string | null): string | undefined => {
    if (!value) return undefined;
    const normalized = value.toLowerCase();

    const match = ACADEMIC_ROLES.find(
        (role) =>
            role.value === normalized ||
            role.id.toLowerCase() === normalized ||
            role.label.toLowerCase() === normalized
    );

    return match?.label;
};

export function mergeResearcherDataAdvanced(
    dbResearcher: any,
    openAlex: any,
    publications: any[] = [],
    opts?: {
        crossref?: any[];
        europePmc?: any[];
        datacite?: any[];
    }
) {
    const crossref = opts?.crossref ?? [];
    const europePmc = opts?.europePmc ?? [];
    const datacite = opts?.datacite ?? [];

    /** ===== Helpers ===== */
    const norm = (s?: string | null) =>
        (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");

    const cleanDoi = (v?: string | null) =>
        v ? norm(v).replace(/^doi:/, "").replace(/^https?:\/\/(dx\.)?doi\.org\//, "") : "";

    const pickFirst = <T>(...vals: (T | undefined | null)[]) =>
        vals.find((v) => v !== undefined && v !== null);

    const toOA = (o?: any) => (o ? !!o : false);

    /** Standardized pub shape for UI */
    type UnifiedPub = {
        id: string;                // stable key (doi|pmid|pmcid|fallback)
        source: string[];          // which sources informed this record
        title?: string;
        authors?: string[];        // plain author names
        year?: number;
        venue?: string;            // journal/venue/publisher
        type?: string;             // article | dataset | software | etc.
        doi?: string;
        pmid?: string;
        pmcid?: string;
        url?: string;              // best landing/fulltext
        oa?: boolean;              // open access?
        citations?: number;        // if available
        raw?: Record<string, unknown>; // original source snippets (for debugging)
    };

    /** ---- Source mappers ---- */

        // OpenAlex works
    const fromOpenAlex = (w: any): UnifiedPub => {
            const doi = cleanDoi(w?.doi);
            const title = w?.title ?? w?.display_name;
            const venue = w?.host_venue?.display_name ?? w?.primary_location?.source?.display_name;
            const url =
                w?.primary_location?.landing_page_url ??
                w?.primary_location?.pdf_url ??
                w?.host_venue?.url ??
                (doi ? `https://doi.org/${doi}` : undefined);

            return {
                id: doi || w?.id || norm(`${title}-${w?.publication_year || ""}`),
                source: ["openalex"],
                title,
                authors: (w?.authorships ?? []).map((a: any) => a?.author?.display_name).filter(Boolean),
                year: w?.publication_year,
                venue,
                type: w?.type,
                doi: doi || undefined,
                url,
                oa: toOA(w?.open_access?.is_oa),
                citations: w?.cited_by_count,
                raw: { openalex: w },
            };
        };

    // Crossref items
    const fromCrossref = (it: any): UnifiedPub => {
        const doi = cleanDoi(it?.DOI);
        const title = Array.isArray(it?.title) ? it.title[0] : it?.title;
        const year =
            it?.issued?.["date-parts"]?.[0]?.[0] ??
            it?.published?.["date-parts"]?.[0]?.[0];
        const authors =
            (it?.author ?? []).map((a: any) => [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean);
        const venue = it?.["container-title"]?.[0] || it?.publisher;
        const url = it?.URL || (doi ? `https://doi.org/${doi}` : undefined);

        return {
            id: doi || norm(`${title}-${year || ""}`),
            source: ["crossref"],
            title,
            authors,
            year,
            venue,
            type: it?.type,
            doi: doi || undefined,
            url,
            oa: false, // Crossref doesn't guarantee OA; enrich later if you add Unpaywall
            citations: undefined,
            raw: { crossref: it },
        };
    };

    // Europe PMC records
    const fromEuropePmc = (r: any): UnifiedPub => {
        const doi = cleanDoi(r?.doi);
        const pmid = r?.pmid ? String(r.pmid) : undefined;
        const pmcid = r?.pmcid ? String(r.pmcid) : undefined;
        const title = r?.title;
        const year = r?.pubYear ? Number(r.pubYear) : undefined;
        const authors = (r?.authorString ?? "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        const venue = r?.journalTitle;
        const url =
            r?.fullTextUrlList?.fullTextUrl?.[0]?.url ||
            (pmcid
                ? `https://europepmc.org/article/pmcid/${pmcid}`
                : pmid
                    ? `https://europepmc.org/abstract/MED/${pmid}`
                    : doi
                        ? `https://doi.org/${doi}`
                        : undefined);

        return {
            id: doi || pmcid || pmid || norm(`${title}-${year || ""}`),
            source: ["europe_pmc"],
            title,
            authors,
            year,
            venue,
            type: r?.pubType,
            doi: doi || undefined,
            pmid,
            pmcid,
            url,
            oa: toOA(r?.isOpenAccess),
            citations: r?.citedByCount ? Number(r.citedByCount) : undefined,
            raw: { europePmc: r },
        };
    };

    // DataCite DOIs (often datasets/software/preprints)
    const fromDataCite = (d: any): UnifiedPub => {
        const at = d?.attributes ?? {};
        const doi = cleanDoi(at?.doi);
        const title =
            Array.isArray(at?.titles) && at.titles.length ? at.titles[0]?.title : at?.title;
        const year = at?.publicationYear ? Number(at.publicationYear) : undefined;
        const venue = at?.publisher;
        const type = at?.types?.resourceTypeGeneral || at?.resourceTypeGeneral;
        const url =
            at?.url ||
            (Array.isArray(at?.identifiers)
                ? at.identifiers.find((i: any) => i.identifierType?.toLowerCase() === "url")?.identifier
                : undefined) ||
            (doi ? `https://doi.org/${doi}` : undefined);
        const authors =
            Array.isArray(at?.creators)
                ? at.creators
                    .map((c: any) =>
                        c?.name ||
                        [c?.givenName, c?.familyName].filter(Boolean).join(" ")
                    )
                    .filter(Boolean)
                : [];

        return {
            id: doi || norm(`${title}-${year || ""}`),
            source: ["datacite"],
            title,
            authors,
            year,
            venue,
            type,
            doi: doi || undefined,
            url,
            oa: false, // DataCite doesn't assert OA; enrich later if desired
            citations: undefined,
            raw: { datacite: d },
        };
    };

    /** ---- Build + dedupe unified publications ---- */

    const unified: UnifiedPub[] = [];

    // 1) OpenAlex works (if provided)
    for (const w of publications) unified.push(fromOpenAlex(w));

    // 2) Crossref
    for (const it of crossref) unified.push(fromCrossref(it));

    // 3) Europe PMC
    for (const r of europePmc) unified.push(fromEuropePmc(r));

    // 4) DataCite
    for (const d of datacite) unified.push(fromDataCite(d));

    // Dedupe preference: prefer OpenAlex version, then EuropePMC (OA-rich), then Crossref, then DataCite.
    const rank = (srcs: string[]) => {
        if (srcs.includes("openalex")) return 4;
        if (srcs.includes("europe_pmc")) return 3;
        if (srcs.includes("crossref")) return 2;
        if (srcs.includes("datacite")) return 1;
        return 0;
    };

    const byKey = new Map<string, UnifiedPub>();

    const makeKey = (p: UnifiedPub) =>
        (p.doi && `doi:${p.doi}`) ||
        (p.pmcid && `pmcid:${p.pmcid}`) ||
        (p.pmid && `pmid:${p.pmid}`) ||
        `t:${norm(p.title || "")}|y:${p.year || ""}`;

    for (const p of unified) {
        const key = makeKey(p);
        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, p);
            continue;
        }
        // Merge sources + choose better fields
        const better = rank(p.source) >= rank(existing.source) ? p : existing;
        const other = better === p ? existing : p;

        const merged: UnifiedPub = {
            id: better.id,
            source: Array.from(new Set([...(better.source || []), ...(other.source || [])])),
            title: pickFirst(better.title, other.title),
            authors: pickFirst(better.authors, other.authors),
            year: pickFirst(better.year, other.year),
            venue: pickFirst(better.venue, other.venue),
            type: pickFirst(better.type, other.type),
            doi: pickFirst(better.doi, other.doi),
            pmid: pickFirst(better.pmid, other.pmid),
            pmcid: pickFirst(better.pmcid, other.pmcid),
            url: pickFirst(
                // Prefer explicit landing/pdf/PMC links, then DOI
                better.url,
                other.url,
                better.doi ? `https://doi.org/${better.doi}` : undefined,
                other.doi ? `https://doi.org/${other.doi}` : undefined
            ),
            oa: better.oa || other.oa || false,
            citations: pickFirst(better.citations, other.citations),
            raw: { ...(better.raw || {}), ...(other.raw || {}) },
        };

        byKey.set(key, merged);
    }

    const mergedPublications = Array.from(byKey.values());

    /** ---- Merged fields (person-level) ---- */

    const email = dbResearcher.email ?? openAlex?.email ?? null;
    const display_name = dbResearcher.name ?? openAlex?.display_name ?? "Unknown Researcher";

    // Additional interests: combine OpenAlex topics + Crossref subjects + DataCite subjects
    const crossrefSubjects = crossref
        .flatMap((it: any) => it?.subject ?? [])
        .filter(Boolean);

    const dataciteSubjects = datacite
        .flatMap((d: any) => (d?.attributes?.subjects ?? []).map((s: any) => s?.subject))
        .filter(Boolean);

    const researchInterests =
        (dbResearcher.researchInterests?.length ? dbResearcher.researchInterests : null) ??
        [
            ...(openAlex?.topics?.map((t: any) => t?.display_name).filter(Boolean) ?? []),
            ...crossrefSubjects,
            ...dataciteSubjects,
        ].filter(Boolean);

    return {
        researcher: dbResearcher,
        openAlex: {
            ...openAlex,
            display_name,
            last_known_institutions: openAlex?.last_known_institutions ?? [],
            summary_stats: openAlex?.summary_stats ?? {},
            works_count: openAlex?.works_count ?? 0,
            cited_by_count: openAlex?.cited_by_count ?? 0,
            affiliations: openAlex?.affiliations ?? [],
            topics: openAlex?.topics ?? [],
        },
        publications: mergedPublications, // unified + deduped across sources
        mergedFields: {
            name: dbResearcher.name ?? openAlex?.display_name,
            title: dbResearcher.title ?? null,
            email,
            researchInterests,
        },
        // Optionally keep raw per-source arrays for debugging/analytics
        _sources: {
            openAlexWorksCount: publications.length,
            crossrefCount: crossref.length,
            europePmcCount: europePmc.length,
            dataciteCount: datacite.length,
        },
    };
}

export function mergeResearcherData(dbResearcher: any, openAlex: any, publications: any[] = []) {
    const email = dbResearcher.email ?? openAlex?.email ?? null;
    const display_name = dbResearcher.name ?? openAlex?.display_name ?? "Unknown Researcher";

    return {
        researcher: dbResearcher,
        openAlex: {
            ...openAlex,
            display_name,
            last_known_institutions: openAlex?.last_known_institutions ?? [],
            summary_stats: openAlex?.summary_stats ?? {},
            works_count: openAlex?.works_count ?? 0,
            cited_by_count: openAlex?.cited_by_count ?? 0,
            affiliations: openAlex?.affiliations ?? [],
            topics: openAlex?.topics ?? [],
        },
        publications,
        mergedFields: {
            name: dbResearcher.name ?? openAlex?.display_name,
            title: dbResearcher.title ?? null,
            email,
            researchInterests: dbResearcher.researchInterests?.length ? dbResearcher.researchInterests : (openAlex?.topics?.map((t: any) => t.display_name) ?? []),
        }
    };
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case "APPROVED":
            return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
        case "PENDING":
            return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
        case "IN-PROGRESS":
            return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"
        case "REJECTED":
            return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
        case "COMPLETED":
            return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
    }
}

export const getStatusText = (status: string) => {
    switch (status) {
        case "APPROVED":
            return "Approved"
        case "PENDING":
            return "Under Review"
        case "IN-PROGRESS":
            return "In Progress"
        case "REJECTED":
            return "Rejected"
        case "COMPLETED":
            return "Completed"
        default:
            return status
    }
}

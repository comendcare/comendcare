"use server"

type TypesenseSearchHit = {
    document?: any
    highlights?: Array<{ field: string; snippet?: string; snippets?: string[] }>
    text_match?: number
}

type TypesenseSearchResponse = {
    hits?: TypesenseSearchHit[]
}

export type AiSearchHit = {
    collection: CollectionName
    id: string
    score: number
    snippet?: string
    doc: any
}

export type CollectionName =
    | "organizations"
    | "milestones"
    | "companies"
    | "biosamples"
    | "disease-models"
    | "clinical-datasets"
    | "rfps"
    | "research-plans"
    | "researchers"

const TYPESENSE_URL =
    process.env.TYPESENSE_URL ?? `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE}`

const TYPESENSE_SEARCH_API_KEY = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY

function requireEnv(name: string, v?: string) {
    if (!v) throw new Error(`Missing env var: ${name}`)
    return v
}

async function tsSearch(
    collection: CollectionName,
    params: Record<string, string | number | boolean | undefined>
): Promise<TypesenseSearchResponse> {
    const apiKey = requireEnv("TYPESENSE_SEARCH_API_KEY", TYPESENSE_SEARCH_API_KEY)
    const base = requireEnv("TYPESENSE_URL", TYPESENSE_URL)

    const url = new URL(`${base.replace(/\/$/, "")}/collections/${collection}/documents/search`)
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined) return
        url.searchParams.set(k, String(v))
    })

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "X-TYPESENSE-API-KEY": apiKey },
        cache: "no-store",
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Typesense search failed (${collection}): ${res.status} ${text}`)
    }

    return res.json()
}

const TARGETS: Array<{
    collection: CollectionName
    query_by: string
    include_fields: string
}> = [
    { collection: "organizations", query_by: "name,description", include_fields: "id,name,description,updatedAt,createdAt" },
    { collection: "milestones", query_by: "title,description,type,status,nodeType", include_fields: "id,title,description,type,status,updatedAt,nodeType" },
    { collection: "companies", query_by: "title,description,tags,categories,milestoneTypes", include_fields: "id,title,description,website,companyType,tags,categories,milestoneTypes" },
    { collection: "biosamples", query_by: "id,description,type.label,condition.name,organization.name,institution.name,gene.symbol,genotype.genotype,donor.id", include_fields: "id,description,type,condition,organization,institution,gene,availability,quantity" },
    { collection: "disease-models", query_by: "id,description,type.label,condition.name,organization.name,institution.name,gene.symbol,genotype.genotype,strain.strain", include_fields: "id,description,type,condition,organization,institution,gene,genotype,strain" },
    { collection: "clinical-datasets", query_by: "id,title.title,description,type.label,condition.name,organization.name,institution.name,gene.symbol", include_fields: "id,title,description,type,condition,organization,institution,gene,cohortSize" },
    { collection: "rfps", query_by: "title,description,eligibility,evaluationProcess,condition.name,organization.name", include_fields: "id,title,description,condition,organization,startDate,endDate,sort_rank" },
    { collection: "research-plans", query_by: "title,description,organization.name,modalities,stages,statuses", include_fields: "id,title,description,organization,modalities,stages,statuses,milestones,updatedAt" },
    { collection: "researchers", query_by: "user.name,affiliations.institution.name,researchInterests,therapeuticsOfInterest", include_fields: "id,user,affiliations,researchInterests,therapeuticsOfInterest" },
]

function bestSnippet(hit: TypesenseSearchHit): string | undefined {
    const hs = hit.highlights ?? []
    // Prefer the first snippet, then any snippet array
    const first = hs.find((h) => h.snippet)?.snippet
    if (first) return first
    const firstFromSnippets = hs.find((h) => Array.isArray(h.snippets) && h.snippets.length)?.snippets?.[0]
    return firstFromSnippets
}

export async function aiSearchTypesense(opts: {
    q: string
    perCollection?: number
    totalLimit?: number
}): Promise<AiSearchHit[]> {
    const q = opts.q?.trim()
    if (!q) return []

    const perCollection = Math.min(Math.max(opts.perCollection ?? 5, 1), 20)
    const totalLimit = Math.min(Math.max(opts.totalLimit ?? 12, 1), 50)

    // Global-public now: no filter_by needed because your sync already only indexes public.
    // Future org-scoped: add filter_by here (see section below).

    const settled = await Promise.allSettled(
        TARGETS.map(async (t) => {
            const json = await tsSearch(t.collection, {
                q,
                query_by: t.query_by,
                per_page: perCollection,
                include_fields: t.include_fields,
                highlight_full_fields: t.query_by,
                // optional tuning
                typo_tokens_threshold: 1,
                num_typos: 2,
            })

            const hits = (json.hits ?? []) as TypesenseSearchHit[]
            return hits
                .map((h) => {
                    const doc = h.document ?? {}
                    const id = String(doc.id ?? "")
                    if (!id) return null

                    return {
                        collection: t.collection,
                        id,
                        score: Number(h.text_match ?? 0),
                        snippet: bestSnippet(h),
                        doc,
                    } satisfies AiSearchHit
                })
                .filter(Boolean) as AiSearchHit[]
        })
    )

    const merged: AiSearchHit[] = []
    for (const r of settled) if (r.status === "fulfilled") merged.push(...r.value)

    merged.sort((a, b) => b.score - a.score)
    return merged.slice(0, totalLimit)
}

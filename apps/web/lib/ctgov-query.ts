// app/(platform)/lib/ctgov-query.ts

export type CtgovOrgQueryConfig = {
    orgId: string;
    conditions?: string[];
    terms?: string[];
    locations?: string[];
    titles?: string[];
    interventions?: string[];
    outcomes?: string[];
    sponsors?: string[];
    lead?: string[];
    overallStatuses?: string[];

    // NEW knobs:
    dateField?: "StudyFirstPostDate" | "LastUpdatePostDate"; // default StudyFirstPostDate
    windowDays?: number; // default 1 (yesterday→today)
    loosen?: boolean; // ignored in "safe" mode, kept for compat
};

// Pick the FIRST available keyword and which field to place it in.
// Priority favors recall-friendly fields and your current usage.
function pickSingleFieldAndKeyword(cfg: CtgovOrgQueryConfig): { key?: string; field?: "query.cond" | "query.titles" | "query.term" } {
    const first = <T,>(xs?: T[]) => (xs && xs.length ? xs[0] : undefined);

    const cond = first(cfg.conditions);
    if (cond) return { key: cond, field: "query.cond" };

    const title = first(cfg.titles);
    if (title) return { key: title, field: "query.titles" };

    const term = first(cfg.terms);
    if (term) return { key: term, field: "query.term" };

    return {};
}

// DEAD‑SIMPLE params: a single field + single keyword; NO boolean glue in Other terms.
// Caller is responsible for adding date/status in postFilter.* as you already do.
export function buildCtgovParams(
    cfg: CtgovOrgQueryConfig,
    _fromISO: string,
    _toISO: string
) {
    const p = new URLSearchParams();
    p.set("format", "json");
    p.set("pageSize", "100");

    // choose ONE field and ONE keyword to avoid CT.gov "Too complicated query"
    const picked = pickSingleFieldAndKeyword(cfg);
    if (picked.key && picked.field) {
        // Quote the keyword to preserve exact phrase behavior, but keep it simple.
        p.set(picked.field, `"${picked.key}"`);
    }

    // Keep these simple, one-per area; avoid piling on more query.* knobs.
    if (cfg.locations?.length) p.set("query.locn", `"${cfg.locations[0]}"`);
    if (cfg.interventions?.length) p.set("query.intr", `"${cfg.interventions[0]}"`);
    if (cfg.outcomes?.length) p.set("query.outc", `"${cfg.outcomes[0]}"`);
    if (cfg.sponsors?.length) p.set("query.spons", `"${cfg.sponsors[0]}"`);
    if (cfg.lead?.length) p.set("query.lead", `"${cfg.lead[0]}"`);

    // Do NOT add date window here; you already add postFilter.advanced at call site.
    // Also skip filter.overallStatus here; your route sets postFilter.overallStatus.

    return p;
}

// Super‑simple per‑keyword runner: one request per keyword, one field at a time.
export async function runSimpleFallback(
    cfg: CtgovOrgQueryConfig,
    fromISO: string,
    toISO: string,
    enqueueStudies: (s: CtgovStudy[]) => Promise<void>
) {
    const fields: Array<{ list?: string[]; field: "query.cond" | "query.titles" | "query.term" }> = [
        { list: cfg.conditions, field: "query.cond" },
        { list: cfg.titles, field: "query.titles" },
        { list: cfg.terms, field: "query.term" },
    ];

    for (const { list, field } of fields) {
        if (!list?.length) continue;
        for (const kw of list) {
            const singleCfg: CtgovOrgQueryConfig = {
                ...cfg,
                // single keyword in the chosen bucket; do NOT mix
                conditions: field === "query.cond" ? [kw] : [],
                titles:     field === "query.titles" ? [kw] : [],
                terms:      field === "query.term" ? [kw] : [],
            };

            const p = buildCtgovParams(singleCfg, fromISO, toISO);

            // Only date + status in postFilter — keep it super simple.
            p.set(
                "postFilter.advanced",
                `AREA[${cfg.dateField ?? "StudyFirstPostDate"}]RANGE[${fromISO},${toISO}]`
            );
            if (cfg.overallStatuses?.length) {
                p.set("postFilter.overallStatus", cfg.overallStatuses.join(","));
            }

            try {
                await fetchAllPages(p, enqueueStudies);
            } catch (e) {
                console.warn("ctgov simple query failed", { field, kw, orgId: cfg.orgId, e });
            }
        }
    }
}

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
    loosen?: boolean; // if true, we won’t require titles AND terms simultaneously
};

const orGroup = (xs?: string[]) =>
    xs?.length ? `(${xs.map(x => `"${x}"`).join(" OR ")})` : undefined;

export function buildCtgovParams(
    cfg: CtgovOrgQueryConfig,
    fromISO: string,
    toISO: string
) {
    const p = new URLSearchParams();
    p.set("format", "json");
    p.set("pageSize", "100");

    const field = cfg.dateField ?? "StudyFirstPostDate";

    // Keep MAX at the upper bound to avoid parser quirks, clamp with postFilter if needed
    const dateEssie = `AREA[${field}]RANGE[${fromISO},MAX]`;

    // If "loosen", don’t force both title & term groups to exist at once
    const pieces = [dateEssie];

    // Prefer conditions over titles/terms for recall
    const cond = orGroup(cfg.conditions);
    if (cond) pieces.push(cond);

    const maybeTitle = orGroup(cfg.titles);
    const maybeTerm = orGroup(cfg.terms);

    if (cfg.loosen) {
        // If either title or term exists, add it — but not both as a hard AND unless both provided.
        const titleOrTerm = [maybeTitle, maybeTerm].filter(Boolean).join(" OR ");
        if (titleOrTerm) pieces.push(`(${titleOrTerm})`);
    } else {
        if (maybeTitle) pieces.push(maybeTitle);
        if (maybeTerm) pieces.push(maybeTerm);
    }

    const termGroup = pieces.filter(Boolean).join(" AND ");
    p.set("query.term", termGroup);

    if (cfg.locations?.length) p.set("query.locn", orGroup(cfg.locations)!);
    if (cfg.interventions?.length) p.set("query.intr", orGroup(cfg.interventions)!);
    if (cfg.outcomes?.length) p.set("query.outc", orGroup(cfg.outcomes)!);
    if (cfg.sponsors?.length) p.set("query.spons", orGroup(cfg.sponsors)!);
    if (cfg.lead?.length) p.set("query.lead", orGroup(cfg.lead)!);

    if (cfg.overallStatuses?.length) {
        p.set("filter.overallStatus", cfg.overallStatuses.join(","));
    }

    return p;
}

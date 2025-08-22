export type OrgQueryConfig = {
    orgId: string;
    keywords: string[];     // diseases/genes/synonyms
    mustInTitle?: string[]; // optional
    not?: string[];         // optional
};

export function buildPubmedQuery(cfg: OrgQueryConfig): string {
    const parts: string[] = [];

    if (cfg.keywords?.length) {
        parts.push("(" + cfg.keywords.map(k => `"${k}"[TIAB]`).join(" OR ") + ")");
    }
    if (cfg.mustInTitle?.length) {
        parts.push("(" + cfg.mustInTitle.map(t => `"${t}"[Title]`).join(" OR ") + ")");
    }
    if (cfg.not?.length) {
        parts.push("NOT (" + cfg.not.map(n => `"${n}"`).join(" OR ") + ")");
    }

    // keep this broad; you can add english/pt filters later once you confirm flow
    return parts.join(" AND ");
}

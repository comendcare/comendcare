const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function withKey(params: URLSearchParams, apiKey?: string) {
    if (apiKey) params.set("api_key", apiKey);
    return params;
}

export async function esearchPubmed(
    term: string,
    opts?: { since?: Date; retmax?: number; apiKey?: string }
) {
    const params = new URLSearchParams();
    params.set("db", "pubmed");
    params.set("retmode", "json");
    params.set("retmax", String(opts?.retmax ?? 200));
    params.set("sort", "pub+date");
    params.set("term", term);
    if (opts?.apiKey) params.set("api_key", opts.apiKey);

    // ✅ Use datetype/mindate/maxdate instead of editing the term
    if (opts?.since) {
        const y = opts.since.getUTCFullYear();
        const m = String(opts.since.getUTCMonth() + 1).padStart(2, "0");
        const d = String(opts.since.getUTCDate()).padStart(2, "0");
        params.set("datetype", "pdat");               // or "edat"
        params.set("mindate", `${y}/${m}/${d}`);
        params.set("maxdate", "3000/12/31");
    }

    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params.toString()}`;
    const res = await fetch(url, { headers: { "User-Agent": "Comend/1.0" } });
    if (!res.ok) throw new Error(`esearch failed: ${res.status}`);
    const json = await res.json();
    return (json?.esearchresult?.idlist ?? []) as string[];
}

export type PubmedSummary = {
    pmid: string;
    title: string;
    journal?: string;
    pubDate?: string;
    doi?: string;
    pmcid?: string;
    authors?: { lastName?: string; foreName?: string; initials?: string }[];
    url?: string;
    meshTerms?: string[];
    abstract?: string;
};

export async function esummaryPubmed(pmids: string[], apiKey?: string): Promise<PubmedSummary[]> {
    if (pmids.length === 0) return [];
    const params = withKey(new URLSearchParams(), apiKey);
    params.set("db", "pubmed");
    params.set("retmode", "json");
    params.set("id", pmids.join(","));

    const res = await fetch(`${BASE}/esummary.fcgi?${params.toString()}`, { headers: { "User-Agent": "Comend/1.0" } });
    if (!res.ok) throw new Error(`esummary failed: ${res.status}`);
    const data = await res.json();

    const out: PubmedSummary[] = [];
    for (const uid of data?.result?.uids ?? []) {
        const r = data.result[uid];
        const ids = (r?.articleids ?? []) as { idtype: string; value: string }[];
        out.push({
            pmid: uid,
            title: r?.title ?? "",
            journal: r?.fulljournalname ?? r?.source ?? "",
            pubDate: r?.pubdate ?? r?.epubdate ?? r?.sortpubdate ?? "",
            doi: ids.find(i => i.idtype === "doi")?.value,
            pmcid: ids.find(i => i.idtype === "pmcid")?.value,
            authors: (r?.authors ?? []).map((a: any) => ({ lastName: a?.lastname, foreName: a?.foreName ?? a?.name, initials: a?.initials })),
            url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
            meshTerms: (r?.meshheadinglist ?? []) as string[],
        });
    }
    return out;
}

export async function efetchAbstract(pmids: string[], apiKey?: string): Promise<Record<string, string | undefined>> {
    if (pmids.length === 0) return {};
    const params = new URLSearchParams();
    params.set("db", "pubmed");
    params.set("retmode", "xml");
    params.set("rettype", "abstract");
    params.set("id", pmids.join(","));
    if (apiKey) params.set("api_key", apiKey);

    const res = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params.toString()}`, {
        headers: { "User-Agent": "Comend/1.0" },
    });
    if (!res.ok) throw new Error(`efetch failed: ${res.status}`);

    const xml = await res.text();
    const out: Record<string, string> = {};

    // Use exec loops instead of matchAll
    const articleRe = /<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g;
    let articleMatch: RegExpExecArray | null;

    while ((articleMatch = articleRe.exec(xml)) !== null) {
        const chunk = articleMatch[0];

        const pmidMatch = /<PMID[^>]*>(\d+)<\/PMID>/.exec(chunk);
        if (!pmidMatch) continue;
        const pmid = pmidMatch[1];

        const abstractRe = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g;
        let absMatch: RegExpExecArray | null;
        const parts: string[] = [];

        while ((absMatch = abstractRe.exec(chunk)) !== null) {
            const raw = absMatch[1] || "";
            const clean = raw.replace(/<[^>]+>/g, "").trim();
            if (clean) parts.push(clean);
        }

        if (parts.length) {
            out[pmid] = parts.join("\n\n");
        }
    }

    return out;
}

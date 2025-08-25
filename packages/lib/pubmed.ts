import {JSDOM} from "jsdom"


interface ArticleData {
    pmid: string
    title: string
    abstract: string
    keywords: string[]
    formattedPublishedDate: string
    publishedDate: string
    authors: any
}

function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// utils for date parsing
const MONTHS: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", sept: "09", oct: "10", nov: "11", dec: "12",
};

function normMonth(m?: string | null): string | null {
    if (!m) return null;
    const s = m.trim().toLowerCase();
    // handle ranges like "Nov-Dec" or "Aug-Sep" → pick first
    const first = s.split(/[\s\-]/)[0];
    if (/^\d+$/.test(first)) {
        const n = parseInt(first, 10);
        if (n >= 1 && n <= 12) return String(n).padStart(2, "0");
        return null;
    }
    return MONTHS[first] ?? null;
}

// Parse strings like "2025 Aug 14", "2025 Aug", "2025 Winter", "2025 Nov-Dec", "2025"
function parseMedlineDate(s: string): { iso?: string, pretty?: string } {
    const t = s.trim();
    const yearMatch = t.match(/^\s*(\d{4})/);
    if (!yearMatch) return {};
    const y = yearMatch[1];

    // try YYYY Mon DD
    const ymd = t.match(/^\s*(\d{4})\s+([A-Za-z]{3,})\s+(\d{1,2})/);
    if (ymd) {
        const mm = normMonth(ymd[2]);
        const dd = String(parseInt(ymd[3], 10)).padStart(2, "0");
        if (mm) return { iso: `${y}-${mm}-${dd}`, pretty: `${ymd[2]} ${parseInt(dd,10)}, ${y}` };
    }

    // try YYYY Mon or YYYY Mon-Mon or seasons
    const ym = t.match(/^\s*(\d{4})\s+([A-Za-z][A-Za-z\-]+)/);
    if (ym) {
        const mm = normMonth(ym[2]);
        if (mm) return { iso: `${y}-${mm}-01`, pretty: `${ym[2]} ${y}` };
        // season or unparseable month → fallback to Jan 1
        return { iso: `${y}-01-01`, pretty: y };
    }

    // bare year
    return { iso: `${y}-01-01`, pretty: y };
}

function fmtPretty(y?: string|null, m?: string|null, d?: string|null): string {
    const monthNames = [
        "January","February","March","April","May","June","July",
        "August","September","October","November","December"
    ];
    const mm = normMonth(m ?? undefined);
    if (!y) return "";
    if (!mm) return y;
    const name = monthNames[parseInt(mm,10)-1];
    if (d && /^\d+$/.test(d)) return `${name} ${parseInt(d,10)}, ${y}`;
    return `${name} ${y}`;
}

function toISO(y?: string|null, m?: string|null, d?: string|null): string | null {
    if (!y) return null;
    const mm = normMonth(m ?? undefined) ?? "01";
    const dd = d && /^\d+$/.test(d) ? String(parseInt(d,10)).padStart(2, "0") : "01";
    return `${y}-${mm}-${dd}`; // ISO
}


function extractArticleData(xml: string): ArticleData & { publishedDateISO: string | null } {
    const dom = new JSDOM(xml, { contentType: "application/xml" });
    const doc = dom.window.document;

    const pmid = doc.querySelector("PMID")?.textContent ?? "";
    const abstractTexts = Array.from(doc.querySelectorAll("AbstractText")).map(e => e.textContent ?? "");
    const articleTitle = Array.from(doc.querySelectorAll("ArticleTitle")).map(e => e.textContent ?? "");
    const keywords = Array.from(doc.querySelectorAll("Keyword")).map(e => e.textContent ?? "");

    const authors = Array.from(doc.querySelectorAll("Author")).map(a => ({
        name: `${a.querySelector("ForeName")?.textContent ?? ""} ${a.querySelector("LastName")?.textContent ?? ""}`.trim(),
        affiliation: a.querySelector("Affiliation")?.textContent ?? "",
    }));

    // Candidate date nodes in priority order
    const candidates: Element[] = [];
    const adE = doc.querySelector('ArticleDate[DateType="Electronic"]');
    const adP = doc.querySelector('ArticleDate[DateType="Print"]');
    const pubDate = doc.querySelector("JournalIssue > PubDate"); // may have Year/Month/Day or MedlineDate
    const pmPubmed = doc.querySelector('PubMedPubDate[PubStatus="pubmed"]');
    const pmEntrez = doc.querySelector('PubMedPubDate[PubStatus="entrez"]');
    const pmAccepted = doc.querySelector('PubMedPubDate[PubStatus="accepted"]');

    [adE, adP, pubDate, pmPubmed, pmEntrez, pmAccepted].forEach(n => n && candidates.push(n));

    let iso: string | null = null;
    let pretty = "";

    for (const node of candidates) {
        const y = node.querySelector("Year")?.textContent ?? null;
        const m = node.querySelector("Month")?.textContent ?? null;
        const d = node.querySelector("Day")?.textContent ?? null;

        if (node.tagName === "PubDate" && !y) {
            const medline = node.querySelector("MedlineDate")?.textContent ?? "";
            if (medline) {
                const parsed = parseMedlineDate(medline);
                iso = parsed.iso ?? null;
                pretty = parsed.pretty ?? "";
                if (iso) break;
            }
        }

        const maybeISO = toISO(y, m, d);
        if (maybeISO) {
            iso = maybeISO;
            pretty = fmtPretty(y, m, d);
            break;
        }
    }

    // As a last resort, leave iso = null and pretty = "".

    return {
        pmid,
        title: articleTitle.join(""),
        authors,
        abstract: abstractTexts.join("\n"),
        formattedPublishedDate: pretty,
        publishedDate: iso ?? "",
        keywords,
        publishedDateISO: iso ?? null,
    };
}

export const getPubMedSearchResultIds = async (
    query: string,
    cursor: number = 0,
    limit: number = 10
) => {
    // retmax 10000 is the maximum results the API can return
    // retmode can be XML or JSON, obviously we pick JSON
    const queryAPIURL = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=${limit}&retstart=${cursor}&retmode=json&api_key=${process.env.NCBI_API_KEY}`
    const response = await fetch(queryAPIURL)
    const responseData = await response.json()
    const responseDataIds = responseData.esearchresult.idlist.map(function (
        id: string
    ) {
        return parseInt(id)
    })

    return responseDataIds
}

export async function getPubMedSearchResultData(ids: number[]): Promise<any[]> {
    const queryAPIBaseURL = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&rettype=abstract&api_key=${process.env.NCBI_API_KEY}`
    let results: any[] = []

    // Function to fetch data for a single ID
    const fetchDataForId = async (id: number) => {
        const response = await fetch(`${queryAPIBaseURL}&id=${id}`)
        const responseData = await response.text()
        return extractArticleData(responseData)
    }

    // PubMed API is rate-limited to 3 requests per second
    // Process the IDs in batches of 2, waiting 1 second between each batch
    for (let i = 0; i < ids.length; i += 5) {
        const batch = ids.slice(i, i + 5)
        const batchResults = await Promise.all(
            batch.map(id => fetchDataForId(id))
        )
        results = [...results, ...batchResults]

        // Wait for 2 seconds before proceeding to the next batch, unless it's the last batch
        if (i + 3 < ids.length) {
            await delay(1000)
        }
    }

    return results
}

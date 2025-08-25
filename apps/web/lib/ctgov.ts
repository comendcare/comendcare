const CTG_BASE = "https://beta-ut.clinicaltrials.gov/api/v2";

export type CtgovStudy = {
    protocolSection?: {
        identificationModule?: {
            nctId?: string;
            briefTitle?: string;
        };
        statusModule?: {
            overallStatus?: string;
            studyFirstPostDateStruct?: { date?: string; type?: string };
            lastUpdatePostDateStruct?: { date?: string; type?: string };
        };
        conditionsModule?: { conditions?: string[] };
        contactsLocationsModule?: {
            locations?: Array<{
                facility?: string;
                city?: { name?: string };
                state?: { name?: string };
                country?: string;
            }>;
        };
    };
};

export type CtgovPage = {
    nextPageToken?: string;
    studies?: CtgovStudy[];
    totalCount?: number;
};

// ---- resilient fetch for CT.gov v2 ----

const CTG_BASE = "https://clinicaltrials.gov/api/v2";

const CTGOV_UA =
    "ComendIngest/2025.08 (+https://yourdomain.example; contact: ingest@yourdomain.example)";
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 800;
const MAX_BACKOFF_MS = 15_000;
const PAGE_DELAY_MS = 150;

// treat these as retryable
const RETRY_STATUSES = new Set([403, 408, 409, 425, 429, 500, 502, 503, 504]);

// tiny, dependency‑free limiter (per process)
const MAX_IN_FLIGHT = 2;
let inflight = 0;
const q: Array<() => void> = [];
async function withLimit<T>(fn: () => Promise<T>): Promise<T> {
    if (inflight >= MAX_IN_FLIGHT) {
        await new Promise<void>((resolve) => q.push(resolve));
    }
    inflight++;
    try {
        return await fn();
    } finally {
        inflight--;
        const next = q.shift();
        if (next) next();
    }
}

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}
function jitter(ms: number) {
    const d = Math.floor(ms * 0.2);
    return ms + Math.floor(Math.random() * (2 * d + 1)) - d;
}

export async function fetchCtgovPage(params: URLSearchParams): Promise<CtgovPage> {
    const url = `${CTG_BASE}/studies?${params.toString()}`;

    return withLimit(async () => {
        let attempt = 0;
        let backoff = INITIAL_BACKOFF_MS;

        while (true) {
            attempt++;

            const res = await fetch(url, {
                method: "GET",
                redirect: "follow",
                headers: {
                    "User-Agent": CTGOV_UA,
                    Accept: "application/json",
                    "Accept-Encoding": "gzip, deflate, br",
                    Connection: "keep-alive",
                },
            });

            if (res.ok) {
                const json = (await res.json()) as CtgovPage;
                if (PAGE_DELAY_MS > 0) await sleep(PAGE_DELAY_MS); // gentle pacing between pages
                return json;
            }

            const status = res.status;
            const retryAfter = res.headers.get("retry-after");
            const reqId =
                res.headers.get("x-request-id") ??
                res.headers.get("cf-ray") ??
                res.headers.get("x-amzn-trace-id") ??
                "n/a";

            if (!RETRY_STATUSES.has(status) || attempt >= MAX_RETRIES) {
                let body: any;
                try {
                    body = await res.text();
                } catch {}
                throw new Error(
                    `CT.gov fetch failed: ${status} ${res.statusText} — reqId=${reqId} — attempt=${attempt}` +
                    (body ? ` — ${String(body).slice(0, 300)}` : "")
                );
            }

            // backoff with jitter; prefer server hint if provided
            const waitMs = retryAfter ? Number(retryAfter) * 1000 : jitter(backoff);
            await sleep(waitMs);
            backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
        }
    });
}

// ---- safer shaping for mapper ----

export function shapeForMapper(s: CtgovStudy) {
    const id = s.protocolSection?.identificationModule?.nctId ?? null;
    const title = s.protocolSection?.identificationModule?.briefTitle ?? null;

    const status = s.protocolSection?.statusModule?.overallStatus ?? null;

    const posted =
        s.protocolSection?.statusModule?.studyFirstPostDateStruct?.date ??
        s.protocolSection?.statusModule?.lastUpdatePostDateStruct?.date ??
        null;

    // Normalize & de-dup conditions
    const rawConds = s.protocolSection?.conditionsModule?.conditions ?? [];
    const conditions = Array.from(
        new Set(
            rawConds
                .filter((c): c is string => typeof c === "string")
                .map((c) => c.trim())
                .filter(Boolean)
        )
    );

    // Locations: "Facility, City, State, Country", trimmed and compact
    const locsRaw = s.protocolSection?.contactsLocationsModule?.locations ?? [];
    const locations = locsRaw
        .map((loc) => {
            const parts = [
                loc.facility?.trim?.(),
                loc.city?.name?.trim?.(),
                loc.state?.name?.trim?.(),
                typeof loc.country === "string" ? loc.country.trim() : loc.country,
            ].filter(Boolean) as string[];
            return parts.join(", ");
        })
        .filter((s) => s && s.length > 0);

    return {
        NCTId: id ?? undefined,
        BriefTitle: title ?? undefined,
        CurrentRecruitmentStatus: status ?? undefined,
        Conditions: conditions,
        Locations: locations,
        postedDate: posted ?? undefined, // handy for occurredAt fallback
    };
}

// app/api/mixpanel-pageviews/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const REGION = process.env.MIXPANEL_REGION === "eu" ? "eu" : "us";
const HOST = REGION === "eu"
    ? "https://eu.mixpanel.com/api/query/jql"
    : "https://mixpanel.com/api/query/jql";

const SA_USERNAME = process.env.MIXPANEL_SERVICE_ACCOUNT_USERNAME?.trim();
const SA_SECRET  = process.env.MIXPANEL_SERVICE_ACCOUNT_SECRET?.trim();
const PROJECT_ID = "3419552"; // numeric string

function timeoutSignal(ms: number) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    return { signal: ac.signal, cancel: () => clearTimeout(t) };
}

function ymdUTC(d: Date) { return d.toISOString().slice(0, 10); }

export async function GET(req: Request) {
    if (req.signal.aborted) return new Response(null, { status: 499 });

    if (!SA_USERNAME || !SA_SECRET || !PROJECT_ID || !/^\d+$/.test(PROJECT_ID)) {
        return NextResponse.json({ error: "Service account auth not configured or PROJECT_ID not numeric." }, { status: 500 });
    }
    const authHeader = "Basic " + Buffer.from(`${SA_USERNAME}:${SA_SECRET}`).toString("base64");

    const url = new URL(req.url);
    // Default: last 7 days including today (UTC)
    const today = new Date();
    const toDefault = ymdUTC(today);
    const fromDefault = (() => { const d = new Date(today); d.setUTCDate(today.getUTCDate() - 6); return ymdUTC(d); })();

    const from = url.searchParams.get("from") || fromDefault;
    const to   = url.searchParams.get("to")   || toDefault;
    const id   = url.searchParams.get("id")   || ""; // distinct_id

    const jqlQuery = `
function main() {
  var from = "${from}";
  var to   = "${to}";
  var id   = ${JSON.stringify(id)};

  var stream = Events({ from_date: from, to_date: to })
    .filter(function(e){ return e.name === "$mp_web_page_view"; });

  if (id && id.length) {
    stream = stream.filter(function(e){ return e.distinct_id === id; });
  }

  return stream.groupBy([function(e){
    var d = new Date(e.time);
    var yyyy = d.getUTCFullYear();
    var mm = String(d.getUTCMonth()+1).padStart(2,"0");
    var dd = String(d.getUTCDate()).padStart(2,"0");
    return yyyy + "-" + mm + "-" + dd;
  }], mixpanel.reducer.count());
}
`;

    const { signal: toSignal, cancel } = timeoutSignal(25000);
    const abortController = new AbortController();
    const abortBoth = () => abortController.abort();
    req.signal.addEventListener("abort", abortBoth, { once: true });
    toSignal.addEventListener("abort", abortBoth, { once: true });

    try {
        const body = new URLSearchParams({ script: jqlQuery, project_id: PROJECT_ID }).toString();
        const res = await fetch(HOST, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body,
            cache: "no-store",
            signal: abortController.signal,
        });

        if (req.signal.aborted) return new Response(null, { status: 499 });

        if (!res.ok) {
            const text = await res.text();
            if (res.status === 402) {
                // Keep UI alive if JQL isn’t available on your plan
                return NextResponse.json([], { status: 200 });
            }
            return NextResponse.json({ error: `Mixpanel error: ${res.status} ${text}` }, { status: 500 });
        }

        const raw = await res.json(); // [{ key: ["YYYY-MM-DD"], value: n }, ...]
        const formatted = (Array.isArray(raw) ? raw : []).map((d: any) => ({
            date: Array.isArray(d.key) ? d.key[0] : d.key,
            pageViews: d.value ?? 0,
        }));

        // Optional: ensure every day in the window is present (zero-fill)
        const days = new Map(formatted.map((r: any) => [r.date, r.pageViews]));
        const out: { date: string; pageViews: number }[] = [];
        const start = new Date(from + "T00:00:00Z");
        const end = new Date(to + "T00:00:00Z");
        for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
            const key = ymdUTC(d);
            out.push({ date: key, pageViews: days.get(key) ?? 0 });
        }

        return NextResponse.json(out);
    } catch (err: any) {
        if (err?.name === "AbortError") return new Response(null, { status: 499 });
        return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
    } finally {
        cancel();
    }
}

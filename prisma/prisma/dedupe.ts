/* scripts/find-duplicate-companies.ts
 * Read-only duplicate finder for Company.url
 * - Default: exact DB groupBy
 * - --normalize: in-memory normalized URL scan (still read-only)
 *
 * Run:
 *   npx tsx scripts/find-duplicate-companies.ts
 *   npx tsx scripts/find-duplicate-companies.ts --normalize
 */

import { PrismaClient, Prisma } from "@prisma/client";

type Row = {
    id: string;
    url: string;
    title: string | null;
    createdAt: Date;
};

const prisma = new PrismaClient();

function parseArgs() {
    const argv = process.argv.slice(2);
    const get = (pfx: string) => {
        for (let i = 0; i < argv.length; i++) {
            if (argv[i].indexOf(pfx) === 0) return argv[i].slice(pfx.length);
        }
        return undefined;
    };
    return {
        normalize: argv.indexOf("--normalize") !== -1,
        limit: Number(get("--limit=") || "0"),
    };
}

/** URL normalizer (no for..of; ES5-safe) */
function normalizeUrl(raw: string): string {
    function ensureProtocol(u: string) {
        return /^https?:\/\//i.test(u) ? u : "https://" + u;
    }
    try {
        const u = new URL(ensureProtocol(raw));
        let host = (u.hostname || "").toLowerCase();
        if (host.slice(0, 4) === "www.") host = host.slice(4);

        let pathname = u.pathname || "/";
        if (pathname.length > 1 && pathname.charAt(pathname.length - 1) === "/") {
            pathname = pathname.slice(0, -1);
        }
        return host + pathname;
    } catch {
        let s = (raw || "").trim().toLowerCase();
        if (s.indexOf("http://") === 0) s = s.slice(7);
        else if (s.indexOf("https://") === 0) s = s.slice(8);
        if (s.indexOf("www.") === 0) s = s.slice(4);
        const q = s.indexOf("?");
        if (q !== -1) s = s.slice(0, q);
        const h = s.indexOf("#");
        if (h !== -1) s = s.slice(0, h);
        if (s.length > 1 && s.charAt(s.length - 1) === "/") s = s.slice(0, -1);
        return s;
    }
}

function printGroup(header: string, rows: Row[]) {
    console.log("\n=== " + header + " (" + rows.length + ") ===");
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        console.log(
            "• id=" +
            r.id +
            " | title=" +
            (r.title || "(no title)") +
            " | createdAt=" +
            r.createdAt.toISOString() +
            " | url=" +
            r.url
        );
    }
}

/** Exact duplicates via groupBy (typed so TS is happy) */
async function exactDuplicates() {
    // Make `by` a literal tuple; works across Prisma versions
    const grouped = await prisma.company.groupBy({
        by: ["url"] as const,
        _count: { _all: true },
    });

    const dupUrls: string[] = [];
    for (let i = 0; i < grouped.length; i++) {
        const g = grouped[i] as {
            url: string;
            _count: { _all: number };
        };
        if ((g._count && g._count._all) > 1) dupUrls.push(g.url);
    }

    if (dupUrls.length === 0) {
        console.log("No exact duplicates found by url.");
        return;
    }

    const rows = await prisma.company.findMany({
        where: { url: { in: dupUrls } },
        select: { id: true, url: true, title: true, createdAt: true },
        orderBy: [{ url: "asc" as const }, { createdAt: "asc" as const }],
    });

    const byUrl = new Map<string, Row[]>();
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i] as Row;
        const list = byUrl.get(r.url) || [];
        list.push(r);
        byUrl.set(r.url, list);
    }

    byUrl.forEach((list, url) => {
        if (list.length > 1) {
            printGroup("Exact URL: " + url, list);
        }
    });
}

/** Normalized duplicate detection (batched scan, read-only) */
async function normalizedDuplicates(limit: number) {
    const BATCH = 1000;

    const map = new Map<string, Row[]>();
    let cursor: string | undefined = undefined;
    let scanned = 0;

    while (true) {
        const batch = await prisma.company.findMany({
            take: BATCH,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            select: { id: true, url: true, title: true, createdAt: true },
            orderBy: { id: "asc" },
        });

        if (!batch || batch.length === 0) break;

        for (let i = 0; i < batch.length; i++) {
            const r = batch[i] as Row;
            scanned++;
            const key = normalizeUrl(r.url || "");
            const list = map.get(key) || [];
            list.push(r);
            map.set(key, list);

            if (limit && scanned >= limit) break;
        }

        if (limit && scanned >= limit) break;
        cursor = batch[batch.length - 1].id;
    }

    // sort each group and print only duplicates
    let found = 0;
    map.forEach((list, key) => {
        if (list.length > 1) {
            found++;
            list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            printGroup("Normalized URL key: " + key, list);
        }
    });

    if (found === 0) console.log("No normalized duplicates found by url.");
    else console.log("\nFound " + found + " duplicate groups (normalized).");
}

async function main() {
    const args = parseArgs();
    console.log(
        "Scanning duplicates by url " +
        (args.normalize ? "(normalized)" : "(exact)") +
        (args.normalize && args.limit ? " | limit=" + args.limit : "") +
        "..."
    );
    if (args.normalize) await normalizedDuplicates(args.limit);
    else await exactDuplicates();
}

main()
    .catch((err) => {
        console.error("Error:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

prisma.company.groupBy({ by: ["url"], _count: { _all: true } }).then(r => {
    const totalDupGroups = r.filter(g => g._count._all > 1).length;
    const totalDupRows = r.reduce((sum, g) => sum + (g._count._all > 1 ? g._count._all : 0), 0);
    console.log(`\nTotal duplicate URL groups: ${totalDupGroups}`);
    console.log(`Total rows in duplicate groups: ${totalDupRows}`);
});

import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";

// Lightweight stopword list; expand as needed.
const STOPWORDS = new Set([
    "a","an","the","and","or","but","for","nor","so","to","of","in","on","at","by","with",
    "from","up","down","over","under","into","about","as","is","are","was","were","be","been",
    "it","that","this","those","these","than","then","if","not"
]);

function normalizeQuery(raw: string) {
    const tokens = raw
        .toLowerCase()
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean);

    // keep tokens that aren't stopwords and have length >= 3,
    // but allow numbers (e.g., "2", "47") since they can be meaningful
    const filtered = tokens.filter(t => (!STOPWORDS.has(t) && (t.length >= 3 || /^[0-9]+$/.test(t))));
    return Array.from(new Set(filtered));  // de-dup
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const rawQuery = (url.searchParams.get("search") || "").trim();

        // Short-circuit empty input
        if (!rawQuery) return NextResponse.json([]);

        const tokens = normalizeQuery(rawQuery);

        // If the user typed only stopwords like "the", "and", etc.,
        // don't run a noisy DB query—return empty and let the UI say "keep typing"
        if (tokens.length === 0) {
            return NextResponse.json([]);
        }

        // Prefer prefix matches (startsWith) to feel snappy, then broader AND contains
        const limit = 50;

        // 1) Prefix hits (any token as a prefix)
        const startsWithHits = await prisma.condition.findMany({
            where: {
                OR: tokens.map(t => ({
                    name: { startsWith: t, mode: "insensitive" },
                })),
            },
            select: { name: true },
            take: limit,
        });

        // 2) If we still have room, fetch broader matches that contain ALL tokens
        //    and exclude anything we already returned.
        const already = new Set(startsWithHits.map(r => r.name));
        let containsHits: { name: string }[] = [];
        if (startsWithHits.length < limit) {
            containsHits = await prisma.condition.findMany({
                where: {
                    AND: tokens.map(t => ({
                        name: { contains: t, mode: "insensitive" },
                    })),
                    NOT: { name: { in: Array.from(already) } },
                },
                select: { name: true },
                take: limit - startsWithHits.length,
            });
        }

        const results = [...startsWithHits, ...containsHits];

        const formatted = results.map(c => ({ label: c.name, value: c.name }));

        // Optional: tiny cache to smooth out fast repeat keystrokes (adjust to taste)
        return new NextResponse(JSON.stringify(formatted), {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
            },
        });
    } catch (error) {
        console.error("Error fetching conditions:", error);
        return NextResponse.json({ error: "Failed to fetch conditions." }, { status: 500 });
    }
}

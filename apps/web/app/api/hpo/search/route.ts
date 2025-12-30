import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q) return NextResponse.json({ items: [] });

    const url = new URL("https://ontology.jax.org/api/hp/search");
    url.searchParams.set("q", q);
    url.searchParams.set("page", "0");
    url.searchParams.set("limit", "20");

    const res = await fetch(url.toString(), {
        headers: { "accept": "application/json" },
        // optionally: next: { revalidate: 3600 }  (if you want caching)
    });

    if (!res.ok) return NextResponse.json({ items: [] }, { status: 200 });

    const data = await res.json();

    // Normalize into what your multiselect wants
    const items = (data?.results ?? data?.terms ?? []).map((t: any) => ({
        id: t.id ?? t.curie,          // e.g. "HP:0001250"
        label: t.name ?? t.label,     // e.g. "Seizures"
    }));

    return NextResponse.json({ items });
}

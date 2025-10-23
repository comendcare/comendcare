import prisma from "@comend/lib/prisma"
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        // Extract and normalize the search query from the request URL
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        if (searchQuery === "") return NextResponse.json([])

        // Query the Institution model with a case-insensitive search
        const institutions = await prisma.institution.findMany({
            where: {
                name: {
                    contains: searchQuery,
                    mode: 'insensitive',
                },
            },
            take: 50, // Limit results
            orderBy: {name: 'asc'}
        });

        // Format for selector input (e.g., dropdown)
        const formattedResults = institutions.map((institution) => ({
            label: institution.name,
            value: institution.id, // You could also use institution.name if preferred
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching institutions:", error);
        return NextResponse.json({ error: "Failed to fetch institutions." }, { status: 500 });
    }
}

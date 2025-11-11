import prisma from '@comend/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        // Extract and normalize the search query from the request URL
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        // Query the biosample model with a case-insensitive search
        const milestones = await prisma.milestone.findMany({
            where: {
                id: {
                    contains: searchQuery,
                    mode: 'insensitive',
                },
            },
            take: 15, // Limit results
            orderBy: {id: 'asc'}
        });

        // Format for selector input (e.g., dropdown)
        const formattedResults = milestones.map((milestone) => ({
            label: milestone.title,
            value: milestone.id,
            type: 'Project',
            icon: "file-text",
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching institutions:", error);
        return NextResponse.json({ error: "Failed to fetch institutions." }, { status: 500 });
    }
}
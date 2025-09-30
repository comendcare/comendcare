import prisma from '@comend/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Extract and normalize the search query from the request URL
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";
        const organizationId = url.searchParams.get("orgId");

        if (!organizationId) {
            return NextResponse.json([])
        }

        // Query the Milestone model with a case-insensitive search
        const milestones = await prisma.milestone.findMany({
            where: {
                private: false,
                title: {
                    contains: searchQuery,
                    mode: 'insensitive',
                },
            },
            take: 50, // Limit results
            orderBy: {title: 'asc'}
        });

        // Format for selector input (e.g., dropdown)
        const formattedResults = milestones.map((milestone) => ({
            label: milestone.title,
            value: milestone.id, // You could also use milestone.title if preferred
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Prisma fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

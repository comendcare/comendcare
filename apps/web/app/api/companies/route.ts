import prisma from '@comend/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        // Extract and normalize the search query from the request URL
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        // Query the company model with a case-insensitive search
        const companies = await prisma.company.findMany({
            where: {
                title: {
                    contains: searchQuery,
                    mode: 'insensitive',
                },
            },
            take: 50, // Limit results
            orderBy: {title: 'asc'}
        });

        // Format for selector input (e.g., dropdown)
        const formattedResults = companies.map((company) => ({
            label: company.title,
            value: company.id,
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching institutions:", error);
        return NextResponse.json({ error: "Failed to fetch institutions." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { ids } = await req.json();
        if (!ids || ids.length === 0) return NextResponse.json([], { status: 200 });

        const results = await prisma.company.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                services: true,
                sites: true,
                certifications: {
                    include: {
                        files: true,
                    },
                },
                rfis: true,
                reviews: true,
                biosamples: true,
                diseaseModel: true,
                tool: true,
            },
        });

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Prisma fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

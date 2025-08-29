import prisma from '@comend/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { ids } = await req.json();
        if (!ids || ids.length === 0) return NextResponse.json([], { status: 200 });

        const results = await prisma.organization.findMany({
            where: {
                id: { in: ids }, // Ensure we fetch all organizations
            },
            include: {
                conditions: {include: {condition: true}},
                milestones: {
                    where: {private: false},
                    include: {node: true}
                },
                roadmaps: {
                    where: {
                        milestones: {some: {private: false}} // Only include roadmaps with at least one public milestone
                    }
                },
                biosamples: {where: {private: false}},
                diseaseModel: {where: {private: false}},
                tools: {where: {private: false}},
                rfps: {where: {private: false}}
            }
        });

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Prisma fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        // Parse the incoming URL and extract query parameters
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        // Query the Prisma database
        const organizations = await prisma.organization.findMany({
            where: {
                // symbol: {
                //     contains: searchQuery,
                //     mode: 'insensitive', // Case-insensitive search
                // },
                name: {
                    contains: searchQuery,
                    mode: 'insensitive' // Case-insensitive search
                }
            },
            take: 50, // Limit the number of results
            select: {
                id: true,
                name: true,
            },
        });

        // Format the results for the MultipleSelector
        const formattedResults = organizations.map((organization) => ({
            label: organization.name, // Use "name" for the label
            value: organization.id, // Use "id" for the value
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return NextResponse.json({error: "Failed to fetch organizations."}, {status: 500});
    }
}

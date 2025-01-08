import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        // Parse the incoming URL and extract query parameters
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        // Query the Prisma database
        const genes = await prisma.gene.findMany({
            where: {
                symbol: {
                    contains: searchQuery,
                    mode: 'insensitive', // Case-insensitive search
                },
            },
            take: 50, // Limit the number of results
        });

        // Format the results for the MultipleSelector
        const formattedResults = genes.map((gene) => ({
            label: gene.symbol, // Use "symbol" for the label
            value: gene.symbol, // Use "symbol" for the value
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching genes:", error);
        return NextResponse.json({ error: "Failed to fetch genes." }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import prisma from "@comend/lib/prisma"

export async function GET(req: Request) {
    try {
        // Parse the incoming URL and extract query parameters
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        // Query the Prisma database
        const diagnosisTypes = await prisma.diagnosisType.findMany({
            where: {
                label: {
                    contains: searchQuery,
                    mode: 'insensitive', // Case-insensitive search
                },
            },
            take: 50, // Limit the number of results
            select: {
                id: true,
                label: true, // Only need symbols for this request
            },
        });

        // Format the results for the MultipleSelector
        const formattedResults = diagnosisTypes.map((diagnosis) => ({
            label: diagnosis.label, // Use "symbol" for the label
            value: diagnosis.id, // Use "symbol" for the value
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching conditions:", error);
        return NextResponse.json({error: "Failed to fetch conditions."}, {status: 500});
    }
}

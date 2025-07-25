import { NextResponse } from 'next/server';
import prisma from "@comend/lib/prisma"

export async function GET(req: Request) {
    try {
        // Parse the incoming URL and extract query parameters
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";
        const orgId = url.searchParams.get("organizationId") || undefined;

        if (!orgId) NextResponse.json({error: "Missing required query parameter: organizationId"}, {status: 400})

        // Query the Prisma database
        const donors = await prisma.donor.findMany({
            where: {
                id: {
                    contains: searchQuery,
                    mode: 'insensitive', // Case-insensitive search
                },
                organizationId: orgId
            },
            take: 50, // Limit the number of results
            select: {
                id: true,
                // id: true, // Only need symbols for this request
            },
        });

        // Format the results for the MultipleSelector
        const formattedResults = donors.map((donor) => ({
            img: `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${donor.id}`,
            label: donor.id, // Use "symbol" for the label
            value: donor.id, // Use "symbol" for the value
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching conditions:", error);
        return NextResponse.json({error: "Failed to fetch conditions."}, {status: 500});
    }
}

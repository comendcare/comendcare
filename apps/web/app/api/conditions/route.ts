import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"
import path from "path";
import fs from "fs";

export async function GET(req: Request) {
    try {
        // Parse the incoming URL and extract query parameters
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        // Query the Prisma database
        const conditions = await prisma.condition.findMany({
            where: {
                name: {
                    contains: searchQuery,
                    mode: 'insensitive', // Case-insensitive search
                },
            },
            take: 50, // Limit the number of results
            select: {
                name: true, // Only need symbols for this request
            },
        });

        // Format the results for the MultipleSelector
        const formattedResults = conditions.map((condition) => ({
            label: condition.name, // Use "symbol" for the label
            value: condition.name, // Use "symbol" for the value
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching conditions:", error);
        return NextResponse.json({error: "Failed to fetch conditions."}, {status: 500});
    }
}

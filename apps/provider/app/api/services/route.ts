import prisma from "@/lib/prisma"
import { NextResponse } from 'next/server';
import path from "path";
import fs from "fs";

export async function GET(req: Request) {
    try {
        // Parse the incoming URL and extract query parameters
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        // Query the Prisma database
        const services = await prisma.service.findMany({
            where: {
                name: {
                    contains: searchQuery,
                    mode: 'insensitive', // Case-insensitive search
                },
            },
            take: 50, // Limit the number of results
        });

        // Format the results for the MultipleSelector
        const formattedResults = services.map((service) => ({
            label: service.name, // Use "symbol" for the label
            value: service.name, // Use "symbol" for the value
        }));

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({error: "Failed to fetch services."}, {status: 500});
    }
}


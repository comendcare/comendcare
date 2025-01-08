import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
    try {
        // Parse the incoming URL and extract query parameters
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        // Define the path to your JSON dataset
        const filePath = path.join(process.cwd(), "data/non_alt_loci_set.json");

        // Read the dataset
        const rawData = fs.readFileSync(filePath, "utf-8");
        const dataset = JSON.parse(rawData);

        // Extract the relevant part of the dataset (assuming "docs" contains the gene entries)
        const genes = dataset.response?.docs || [];

        // Filter based on the "symbol" field if a query is provided
        const filteredGenes = searchQuery
            ? genes.filter((gene: any) => gene.symbol?.toLowerCase().includes(searchQuery))
            : genes;

        // Limit the number of results to improve performance
        const limitedResults = filteredGenes.slice(0, 50);

        // Map the results to the required format for the MultipleSelector
        const formattedResults = limitedResults.map((gene: any) => ({
            label: gene.symbol, // Use "symbol" for the label
            value: gene.symbol, // Use "symbol" for the value
        }));

        // Return the filtered and formatted results
        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error processing the request:", error);
        return NextResponse.json({ error: "Failed to fetch genes." }, { status: 500 });
    }
}

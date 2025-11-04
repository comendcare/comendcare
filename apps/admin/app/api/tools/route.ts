import prisma from '@comend/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        // Extract and normalize the search query from the request URL
        const url = new URL(req.url);
        const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

        // Query the biosample model with a case-insensitive search
        const biosamples = await prisma.biosample.findMany({
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
        const formattedBiosamples = biosamples.map((biosample) => ({
            label: biosample.id,
            value: biosample.id,
            type: 'Biosamples',
            icon: "test-tube-diagonal",
            // img: `https://api.dicebear.com/8.x/shapes/svg?seed=${biosample.donorId}`,
            // label: `${biosample.id} - ${(BIOSAMPLE_TYPE_OPTIONS.filter(option => biosample?.types?.includes(option.value)))?.map(option => option?.label)?.join(', ')}`,
            // biosample
        }));

        // Query the disease model model with a case-insensitive search
        const diseaseModels = await prisma.diseaseModel.findMany({
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
        const formattedDiseaseModels = diseaseModels.map((diseaseModel) => ({
            label: diseaseModel.id,
            value: diseaseModel.id,
            // label: `${diseaseModel.id} - ${(DISEASE_MODEL_TYPE_OPTIONS.filter(option => diseaseModel?.types?.includes(option.value)))?.map(option => option?.label)?.join(', ')}`,
            icon: 'rat',
            type: 'Disease models',
            // diseaseModel
        }));

        // Query the clinical datasets model with a case-insensitive search
        const clinicalDatasets = await prisma.tool.findMany({
            where: {
                OR: [
                    {
                        id: {
                            contains: searchQuery,
                            mode: 'insensitive',
                        }
                    },
                    {
                        title: {
                            contains: searchQuery,
                            mode: 'insensitive',
                        }
                    }
                ]
            },
            take: 15, // Limit results
            orderBy: {id: 'asc'}
        });

        // Format for selector input (e.g., dropdown)
        const formattedClinicalDatasets = clinicalDatasets.map((clinicalDataset) => ({
            label: clinicalDataset.id,
            value: clinicalDataset.id,
            // label: `${datasample?.id} - ${datasample?.title}`,
            icon: 'database',
            type: 'Clinical datasets',
            // datasample
        }));

        const formattedResults = formattedBiosamples.concat(formattedDiseaseModels).concat(formattedClinicalDatasets)

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error("Error fetching institutions:", error);
        return NextResponse.json({ error: "Failed to fetch institutions." }, { status: 500 });
    }
}
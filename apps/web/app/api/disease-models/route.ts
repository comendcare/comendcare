import prisma from '@comend/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { ids } = await req.json();
        if (!ids || ids.length === 0) return NextResponse.json([], { status: 200 });

        const results = await prisma.diseaseModel.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                gene: true,
                institution: true,
                company: true,
                organization: {include: {conditions: {include: {condition: true}}}},
                milestones: {
                    where: {milestone: {private: false}},
                    include: {milestone: true}
                },
                attachments: true,
                contacts: true,
                createFacilityRequests: true,
            },
        });

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Prisma fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

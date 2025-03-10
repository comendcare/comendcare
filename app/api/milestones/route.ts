import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { ids } = await req.json();
        if (!ids || ids.length === 0) return NextResponse.json([], { status: 200 });

        const results = await prisma.milestone.findMany({
            where: {
                id: { in: ids }, // Ensure we fetch all organizations
            },
            include: {
                node: true,
                contacts: true,
                attachments: true,
                types: true
            }
        });

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Prisma fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

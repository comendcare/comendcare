import prisma from '@comend/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { ids } = await req.json();
        if (!ids || ids.length === 0) return NextResponse.json([], { status: 200 });

        const results = await prisma.roadmap.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                organization: true,
                milestones: {
                    where: { private: false }
                },
                links: true,
                partners: true,
            }
        });

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Prisma fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

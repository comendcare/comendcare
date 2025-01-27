import { syncToTypesense } from '@/lib/sync';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const env = {
            TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
        };

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            console.error('Unexpected error type:', error);
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET() {
    try {
        const env = {
            TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
        };

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            console.error('Unexpected error type:', error);
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

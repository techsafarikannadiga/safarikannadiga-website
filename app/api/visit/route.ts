import { NextResponse } from 'next/server';
import { getVisitCount, incrementVisitCount } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Ensure it's not cached static

export async function GET() {
    const count = await getVisitCount();
    return NextResponse.json({ count });
}

export async function POST() {
    const result = await incrementVisitCount();
    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ count: result.count });
}

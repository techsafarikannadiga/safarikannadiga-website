import { NextResponse } from 'next/server';
import {
    clearAdminSessionCookies
} from '@/lib/firebase-auth';


export async function DELETE() {
    const response = NextResponse.json({ success: true });
    clearAdminSessionCookies(response);
    return response;
}

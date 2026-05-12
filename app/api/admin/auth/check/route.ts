import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    ADMIN_SESSION_COOKIE,
    clearAdminSessionCookies,
    verifyAdminSessionCookie
} from '@/lib/firebase-auth';

/**
 * Lightweight endpoint checking if the browser currently holds 
 * a verified and cryptographically valid active session.
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
        const user = await verifyAdminSessionCookie(sessionCookie);

        if (user) {
            return NextResponse.json({
                authenticated: true, 
                email: user.email,
                id: user.id 
            });
        }

        const response = NextResponse.json({ authenticated: false });
        clearAdminSessionCookies(response);
        return response;
    } catch (error) {
        console.error('Firebase session verify failure:', error);
        return NextResponse.json({ authenticated: false, error: 'Session verification failed' });
    }
}

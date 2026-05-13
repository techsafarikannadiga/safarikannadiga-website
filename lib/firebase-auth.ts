import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from './firebase-admin';

export const ADMIN_SESSION_COOKIE = 'firebase-admin-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export interface AuthenticatedAdminUser {
    id: string;
    email?: string;
}

export function clearAdminSessionCookies(response: NextResponse): void {
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    response.cookies.delete('admin_token');
}

export async function createAdminSessionCookie(idToken: string): Promise<string> {
    return getFirebaseAdminAuth().createSessionCookie(idToken, {
        expiresIn: SESSION_MAX_AGE * 1000,
    });
}

export function setAdminSessionCookie(response: NextResponse, sessionCookie: string): void {
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
    });
}

export async function verifyAdminSessionCookie(sessionCookie?: string): Promise<AuthenticatedAdminUser | null> {
    if (!sessionCookie) return null;

    try {
        const decoded = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true);
        return {
            id: decoded.uid,
            email: decoded.email,
        };
    } catch {
        return null;
    }
}

export async function getAuthenticatedUser(): Promise<AuthenticatedAdminUser | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    return verifyAdminSessionCookie(sessionCookie);
}

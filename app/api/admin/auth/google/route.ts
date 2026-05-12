import { NextResponse } from 'next/server';
import {
    createAdminSessionCookie,
    setAdminSessionCookie,
    clearAdminSessionCookies,
} from '@/lib/firebase-auth';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

// List of admin email addresses that can access the admin panel
const ADMIN_EMAILS = [
    'samarthv080@gmail.com',
    'dev.samarthv@gmail.com',
    'safarikannadiga@gmail.com',
];

export async function POST(req: Request) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
        }

        // Verify Firebase token
        const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
        const userEmail = decodedToken.email;

        if (!userEmail) {
            return NextResponse.json({ error: 'Email not found in token' }, { status: 400 });
        }

        // Check if user email is in admin list
        if (!ADMIN_EMAILS.includes(userEmail)) {
            console.warn(`Unauthorized admin access attempt from: ${userEmail}`);
            return NextResponse.json(
                { error: 'You do not have permission to access the admin panel' },
                { status: 403 }
            );
        }

        // Create Firebase session cookie
        const sessionCookie = await createAdminSessionCookie(idToken);
        const response = NextResponse.json({
            success: true,
            email: userEmail,
            id: decodedToken.uid,
        });

        setAdminSessionCookie(response, sessionCookie);

        return response;
    } catch (error) {
        console.error('Google OAuth error:', error);
        if (error instanceof Error && error.message.includes('revoked')) {
            return NextResponse.json({ error: 'Token has been revoked' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to verify Google token' }, { status: 401 });
    }
}

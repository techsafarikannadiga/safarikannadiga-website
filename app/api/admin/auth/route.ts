import { NextResponse } from 'next/server';
import {
    createAdminSessionCookie,
    clearAdminSessionCookies,
    setAdminSessionCookie,
    signInWithFirebasePassword
} from '@/lib/firebase-auth';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const loginEmail = (email || process.env.ADMIN_LOGIN_EMAIL || '').trim();
        if (!loginEmail || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const signIn = await signInWithFirebasePassword(loginEmail, password);
        if (!signIn.success) {
            console.error('Firebase login failure:', signIn.error);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const sessionCookie = await createAdminSessionCookie(signIn.idToken);
        const response = NextResponse.json({
            success: true,
            email: signIn.email,
            id: signIn.id,
        });

        setAdminSessionCookie(response, sessionCookie);

        return response;

    } catch (error) {
        console.error('Login error stack:', error);
        return NextResponse.json({ error: 'Failed to authenticate service' }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    clearAdminSessionCookies(response);
    return response;
}

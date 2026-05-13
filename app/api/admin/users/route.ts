import { NextResponse } from 'next/server';
import { FieldValue, getFirebaseDb } from '@/lib/firebase-admin';
import { getAuthenticatedUser } from '@/lib/firebase-auth';

// Helper to validate email format
function isValidEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// GET: List all whitelisted admins
export async function GET() {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getFirebaseDb();
        const snapshot = await db.collection('admins')
            .orderBy('addedAt', 'desc')
            .get();

        const admins = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                email: doc.id,
                addedAt: data.addedAt?.toDate?.()?.toISOString() || null,
                addedBy: data.addedBy || 'Unknown',
            };
        });

        return NextResponse.json({ success: true, admins });
    } catch (error) {
        console.error('[AdminUsers API] GET Error:', error);
        return NextResponse.json({ error: 'Failed to load administrators' }, { status: 500 });
    }
}

// POST: Whitelist a new admin
export async function POST(req: Request) {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const email = (body.email || '').trim().toLowerCase();

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
        }

        const db = getFirebaseDb();
        const docRef = db.collection('admins').doc(email);
        const doc = await docRef.get();

        if (doc.exists) {
            return NextResponse.json({ error: 'This email is already whitelisted' }, { status: 409 });
        }

        await docRef.set({
            email,
            addedAt: FieldValue.serverTimestamp(),
            addedBy: currentUser.email || 'system',
        });

        return NextResponse.json({
            success: true,
            message: `Successfully whitelisted ${email}`,
        });
    } catch (error) {
        console.error('[AdminUsers API] POST Error:', error);
        return NextResponse.json({ error: 'Failed to add administrator' }, { status: 500 });
    }
}

// DELETE: Remove an admin from the whitelist
export async function DELETE(req: Request) {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const targetEmail = (searchParams.get('email') || '').trim().toLowerCase();

        if (!targetEmail) {
            return NextResponse.json({ error: 'Target email parameter is missing' }, { status: 400 });
        }

        // Self-protection safeguard: Do not allow admins to revoke their own permissions
        if (currentUser.email?.toLowerCase() === targetEmail) {
            return NextResponse.json({ error: 'You cannot revoke your own administrative access' }, { status: 403 });
        }

        const db = getFirebaseDb();
        const docRef = db.collection('admins').doc(targetEmail);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Administrator not found' }, { status: 404 });
        }

        await docRef.delete();

        return NextResponse.json({
            success: true,
            message: `Revoked administrative access for ${targetEmail}`,
        });
    } catch (error) {
        console.error('[AdminUsers API] DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
    }
}

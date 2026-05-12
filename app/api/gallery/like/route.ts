import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { FieldValue, getFirebaseDb } from '@/lib/firebase-admin';

function getUserHash(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const ua = req.headers.get('user-agent') || 'unknown';
    return crypto.createHash('sha256').update(`${ip}-${ua}`).digest('hex');
}

function getLikeId(imagePath: string, userHash: string) {
    return crypto.createHash('sha256').update(`${imagePath}:${userHash}`).digest('hex');
}

async function getLikeState(imagePath: string, userHash: string) {
    const snapshot = await getFirebaseDb()
        .collection('image_likes')
        .where('image_path', '==', imagePath)
        .get();

    return {
        count: snapshot.size,
        liked: snapshot.docs.some((doc) => doc.data().user_hash === userHash),
    };
}

export async function POST(req: Request) {
    try {
        const { imagePath } = await req.json();
        if (!imagePath) {
            return NextResponse.json({ error: 'Image path required' }, { status: 400 });
        }

        const userHash = getUserHash(req);
        const likeRef = getFirebaseDb().collection('image_likes').doc(getLikeId(imagePath, userHash));
        const existing = await likeRef.get();

        if (existing.exists) {
            await likeRef.delete();
        } else {
            await likeRef.set({
                image_path: imagePath,
                user_hash: userHash,
                created_at: FieldValue.serverTimestamp(),
            });
        }

        const state = await getLikeState(imagePath, userHash);
        return NextResponse.json(state);
    } catch (error) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const imagePath = searchParams.get('path');

        if (!imagePath) {
            return NextResponse.json({ error: 'Path required' }, { status: 400 });
        }

        const userHash = getUserHash(req);
        const state = await getLikeState(imagePath, userHash);
        return NextResponse.json(state);
    } catch (error) {
        console.error('Like fetch error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

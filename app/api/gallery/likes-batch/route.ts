import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseDb } from '@/lib/firebase-admin';

function getUserHash(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const ua = req.headers.get('user-agent') || 'unknown';
    return crypto.createHash('sha256').update(`${ip}-${ua}`).digest('hex');
}

export async function POST(req: Request) {
    try {
        const { paths } = await req.json();

        if (!paths || !Array.isArray(paths)) {
            return NextResponse.json({ error: 'Paths array required' }, { status: 400 });
        }

        const userHash = getUserHash(req);
        const result: Record<string, { count: number, liked: boolean }> = {};
        paths.forEach((path) => result[path] = { count: 0, liked: false });

        for (let index = 0; index < paths.length; index += 10) {
            const chunk = paths.slice(index, index + 10);
            const snapshot = await getFirebaseDb()
                .collection('image_likes')
                .where('image_path', 'in', chunk)
                .get();

            snapshot.docs.forEach((doc) => {
                const like = doc.data();
                if (!result[like.image_path]) return;

                result[like.image_path].count++;
                if (like.user_hash === userHash) {
                    result[like.image_path].liked = true;
                }
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Likes batch error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

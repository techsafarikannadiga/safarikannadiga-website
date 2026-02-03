import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

        // 1. Get counts
        // Using the RPC function would be ideal, but for now we can select all matching rows and aggregate in JS
        // (Not efficient for millions of likes, but fine for thousands)
        // A better way is raw SQL:
        // SELECT image_path, COUNT(*) FROM image_likes WHERE image_path IN (...) GROUP BY image_path

        // Since we don't have direct SQL access easily via client without RPC, let's use RPC if available, or just fetch all likes for these paths?
        // Fetching all is bad.

        // Let's use the DB query on 'image_likes' where path in list.
        const { data: allLikes, error } = await supabaseAdmin
            .from('image_likes')
            .select('image_path, user_hash')
            .in('image_path', paths);

        if (error) throw error;

        const result: Record<string, { count: number, liked: boolean }> = {};

        // Initialize
        paths.forEach(p => result[p] = { count: 0, liked: false });

        // Aggregate
        allLikes?.forEach(like => {
            if (result[like.image_path]) {
                result[like.image_path].count++;
                if (like.user_hash === userHash) {
                    result[like.image_path].liked = true;
                }
            }
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Likes batch error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

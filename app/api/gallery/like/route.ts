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
        const { imagePath } = await req.json();

        if (!imagePath) {
            return NextResponse.json({ error: 'Image path required' }, { status: 400 });
        }

        const userHash = getUserHash(req);

        // Check if already liked
        const { data: existing } = await supabaseAdmin
            .from('image_likes')
            .select('id')
            .eq('image_path', imagePath)
            .eq('user_hash', userHash)
            .single();

        if (existing) {
            // Already liked, maybe unlike? For now, just return existing count
            // return NextResponse.json({ message: 'Already liked' });
            // Toggle like (remove if exists)
            await supabaseAdmin
                .from('image_likes')
                .delete()
                .eq('id', existing.id);
        } else {
            // Add like
            await supabaseAdmin
                .from('image_likes')
                .insert([{ image_path: imagePath, user_hash: userHash }]);
        }

        // Get new count
        const { count } = await supabaseAdmin
            .from('image_likes')
            .select('*', { count: 'exact', head: true })
            .eq('image_path', imagePath);

        const isLiked = !existing; // If it existed, we deleted it (false). If not, we added it (true).

        return NextResponse.json({ count: count || 0, liked: isLiked });

    } catch (error) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
        return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    const { count } = await supabaseAdmin
        .from('image_likes')
        .select('*', { count: 'exact', head: true })
        .eq('image_path', imagePath);

    // Check if current user liked
    const userHash = getUserHash(req);
    const { data: userLike } = await supabaseAdmin
        .from('image_likes')
        .select('id')
        .eq('image_path', imagePath)
        .eq('user_hash', userHash)
        .single();

    return NextResponse.json({ count: count || 0, liked: !!userLike });
}

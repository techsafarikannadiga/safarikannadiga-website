
import dotenv from 'dotenv';
import path from 'path';

// Load env vars first
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugAuth() {
    console.log('Loading ImageKit module...');
    // Dynamically import AFTER dotenv config
    const { getAuthParams } = await import('../lib/imagekit');

    console.log('--- Debugging ImageKit Auth ---');
    console.log('IMAGEKIT_PRIVATE_KEY exists:', !!process.env.IMAGEKIT_PRIVATE_KEY);
    console.log('IMAGEKIT_PRIVATE_KEY length:', process.env.IMAGEKIT_PRIVATE_KEY?.length);
    console.log('NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY:', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'MISSING');
    console.log('NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT:', process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'MISSING');

    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
        console.error('ERROR: IMAGEKIT_PRIVATE_KEY is missing in env');
        return;
    }

    try {
        const authParams = getAuthParams();
        console.log('Auth Params Generated:', authParams);
    } catch (error: any) {
        console.error('Auth Generation Failed:', error);
        console.error('Stack:', error.stack);
    }
}

debugAuth();

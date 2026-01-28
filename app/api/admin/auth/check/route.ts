import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminPassword) {
            return NextResponse.json({ authenticated: false, error: 'Admin not configured' });
        }
        
        if (!token) {
            return NextResponse.json({ authenticated: false });
        }
        
        // Verify token
        try {
            const decoded = Buffer.from(token.value, 'base64').toString('utf8');
            const [password] = decoded.split(':');
            
            if (password === adminPassword) {
                return NextResponse.json({ authenticated: true });
            }
        } catch {
            // Invalid token format
        }
        
        return NextResponse.json({ authenticated: false });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ authenticated: false });
    }
}

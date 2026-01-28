import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminPassword) {
            console.error('ADMIN_PASSWORD not set in environment variables');
            return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
        }
        
        if (password === adminPassword) {
            // Create a simple token (in production, use proper JWT)
            const token = Buffer.from(`${adminPassword}:${Date.now()}`).toString('base64');
            
            const response = NextResponse.json({ success: true });
            
            // Set HTTP-only cookie for 7 days
            response.cookies.set('admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });
            
            return response;
        } else {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}

// Logout
export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_token');
    return response;
}

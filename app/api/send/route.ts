import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { FieldValue, getFirebaseDb } from '@/lib/firebase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);

function subscriberId(email: string) {
    return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Anti-spam Honeypot Check
        if (body.website) {
            // Silently succeed for bots
            return NextResponse.json({ success: true, message: 'Message sent successfully' });
        }

        const { email, firstName, lastName, interest, message, type } = body;

        let subject = '';
        let htmlContent = '';

        if (type === 'newsletter') {
            try {
                await getFirebaseDb().collection('subscribers').doc(subscriberId(email)).set({
                    email,
                    status: 'active',
                    created_at: FieldValue.serverTimestamp(),
                }, { merge: true });
            } catch (error) {
                console.error('Newsletter db error:', error);
            }

            subject = 'New Newsletter Subscription';
            htmlContent = `
            <h2>New Newsletter Subscription</h2>
            <p><strong>Email:</strong> ${email}</p>
        `;
        } else if (type === 'experience') {
            const { name, safari, visitDate, rating, highlights, story } = body;
            subject = `New Guest Experience: ${name} - ${safari}`;
            htmlContent = `
                <h2>New Guest Experience Shared</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Safari:</strong> ${safari}</p>
                <p><strong>Date:</strong> ${visitDate}</p>
                <p><strong>Rating:</strong> ${rating} / 5</p>
                <p><strong>Highlights:</strong> ${highlights}</p>
                <h3>Story:</h3>
                <p>${story}</p>
            `;
        } else {
            const name = `${firstName} ${lastName}`;
            subject = `Safari Inquiry: ${interest || 'General'} from ${name}`;
            htmlContent = `
            <h2>New Safari Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Interest:</strong> ${interest}</p>
            <h3>Message:</h3>
            <p>${message}</p>
        `;
        }

        const data = await resend.emails.send({
            from: 'Safari Kannadiga <hello@safarikannadiga.com>',
            to: ['Safarikannadiga@gmail.com'],
            subject: subject,
            html: htmlContent,
            replyTo: email,
        });

        // Send confirmation email to the user for newsletter subscriptions
        if (type === 'newsletter') {
            await resend.emails.send({
                from: 'Safari Kannadiga <hello@safarikannadiga.com>',
                to: [email],
                subject: 'Welcome to Safari Kannadiga Community!',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #c28e00;">Welcome to Safari Kannadiga!</h2>
                        <p>Hello,</p>
                        <p>Thank you for subscribing to our newsletter! We're thrilled to have you join our community of wildlife enthusiasts.</p>
                        <p>You'll be the first to know about:</p>
                        <ul>
                            <li>Upcoming safari tours and expeditions</li>
                            <li>Exclusive wildlife photography tips</li>
                            <li>Stories from the wild</li>
                        </ul>
                        <p>Stay wild,</p>
                        <p><strong>The Safari Kannadiga Team</strong></p>
                    </div>
                `,
            });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

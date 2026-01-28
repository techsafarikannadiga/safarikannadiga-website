import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, firstName, lastName, interest, message, type } = body;

        let subject = '';
        let htmlContent = '';

        if (type === 'newsletter') {
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
            from: 'Safari Kannadiga <onboarding@resend.dev>',
            to: ['samarthv080@Gmail.com'],
            subject: subject,
            html: htmlContent,
            replyTo: email,
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

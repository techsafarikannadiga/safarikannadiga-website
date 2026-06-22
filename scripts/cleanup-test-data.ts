import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getFirebaseDb } from '../lib/firebase-admin';

async function cleanup() {
    console.log('Starting cleanup of test data...');
    const db = getFirebaseDb();

    // 1. Clean up testimonials
    try {
        const testimonialsSnap = await db.collection('testimonials').get();
        let testimonialsDeletedCount = 0;
        for (const doc of testimonialsSnap.docs) {
            const data = doc.data();
            const name = data.name || '';
            const email = data.email || '';
            const story = data.story || '';
            
            // Check for test identifiers
            if (
                doc.id === 'honeypot-bot-submission' ||
                name.toLowerCase().includes('test') ||
                email.toLowerCase().includes('test') ||
                story.toLowerCase().includes('test story')
            ) {
                console.log(`Deleting test testimonial: ID=${doc.id}, Name=${name}, Email=${email}`);
                await doc.ref.delete();
                testimonialsDeletedCount++;
            }
        }
        console.log(`Deleted ${testimonialsDeletedCount} test testimonials.`);
    } catch (err) {
        console.error('Error cleaning up testimonials:', err);
    }

    // 2. Clean up upcoming tours
    try {
        const toursSnap = await db.collection('upcoming_tours').get();
        let toursDeletedCount = 0;
        for (const doc of toursSnap.docs) {
            const data = doc.data();
            const title = data.title || '';
            const slug = data.slug || '';
            
            if (
                doc.id.startsWith('test-') ||
                slug.startsWith('test-') ||
                title.toLowerCase().includes('test')
            ) {
                console.log(`Deleting test tour: ID=${doc.id}, Title=${title}, Slug=${slug}`);
                await doc.ref.delete();
                toursDeletedCount++;
            }
        }
        console.log(`Deleted ${toursDeletedCount} test tours.`);
    } catch (err) {
        console.error('Error cleaning up upcoming tours:', err);
    }

    // 3. Clean up gallery locations
    try {
        const locationsSnap = await db.collection('gallery_locations').get();
        let locationsDeletedCount = 0;
        for (const doc of locationsSnap.docs) {
            const data = doc.data();
            const name = data.name || '';
            const slug = data.slug || '';
            
            if (
                doc.id.startsWith('test-') ||
                slug.startsWith('test-') ||
                name.toLowerCase().includes('test')
            ) {
                console.log(`Deleting test gallery location: ID=${doc.id}, Name=${name}, Slug=${slug}`);
                await doc.ref.delete();
                locationsDeletedCount++;
            }
        }
        console.log(`Deleted ${locationsDeletedCount} test gallery locations.`);
    } catch (err) {
        console.error('Error cleaning up gallery locations:', err);
    }

    console.log('Cleanup finished.');
}

cleanup();

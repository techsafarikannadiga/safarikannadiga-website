import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';

function getPrivateKey(): string {
    return (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
}

function getFirebaseApp() {
    const existingApp = getApps()[0];
    if (existingApp) return existingApp;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Firebase Admin is not configured');
    }

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

export function getFirebaseAdminAuth() {
    return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
    return getFirestore(getFirebaseApp());
}

export { FieldValue, Timestamp };

import {
    initializeApp,
    getApp,
} from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    connectAuthEmulator,
} from 'firebase/auth';

let app: any;
let auth: any;

export function initializeFirebaseClient() {
    const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    if (!config.apiKey) {
        throw new Error('Firebase configuration is missing');
    }

    try {
        app = getApp();
        auth = getAuth(app);
    } catch {
        app = initializeApp(config);
        auth = getAuth(app);

        // Use emulator in development only if explicitly requested via env (disabled by default for live testing)
        if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && typeof window !== 'undefined') {
            try {
                connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            } catch (error) {
                // Emulator already connected or not available
            }
        }
    }

    return { app, auth };
}

export async function signInWithGoogle() {
    const { auth } = initializeFirebaseClient();
    const provider = new GoogleAuthProvider();

    // Request only necessary scopes
    provider.setCustomParameters({
        prompt: 'select_account',
    });

    try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
        return {
            success: true,
            idToken,
            email: result.user.email,
            displayName: result.user.displayName,
        };
    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
            return {
                success: false,
                error: 'Sign-in cancelled',
            };
        }
        return {
            success: false,
            error: error.message || 'Failed to sign in with Google',
        };
    }
}

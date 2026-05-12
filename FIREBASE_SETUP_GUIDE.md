# Firebase Setup Instructions for SafariKannadiga

## ✅ What's Been Done

1. **Firebase CLI Installed** - firebase-tools installed globally
2. **Firebase Account** - You're logged in as samarthv080@gmail.com
3. **Firebase Project Created** - `safarikannadiga-web` project is ready
4. **Firebase Configuration Files** - Added to the project:
   - `.firebaserc` - Project configuration
   - `firestore.rules` - Security rules for Firestore
   - `firestore.indexes.json` - Database indexes
   - `.env.local` - Updated with Firebase placeholders

---

## 🔧 Next Steps (Manual - Firebase Console)

### Step 1: Get Web App Credentials

1. Go to: https://console.firebase.google.com/project/safarikannadiga-web/settings/general
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (if you don't see it, click "Add app" and select Web)
4. Copy these values to `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` → Copy "API Key"
   - `NEXT_PUBLIC_FIREBASE_APP_ID` → Copy "App ID"
   - The domain will be `safarikannadiga-web.firebaseapp.com`

**Example:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=safarikannadiga-web.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=safarikannadiga-web
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxxxxxxxxxx
```

---

### Step 2: Generate Service Account Key

⚠️ **This is a SECRET key - never commit to git!**

1. Go to: https://console.firebase.google.com/project/safarikannadiga-web/settings/serviceaccounts/adminsdk
2. Click the **"Python"** tab (or any tab, they all show the same JSON)
3. Click **"Generate New Private Key"**
4. A JSON file will download - open it with a text editor
5. Extract these three values:

From the JSON file:
```json
{
  "type": "service_account",
  "project_id": "safarikannadiga-web",    // ← FIREBASE_PROJECT_ID
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",  // ← FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xxxxx@safarikannadiga-web.iam.gserviceaccount.com",  // ← FIREBASE_CLIENT_EMAIL
  ...
}
```

Add to `.env.local`:
```env
FIREBASE_PROJECT_ID=safarikannadiga-web
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@safarikannadiga-web.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDa/....\n-----END PRIVATE KEY-----\n"
```

**Important:** Keep the `\n` escape sequences in the FIREBASE_PRIVATE_KEY!

---

### Step 3: Enable Authentication

1. Go to: https://console.firebase.google.com/project/safarikannadiga-web/authentication/providers
2. Click **"Email/Password"**
3. Toggle **"Enable"** and click **"Save"**
4. Go to the **"Users"** tab
5. Click **"Add user"**
6. Create a user with:
   - Email: The value from `ADMIN_LOGIN_EMAIL` in `.env.local` (currently `admin@safarikannadiga.com`)
   - Password: Something strong (you can reset it later)

---

### Step 4: Deploy Firestore Rules & Indexes

Run these commands:

```bash
# Deploy security rules
firebase deploy --only firestore:rules --project=safarikannadiga-web

# Deploy indexes
firebase deploy --only firestore:indexes --project=safarikannadiga-web
```

Expected output:
```
✔ Deployed security rules to cloud.firestore
✔ Deployed firestore indexes to cloud.firestore
```

---

### Step 5: Test the Build

Once your `.env.local` is complete with real credentials:

```bash
npm run build
```

If you get no errors, you're ready to go!

---

## 📋 Completed .env.local Checklist

After following all steps above, your `.env.local` should have:

- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY` - From Firebase Console
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - safarikannadiga-web.firebaseapp.com
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - safarikannadiga-web
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID` - From Firebase Console
- ✅ `FIREBASE_PROJECT_ID` - From service account JSON
- ✅ `FIREBASE_CLIENT_EMAIL` - From service account JSON
- ✅ `FIREBASE_PRIVATE_KEY` - From service account JSON (with \n preserved)
- ✅ `ADMIN_LOGIN_EMAIL` - admin@safarikannadiga.com (or your email)
- ✅ All other existing variables (ImageKit, Supabase, etc.)

---

## 🚀 Quick Reference

| Task | Console URL |
|------|-------------|
| Get Web App Credentials | https://console.firebase.google.com/project/safarikannadiga-web/settings/general |
| Generate Service Account Key | https://console.firebase.google.com/project/safarikannadiga-web/settings/serviceaccounts/adminsdk |
| Enable Authentication | https://console.firebase.google.com/project/safarikannadiga-web/authentication/providers |
| View Firestore Database | https://console.firebase.google.com/project/safarikannadiga-web/firestore |
| Deploy Rules | Run `firebase deploy --only firestore:rules --project=safarikannadiga-web` |

---

## 🐛 Troubleshooting

**"Failed to parse private key" error during build?**
- The `FIREBASE_PRIVATE_KEY` in `.env.local` is invalid
- Make sure it starts with `-----BEGIN PRIVATE KEY-----` (with quotes)
- Make sure it ends with `-----END PRIVATE KEY-----\n"`
- Check that `\n` characters are preserved (not converted to actual newlines)

**"Firebase is not configured" error?**
- Missing or invalid credentials in `.env.local`
- Check all four Firebase env vars are present and correct

**"Authentication failed" when accessing admin?**
- User created in Firebase Console → Authentication → Users?
- Using correct email in login?
- Password correct?

---

## 📚 Additional Resources

- Firebase Web App: https://console.firebase.google.com/project/safarikannadiga-web/overview
- Firebase CLI Docs: https://firebase.google.com/docs/cli
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Service Account Setup: https://firebase.google.com/docs/auth/admin/setup

---

**Questions?** Check the error logs in the terminal or Firebase Console logs section.

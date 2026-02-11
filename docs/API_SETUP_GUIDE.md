# API Setup Guide: Google & Facebook Reviews

This guide explains how to get the necessary API keys to sync your reviews automatically.

---

## 🟢 Part 1: Facebook Integration

You need a **Page ID** and a **Page Access Token**.

### Step 1: Get Your Page ID
**Good news!** Based on your link (`facebook.com/safarikannadiga`), your Page ID can be:

`safarikannadiga`

You can use this text instead of a number for the API.

### Step 2: Get Page Access Token
This still requires the specific Token from Meta.
1.  Go to [Meta for Developers](https://developers.facebook.com/).
2.  **Log in** with your Facebook account and "Get Started" to register as a developer.
3.  **Create an App**:
    *   Select **Business** or **Other** (type).
    *   Give it a name (e.g., "Safari Website").
    *   Connect it to your Business Account (recommended but optional).
4.  **Graph API Explorer**:
    *   Once the app is created, go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
    *   In the "Meta App" dropdown, select your new app.
    *   In "User or Page", select **"Get Page Access Token"**.
    *   A popup will ask for permissions. Grant access to your Safari Kannadiga page.
    *   **Important**: Select the specific page you want to sync.
5.  **Copy the Token**: 
    *   The "Access Token" field will now show a long string.
    *   Copy this string. This is your `FACEBOOK_ACCESS_TOKEN`.

---

## 🔵 Part 2: Google Integration

You need a **Places API Key** and your **Place ID**.

### Step 1: Get Place ID
1.  Go to the [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
2.  Search for "Safari Kannadiga" (or your business name) on the map.
3.  Click the result.
4.  A tooltip will appear: `Place ID: ChIJa147K9HX3DERijnK...`
5.  Copy this ID. This is `NEXT_PUBLIC_GOOGLE_PLACE_ID`.

### Step 2: Get API Key
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create a New Project** (e.g., "Safari Reviews").
3.  **Enable API**:
    *   Click the "Hamburger menu" -> **APIs & Services** -> **Library**.
    *   Search for **"Places API (New)"** or **"Places API"**.
    *   Click **Enable**.
4.  **Create Credentials**:
    *   Go to **APIs & Services** -> **Credentials**.
    *   Click **+ Create Credentials** -> **API Key**.
5.  **Copy the Key**:
    *   Your API key will appear (starts with `AIza...`).
    *   Copy it. This is `GOOGLE_PLACES_API_KEY`.
6.  *(Optional but recommended)* **Restrict Key**:
    *   Click "Restrict Key".
    *   Under "API Restrictions", select only **Places API**.
    *   Save.

---

## 📝 Where to Paste These?

Open your `.env.local` file (or Vercel Settings) and add:

```env
# Facebook
FACEBOOK_PAGE_ID=safarikannadiga
FACEBOOK_ACCESS_TOKEN=EAAB... (Paste your token here)

# Google
GOOGLE_PLACES_API_KEY=AIza... (Paste your key here)
NEXT_PUBLIC_GOOGLE_PLACE_ID=ChIJ... (Search "Safari Kannadiga" on Place ID Finder)
```

Once saved, restart your server (`npm run dev`) and click "Sync API" in the admin panel!

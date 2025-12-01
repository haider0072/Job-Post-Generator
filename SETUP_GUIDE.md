# JobCraft AI - Complete Setup Guide

Is guide mein aapko step-by-step bataya jayega kaise Google OAuth aur Gemini API ke saath app setup karein.

## Prerequisites

- Node.js (v18 ya usse upar) installed hona chahiye
- Google account
- Basic understanding of terminal/command line

## Step 1: Google Cloud Console Setup

### 1.1 Project Banaye

1. [Google Cloud Console](https://console.cloud.google.com/) pe jaye
2. Top bar mein "Select a project" pe click karein
3. "New Project" pe click karein
4. Project ka naam dein (e.g., "JobCraft AI")
5. "Create" pe click karein

### 1.2 Generative Language API Enable Karein

1. Left sidebar mein "APIs & Services" > "Library" pe jaye
2. Search bar mein "Generative Language API" type karein
3. Result pe click karein
4. "Enable" button pe click karein
5. Wait karein jab tak API enable na ho jaye

### 1.3 OAuth 2.0 Credentials Banaye

1. Left sidebar mein "APIs & Services" > "Credentials" pe jaye
2. Top pe "Create Credentials" button pe click karein
3. "OAuth client ID" select karein
4. Agar pehli baar hai to "Configure Consent Screen" pe click karein:
   - User Type: **External** select karein
   - "Create" pe click karein
   - Required fields fill karein (App name, User support email)
   - "Save and Continue" pe click karte rahe
   - Scopes step pe:
     - "Add or Remove Scopes" pe click karein
     - In scopes ko add karein:
       - `https://www.googleapis.com/auth/generative-language`
       - `https://www.googleapis.com/auth/userinfo.email`
     - "Update" pe click karein
   - Test users add karein (apna email address)
   - "Save and Continue" pe click karein

5. Wapas "Credentials" page pe jaye
6. "Create Credentials" > "OAuth client ID" pe click karein
7. Application type: **Web application** select karein
8. Name dein (e.g., "JobCraft AI Web Client")
9. "Authorized JavaScript origins" mein add karein:
   - `http://localhost:3000`
10. "Authorized redirect URIs" mein add karein:
    - `http://localhost:3000`
11. "Create" pe click karein
12. **IMPORTANT**: Client ID ko copy kar ke safe jagah save kar lein

## Step 2: Project Setup

### 2.1 Dependencies Install Karein

Terminal open karein aur project directory mein jaye:

```bash
cd /path/to/Job-Post-Generator
npm install
```

### 2.2 Environment Variables Configure Karein

1. `.env.example` file ko copy karein:
   ```bash
   cp .env.example .env.local
   ```

2. `.env.local` file ko text editor mein open karein

3. Apni Google Client ID add karein:
   ```env
   VITE_GOOGLE_CLIENT_ID=aapki-client-id-yaha.apps.googleusercontent.com
   VITE_API_BASE_URL=http://localhost:3001
   PORT=3001
   CLIENT_URL=http://localhost:3000
   ```

4. File save karein

## Step 3: Application Run Karein

### Option A: Frontend aur Backend Dono Ek Saath

```bash
npm run dev:all
```

### Option B: Frontend aur Backend Alag Alag

Terminal 1 - Backend Server:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## Step 4: Application Test Karein

1. Browser mein `http://localhost:3000` open karein

2. Aapko login screen dikhai degi with "Sign in with Google" button

3. "Sign in with Google" pe click karein

4. Google account select karein

5. Permissions allow karein:
   - Gemini API access
   - Email address access

6. Success! Ab aap job posts generate kar sakte hain

## Step 5: Job Post Generate Karein

1. Left panel mein job requirement type karein, for example:
   ```
   Hiring a Senior React Developer with 5 years experience,
   remote position, $120k-150k salary
   ```

2. Enter press karein ya "Generate Job Post" pe click karein

3. Right panel mein AI-generated job post dikhega

4. "Copy to Clipboard" button se copy kar sakte hain

## Troubleshooting

### Problem: "Google Client ID is not configured"
**Solution**:
- `.env.local` file check karein
- `VITE_GOOGLE_CLIENT_ID` correctly set hai ya nahi
- Dev server restart karein

### Problem: "Invalid access token" error
**Solution**:
- Logout karein aur phir se login karein
- Google Cloud Console mein check karein Generative Language API enabled hai
- OAuth Consent Screen mein correct scopes add hain

### Problem: Backend connection failed
**Solution**:
- Check karein backend server chal raha hai (port 3001)
- `.env.local` mein `VITE_API_BASE_URL` correct hai
- Browser console mein errors check karein

### Problem: "Access blocked" during Google Sign-in
**Solution**:
- OAuth Consent Screen publish karein ya
- Apne email ko "Test users" mein add karein

## Security Best Practices

1. **Never commit `.env.local`**: Ye file `.gitignore` mein hai, committed na ho
2. **Client ID Public Hai**: OAuth Client ID public ho sakti hai, secret nahi hai
3. **API Quota**: Har user apni API quota use karta hai
4. **Token Storage**: Access tokens localStorage mein hain, XSS se bachne ke liye secure coding follow karein

## Next Steps

- Production deployment ke liye:
  - Backend ko proper server pe deploy karein (e.g., Railway, Render, Heroku)
  - OAuth credentials mein production URLs add karein
  - Environment variables production mein set karein
  - HTTPS use karein

## Support

Agar koi problem aa rahi hai to:
1. README.md mein Troubleshooting section dekhen
2. Browser console mein errors check karein
3. Backend server logs check karein
4. Google Cloud Console mein API quotas check karein

---

**Happy Job Posting!** 🚀

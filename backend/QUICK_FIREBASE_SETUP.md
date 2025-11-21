# Quick Firebase Admin SDK Setup

## 🚀 Fast Setup (5 minutes)

### Step 1: Get Your Service Account Key

1. Go to: https://console.firebase.google.com/project/digidiploma-f106d/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Click **"Generate key"** in the popup
4. A JSON file will download (e.g., `digidiploma-f106d-firebase-adminsdk-xxxxx.json`)

### Step 2: Place the File

1. Copy the downloaded JSON file to the `backend` folder
2. Rename it to: `service-account-key.json` (optional, but easier)

### Step 3: Create `.env` File

Create a file named `.env` in the `backend` folder with this content:

```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
FIREBASE_PROJECT_ID=digidiploma-f106d
```

**Important:** Replace `service-account-key.json` with your actual filename if you didn't rename it.

### Step 4: Restart Your Backend

1. Stop your backend server (Ctrl+C)
2. Start it again: `npm start` or `node server.js`
3. Look for this message in the console: `Firebase Admin initialized (ADC)`

### Step 5: Test It!

1. Go to Admin Dashboard → Subjects
2. Click "Import K-Scheme"
3. Paste your subjects JSON
4. Click "Import Subjects"

If you see "Import Successful", you're all set! ✅

---

## 🔧 Alternative: Using Environment Variables

If you prefer using environment variables instead of a JSON file:

### Step 1: Get Service Account Details

1. Download the service account JSON (same as above)
2. Open the JSON file
3. Copy these values:

### Step 2: Update `.env` File

Replace the content of `backend/.env` with:

```env
FIREBASE_PROJECT_ID=digidiploma-f106d
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-ACTUAL-PRIVATE-KEY-HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@digidiploma-f106d.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id-from-json
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40digidiploma-f106d.iam.gserviceaccount.com
```

**Important:**
- Keep the `\n` characters in FIREBASE_PRIVATE_KEY
- Wrap the private key in double quotes
- Replace all `xxxxx` and placeholder values with actual values from your JSON

---

## ❌ Troubleshooting

### "Firebase is not initialized" Error

**Check:**
1. Is `.env` file in the `backend` folder? ✅
2. Did you restart the server after creating `.env`? ✅
3. Is the JSON file path correct in `.env`? ✅
4. Check backend console for error messages

### "Cannot read properties of undefined"

**Solution:** Firebase isn't initialized. Follow the setup steps above.

### "Permission denied"

**Solution:**
1. Go to Firebase Console → Firestore Database
2. Make sure your service account has write permissions
3. Check Firestore Rules allow writes

---

## 📝 Example `.env` File

**Method 1 (JSON file):**
```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
FIREBASE_PROJECT_ID=digidiploma-f106d
```

**Method 2 (Environment variables):**
```env
FIREBASE_PROJECT_ID=digidiploma-f106d
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@digidiploma-f106d.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

---

## 🔒 Security Note

**Never commit these files to Git:**
- `backend/.env`
- `backend/*-firebase-adminsdk-*.json`
- `backend/service-account-key.json`

Make sure they're in `.gitignore`!

---

## ✅ Success Checklist

- [ ] Downloaded service account key from Firebase Console
- [ ] Placed JSON file in `backend` folder
- [ ] Created `backend/.env` file
- [ ] Added correct path to `.env`
- [ ] Restarted backend server
- [ ] Saw "Firebase Admin initialized" in console
- [ ] Tested bulk import feature

---

**Need help?** Check the full guide in `FIREBASE_SETUP.md`


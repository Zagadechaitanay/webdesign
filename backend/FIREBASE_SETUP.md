# Firebase Setup Guide

This guide will help you set up Firebase for your college management system.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "college-management-system")
4. Follow the setup wizard

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location for your database

## 3. Generate Service Account Key

1. Go to Project Settings (gear icon) → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `firebase-service-account.json` and place it in the `backend` folder

## 4. Get Firebase Configuration

1. Go to Project Settings → General
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app
4. Register your app and copy the config object

## 5. Environment Variables

Create a `.env` file in the `backend` folder with the following variables:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-client-email%40your-project-id.iam.gserviceaccount.com

# Firebase Client Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

## 6. Run Migration

After setting up Firebase, run the migration script to transfer your existing data:

```bash
cd backend
node migrate-to-firebase.js
```

## 7. Start the Server

```bash
npm start
```

## Collections Structure

The migration will create the following Firestore collections:

- `users` - User accounts and profiles
- `subjects` - Course subjects and curriculum
- `notices` - College notices and announcements
- `materials` - Study materials and resources
- `projects` - Student projects
- `system` - System configuration and maintenance settings

## Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read access for subjects, notices, materials
    match /subjects/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /notices/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /materials/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Admin only access for system settings
    match /system/{document} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Troubleshooting

1. **Permission denied errors**: Check your service account permissions
2. **Connection issues**: Verify your project ID and credentials
3. **Migration errors**: Check the console logs for specific error messages

## Benefits of Firebase

- **Real-time updates**: Automatic synchronization across clients
- **Scalability**: Handles large amounts of data efficiently
- **Security**: Built-in authentication and authorization
- **Offline support**: Works even when internet is slow
- **Easy integration**: Simple APIs for web and mobile apps

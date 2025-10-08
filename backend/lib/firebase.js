import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../firebase-config.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load backend/.env before reading env vars (important when this file is imported first)
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.join(__dirname, '..', '.env');
  dotenv.config({ path: envPath, override: false });
} catch {}

// Initialize Firebase Admin SDK
let adminApp;
let db;
let isFirebaseReady = false;

async function initializeFirebase() {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length === 0) {
      // Try to initialize with service account if available
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };

        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });

        db = admin.firestore();
        console.log('Firebase Admin initialized with service account');
        isFirebaseReady = true;
      } else {
        // Try Application Default Credentials ONLY if explicitly configured and file exists
        const adcPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (adcPath && fs.existsSync(adcPath)) {
          try {
            adminApp = admin.initializeApp({
              credential: admin.credential.applicationDefault(),
              projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId
            });
            db = admin.firestore();
            
            // Test Firebase connectivity
            try {
              await db.collection('_conn_test').doc('_ping').get();
              isFirebaseReady = true;
              console.log('Firebase Admin initialized (ADC)');
            } catch (testError) {
              isFirebaseReady = false;
              console.log('Firebase ADC connectivity failed; falling back to local store');
            }
          } catch {
            isFirebaseReady = false;
            console.log('Firebase ADC init failed; falling back to local store');
          }
        } else {
          isFirebaseReady = false;
          // Quiet fallback without noisy stack traces
          console.log('Firebase service account not configured; using local JSON store');
        }
      }
    } else {
      adminApp = admin.app();
      db = admin.firestore();
      isFirebaseReady = true;
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.log('Falling back to JSON database for now...');
    isFirebaseReady = false;
  }
}

// Initialize Firebase
initializeFirebase();

// Initialize Firebase Client SDK (for frontend-like usage on server if needed)
const clientFirebaseConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId
};

let clientApp;
let clientDb;

try {
  clientApp = initializeApp(clientFirebaseConfig);
  clientDb = getFirestore(clientApp);
  console.log('Firebase Client initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Client:', error);
}

export { admin, db, clientApp, clientDb };
export { isFirebaseReady };
export default { admin, db, clientApp, clientDb, isFirebaseReady };

import { db, isFirebaseReady } from './lib/firebase.js';
import FirebaseUser from './models/FirebaseUser.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const backendEnvPath = path.join(__dirname, '.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath, override: true });
}

// Wait for Firebase
await new Promise(resolve => setTimeout(resolve, 3000));

console.log('\n🔐 Testing Login Functionality\n');
console.log('═══════════════════════════════════════');

if (!isFirebaseReady || !db) {
  console.log('❌ Firebase is not ready');
  process.exit(1);
}

try {
  // Test 1: Check if users exist
  console.log('\n1️⃣ Checking users in Firebase...');
  const allUsersSnapshot = await db.collection('users').limit(10).get();
  console.log(`   Found ${allUsersSnapshot.size} users (showing first 10)`);
  
  if (allUsersSnapshot.size > 0) {
    console.log('\n   Sample users:');
    allUsersSnapshot.forEach((doc, index) => {
      if (index < 5) {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.email || 'NO EMAIL'} / ${data.studentId || 'NO STUDENT ID'} (${data.userType || 'NO TYPE'})`);
      }
    });
  }
  
  // Test 2: Test findOne with email
  console.log('\n2️⃣ Testing FirebaseUser.findOne with email...');
  const testEmail = allUsersSnapshot.docs[0]?.data()?.email;
  if (testEmail) {
    console.log(`   Searching for email: ${testEmail}`);
    const userByEmail = await FirebaseUser.findOne({ $or: [{ email: testEmail }, { studentId: testEmail }] });
    if (userByEmail) {
      console.log(`   ✅ Found user: ${userByEmail.email} (ID: ${userByEmail.id})`);
    } else {
      console.log(`   ❌ User not found`);
    }
  } else {
    console.log('   ⚠️  No users found to test with');
  }
  
  // Test 3: Test findOne with studentId
  console.log('\n3️⃣ Testing FirebaseUser.findOne with studentId...');
  const testStudentId = allUsersSnapshot.docs[0]?.data()?.studentId;
  if (testStudentId) {
    console.log(`   Searching for studentId: ${testStudentId}`);
    const userByStudentId = await FirebaseUser.findOne({ $or: [{ email: testStudentId }, { studentId: testStudentId }] });
    if (userByStudentId) {
      console.log(`   ✅ Found user: ${userByStudentId.studentId} (ID: ${userByStudentId.id})`);
    } else {
      console.log(`   ❌ User not found`);
    }
  } else {
    console.log('   ⚠️  No student IDs found to test with');
  }
  
  console.log('\n═══════════════════════════════════════\n');
  console.log('💡 To test login, try logging in with:');
  if (allUsersSnapshot.size > 0) {
    const firstUser = allUsersSnapshot.docs[0].data();
    console.log(`   Email: ${firstUser.email || 'N/A'}`);
    console.log(`   Student ID: ${firstUser.studentId || 'N/A'}`);
  }
  console.log('\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

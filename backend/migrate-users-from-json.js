import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Minimal User model
import User from './models/User.js';

async function run() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_management_db';
  await mongoose.connect(MONGO_URI);
  console.log('Mongo connected:', MONGO_URI);

  const jsonPath = path.join(__dirname, 'database', 'users.json');
  let users = [];
  try {
    const raw = await fs.readFile(jsonPath, 'utf8');
    users = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read users.json:', e.message);
    process.exit(1);
  }

  let created = 0, updated = 0, skipped = 0;
  for (const u of users) {
    try {
      const existing = await User.findOne({ $or: [{ email: u.email }, { studentId: u.studentId }] });
      if (existing) {
        // Ensure fields are up to date (do not overwrite password unless hashing pattern differs)
        const update = {
          name: u.name,
          college: u.college || existing.college,
          branch: u.branch || existing.branch,
          semester: u.semester || existing.semester,
          userType: u.userType || existing.userType,
        };
        await User.updateOne({ _id: existing._id }, { $set: update });
        updated++;
        continue;
      }
      // Keep password hash if it looks like bcrypt, else hash as plaintext
      let password = u.password;
      const isBcrypt = typeof password === 'string' && password.startsWith('$2');
      if (!isBcrypt) {
        password = await bcrypt.hash(password || 'password123', 10);
      }
      await User.create({
        name: u.name,
        email: u.email,
        password,
        college: u.college || '',
        studentId: u.studentId || '',
        branch: u.branch || '',
        semester: u.semester || '',
        userType: u.userType || 'student',
        createdAt: u.createdAt || new Date().toISOString()
      });
      created++;
    } catch (e) {
      console.error('Skip user', u.email, e.message);
      skipped++;
    }
  }

  console.log(`Done. created=${created}, updated=${updated}, skipped=${skipped}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});



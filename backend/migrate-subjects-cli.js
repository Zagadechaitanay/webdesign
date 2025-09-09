import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Subject from './models/Subject.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

async function main() {
  const args = process.argv.slice(2);
  const fileArgIdx = args.findIndex(a => a === '--file');
  if (fileArgIdx === -1 || !args[fileArgIdx + 1]) {
    console.error('Usage: node migrate-subjects-cli.js --file subjects.json');
    process.exit(1);
  }
  const filePath = path.isAbsolute(args[fileArgIdx + 1])
    ? args[fileArgIdx + 1]
    : path.join(process.cwd(), args[fileArgIdx + 1]);

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/college_management_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) throw new Error('Input must be an array of subjects');

    let imported = 0; let skipped = 0;
    for (const s of list) {
      const { name, code, branch, semester } = s;
      if (!name || !code || !branch || !semester) { skipped++; continue; }
      const exists = await Subject.findOne({ code });
      if (exists) { skipped++; continue; }
      await Subject.create({
        name,
        code,
        branch,
        semester: parseInt(semester),
        credits: s.credits || 4,
        hours: s.hours || 60,
        type: s.type || 'Theory',
        description: s.description || ''
      });
      imported++;
    }
    console.log(`Imported: ${imported}, Skipped: ${skipped}`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();



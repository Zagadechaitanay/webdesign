import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.join(__dirname, '..', 'database');
const stateFile = path.join(dbDir, 'system.json');

let cached = { maintenance: false };
let listeners = new Set();

async function ensureDir() {
  try { await fs.access(dbDir); } catch { await fs.mkdir(dbDir, { recursive: true }); }
}

export async function loadState() {
  try {
    const raw = await fs.readFile(stateFile, 'utf8');
    cached = JSON.parse(raw);
  } catch {
    cached = { maintenance: false };
  }
  return cached;
}

export function getMaintenance() {
  return cached.maintenance === true;
}

export async function setMaintenance(enabled) {
  cached.maintenance = !!enabled;
  await ensureDir();
  await fs.writeFile(stateFile, JSON.stringify(cached, null, 2));
  for (const cb of listeners) {
    try { cb(cached); } catch {}
  }
  return cached;
}

export function onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); }

// Load once on import
await loadState();



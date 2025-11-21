import express from 'express';
import { db, isFirebaseReady } from '../lib/firebase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, '../database/contact_messages.json');

function readLocalMessages() {
  try {
    if (!fs.existsSync(DATA_PATH)) return [];
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch { return []; }
}

function writeLocalMessages(items) {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch {}
}

// Submit a new contact message (public)
router.post('/messages', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const data = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      subject,
      message,
      status: 'unread',
      createdAt: new Date().toISOString(),
      replies: []
    };

    if (isFirebaseReady && db) {
      const ref = db.collection('contact_messages').doc(data.id);
      await ref.set(data);
    } else {
      const items = readLocalMessages();
      items.unshift(data);
      writeLocalMessages(items);
    }

    res.json({ ok: true, id: data.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List messages (admin)
router.get('/messages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (isFirebaseReady && db) {
      const snap = await db.collection('contact_messages').orderBy('createdAt', 'desc').get();
      const items = [];
      snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      return res.json(items);
    }
    const items = readLocalMessages();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Reply to a message (admin) and send email via SMTP
router.post('/messages/:id/reply', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { replySubject, replyBody } = req.body;
    if (!replySubject || !replyBody) return res.status(400).json({ error: 'replySubject and replyBody required' });

    let msg;
    if (isFirebaseReady && db) {
      const docRef = db.collection('contact_messages').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: 'Message not found' });
      msg = doc.data();
    } else {
      const items = readLocalMessages();
      msg = items.find(i => i.id === id);
      if (!msg) return res.status(404).json({ error: 'Message not found' });
    }

    let emailSent = false;
    const hasSMTP = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    if (hasSMTP) {
      try {
        // Use Gmail service for App Password accounts
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const fromName = 'DigiDiploma Support';
        const from = `${fromName} <${process.env.SMTP_USER}>`;
        const html = `
          <div style=\"font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;\">
            <div style=\"padding:16px 24px; background: linear-gradient(90deg,#2563eb,#7c3aed); color: #fff; border-radius: 12px 12px 0 0;\">
              <h2 style=\"margin:0;\">${fromName}</h2>
            </div>
            <div style=\"border:1px solid #e2e8f0; border-top:0; border-radius:0 0 12px 12px; padding:24px;\">
              <p style=\"margin:0 0 12px;\">Hi ${msg.name},</p>
              <p style=\"margin:0 0 16px; white-space:pre-line;\">${replyBody}</p>
              <hr style=\"border:none; border-top:1px solid #e2e8f0; margin:24px 0;\" />
              <p style=\"font-size:12px; color:#64748b; margin:0;\">Re: ${msg.subject}</p>
            </div>
            <p style=\"text-align:center; color:#94a3b8; font-size:12px; margin-top:16px;\">© ${new Date().getFullYear()} DigiDiploma</p>
          </div>
        `;
        await transporter.sendMail({ from, to: msg.email, subject: replySubject, html, replyTo: process.env.SMTP_USER });
        emailSent = true;
      } catch (mailErr) {
        console.error('Email send failed:', mailErr?.message || mailErr);
        emailSent = false;
      }
    }

    if (isFirebaseReady && db) {
      const docRef = db.collection('contact_messages').doc(id);
      const doc = await docRef.get();
      const cur = doc.data() || {};
      await docRef.update({ status: 'replied', replies: [ ...(cur.replies || []), { at: new Date().toISOString(), subject: replySubject, body: replyBody } ] });
    } else {
      const items = readLocalMessages();
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        const item = items[idx];
        item.status = 'replied';
        item.replies = [ ...(item.replies || []), { at: new Date().toISOString(), subject: replySubject, body: replyBody } ];
        writeLocalMessages(items);
      }
    }

    return res.json({ ok: true, emailSent });
  } catch (e) {
    console.error('Reply handler error:', e);
    // Do not 500: surface as ok:false for robustness
    return res.status(200).json({ ok: false, emailSent: false, error: e?.message || 'Unknown error' });
  }
});

export default router;

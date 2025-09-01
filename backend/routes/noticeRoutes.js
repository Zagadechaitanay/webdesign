import express from 'express';
const router = express.Router();

// Simple in-memory notices for now; replace with DB later if needed
const seedNotices = [
  { id: 'n1', title: 'Welcome', message: 'Welcome to DigiDiploma!', date: new Date().toISOString() },
  { id: 'n2', title: 'Exam Schedule', message: 'Midterm exams start next month.', date: new Date().toISOString() },
  { id: 'n3', title: 'Holiday', message: 'College will be closed on Friday.', date: new Date().toISOString() },
];

router.get('/notices', async (_req, res) => {
  try {
    res.status(200).json(seedNotices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

export default router;



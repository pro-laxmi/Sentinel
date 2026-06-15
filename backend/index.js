// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js'; // <-- 1. Import the new routes

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Public Routes (No lock needed)
app.use('/api/auth', authRoutes);

// Protected Routes (The lock is applied inside this file)
app.use('/api/incidents', incidentRoutes); // <-- 2. Mount the routes

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Sentinel Backend is alive.' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`[SENTINEL CORE] Server running on http://localhost:${PORT}`);
});
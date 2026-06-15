import express from 'express';
import { getActiveIncidents } from '../controllers/incidentController.js';
import { verifyClearance } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/incidents/active
router.get('/active', verifyClearance, getActiveIncidents);

export default router;
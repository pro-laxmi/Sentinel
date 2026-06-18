import express from 'express';
import { getActiveIncidents, escalateAlertToIncident } from '../controllers/incidentController.js';
import { verifyClearance, verifyCommander } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyClearance, getActiveIncidents); // Changed to / for GET /api/incidents
router.get('/active', verifyClearance, getActiveIncidents);
router.post('/escalate', verifyClearance, verifyCommander, escalateAlertToIncident);

export default router;
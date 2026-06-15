import express from 'express';
import { getAlerts, getOpenAlerts, getAlertsById, changeAlertStatus } from '../controllers/alertController.js';
import { verifyClearance } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyClearance, getAlerts);
router.get('/active', verifyClearance, getOpenAlerts);
router.get('/:id', verifyClearance, getAlertsById);
router.put('/:id/status', verifyClearance, changeAlertStatus);

export default router;
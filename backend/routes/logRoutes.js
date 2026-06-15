import express from 'express';
import { getLogs, createLog, getLogsByServiceId } from '../controllers/logController.js';
import { verifyClearance } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyClearance, getLogs);
router.post('/', createLog);
router.get('/service/:serviceId', verifyClearance, getLogsByServiceId);

export default router;
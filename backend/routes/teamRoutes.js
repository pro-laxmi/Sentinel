import express from 'express';
import { getAllTeams } from '../controllers/teamController.js';
import { verifyClearance } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyClearance, getAllTeams);

export default router;

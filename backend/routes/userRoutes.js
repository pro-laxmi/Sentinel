import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { verifyClearance } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', verifyClearance, getUserProfile);
router.put('/profile', verifyClearance, updateUserProfile);

export default router;

import express from 'express';
import { verifyClearance } from '../middleware/authMiddleware.js';
import { initiateGitHubAuth, githubCallback } from '../controllers/githubAuthController.js';

const router = express.Router();

router.get('/auth', verifyClearance,  initiateGitHubAuth);
router.get('/callback', githubCallback);

export default router;
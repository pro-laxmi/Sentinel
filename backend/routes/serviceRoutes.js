import express from 'express';
import { getServices, getActiveServices, createService, updateService, deleteService } from '../controllers/serviceControllers.js';
import { verifyClearance, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyClearance, getServices);
router.get('/active', verifyClearance, getActiveServices);
router.post('/', verifyClearance, checkRole('ADMIN'),  createService);
router.put('/:id', verifyClearance, checkRole('ADMIN'), updateService);
router.delete('/:id', verifyClearance, checkRole('ADMIN'), deleteService);

export default router;
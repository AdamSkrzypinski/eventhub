import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', EventController.getAll);
router.get('/:id', EventController.getById);

router.post('/', authenticateToken, requireRole('ADMIN'), EventController.create);
router.put('/:id', authenticateToken, requireRole('ADMIN'), EventController.update);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), EventController.delete);

export default router;
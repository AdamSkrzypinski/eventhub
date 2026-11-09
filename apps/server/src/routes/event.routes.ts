import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';

const router = Router();

router.get('/', EventController.getAll);
router.get('/:id', EventController.getById);
router.post('/', EventController.create);
router.put('/:id', EventController.update);
router.delete('/:id', EventController.delete);

export default router;
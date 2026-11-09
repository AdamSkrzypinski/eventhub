import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', ReservationController.create);
router.get('/my', ReservationController.getMyReservations);
router.delete('/:id', ReservationController.cancel);

export default router;
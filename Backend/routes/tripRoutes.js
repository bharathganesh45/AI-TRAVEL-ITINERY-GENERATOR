import { Router } from 'express';
import { createTrip, getTrips, getTripById, updateTrip, deleteTrip, getTripBookings } from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, createTrip);
router.get('/', protect, getTrips);
router.get('/:id', protect, getTripById);
router.get('/:id/bookings', protect, getTripBookings);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);

export default router;

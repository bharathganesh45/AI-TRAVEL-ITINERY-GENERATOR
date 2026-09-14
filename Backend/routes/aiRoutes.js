import { Router } from 'express';
import { generateItinerary, getItineraryByTrip, regenerateItinerary } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', protect, generateItinerary);
router.get('/:tripId', protect, getItineraryByTrip);
router.put('/:tripId', protect, regenerateItinerary);

export default router;

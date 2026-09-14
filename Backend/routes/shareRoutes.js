import { Router } from 'express';
import { createShareLink, getSharedTrip, listShareLinks, deactivateShareLink, refreshShareLink } from '../controllers/shareController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/:tripId', protect, createShareLink);
router.get('/list/:tripId', protect, listShareLinks);
router.put('/:token/deactivate', protect, deactivateShareLink);
router.post('/:token/refresh', protect, refreshShareLink);
router.get('/:token', getSharedTrip);

export default router;

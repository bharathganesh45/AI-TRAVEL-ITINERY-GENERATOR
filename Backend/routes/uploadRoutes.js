import { Router } from 'express';
import { uploadDocument, getDocument, deleteDocument } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/', protect, uploadMiddleware, uploadDocument);
router.get('/:id', protect, getDocument);
router.delete('/:id', protect, deleteDocument);

export default router;

import upload from '../config/multer.js';

export const uploadMiddleware = upload.single('file');

export default uploadMiddleware;

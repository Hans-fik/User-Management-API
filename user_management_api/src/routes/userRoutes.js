import express from 'express';
import { getUsers, updateProfile, deleteProfile, uploadAvatar } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', verifyToken, getUsers);
router.put('/me', verifyToken, updateProfile);
router.delete('/me', verifyToken, deleteProfile);
router.post('/avatar', verifyToken, upload.single('file'), uploadAvatar);

export default router;
import express from 'express';
import { signup, login, logout, getMe, updateMe, updateMyRoleProfile, extensionLogin, getChatUsers } from './user.controller.js';
import { protect } from '../../core/middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/logout', protect, logout);

// Extension auth
router.post('/users/extension-login', extensionLogin);

// User profile routes
router.get('/me/profile', protect, getMe);
router.put('/me/profile', protect, updateMe);
router.put('/me/profile/role', protect, updateMyRoleProfile);

// Chat users route
router.get('/users/chat', protect, getChatUsers);

export default router;

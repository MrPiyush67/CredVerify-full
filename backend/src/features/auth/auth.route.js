import express from 'express';
import {
  getMe,
  login,
  logout,
  signup,
} from './auth.controller.js';
import { protect } from '#src/middleware/auth.js';

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', protect, getMe);

export default authRouter;

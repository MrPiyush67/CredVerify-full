import express from 'express';
import { getMe, getUser, getUsers } from './user.controller.js';

const userRouter = express.Router();

userRouter.get('/me', getMe);
userRouter.get('/users', getUsers);
userRouter.get('/:username', getUser);

export default userRouter;

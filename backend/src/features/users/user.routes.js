import express from 'express';
import { getUser, getUsers } from './user.controller.js';

const userRouter = express.Router();

userRouter.get('/users', getUsers);
userRouter.get('/:username', getUser);

export default userRouter;

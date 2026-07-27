import express from 'express';
import { getAllOrgs } from './org.controller.js';

const organizationRouter = express.Router();

organizationRouter.get('/allOrgs', getAllOrgs);

export default organizationRouter;

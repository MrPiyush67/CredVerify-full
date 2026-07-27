import express from 'express';
import { isLearner } from '#src/middleware/roleGuard.js';
import { getCredentials } from './credential.controllers.js';

const credentialRouter = express.Router();



// learner routes
// credentialRouter.post('/addCredential', isLearner, addCredential);
credentialRouter.get('/getCredentials', getCredentials);
// credentialRouter.get('/:id', getCredentialbyId);
// credentialRouter.patch('/:id',isLearner, )
// credentialRouter.delete('/:id',isLearner, )

export default credentialRouter;

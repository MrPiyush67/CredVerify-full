import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { isCredentialist, isValidant } from '../../core/middleware/roleGuard.js';
import {
  uploadCredential,
  getMyCredentials,
  getCredentialById,
  updateCredential,
  deleteCredential,
  requestVerification,
  getVerifiedCredentials,
  getCredentialStats,
  getPublicCredentials,
  getPendingCredentials,
  verifyCredential,
  rejectCredential,
  createCredentialFromExtension,
} from './credential.controller.js';

const router = express.Router();

// Public routes
router.get('/credentials/public', getPublicCredentials);

// Extension routes (requires auth but not role-specific)
router.post('/credentials/from-extension', protect, createCredentialFromExtension);

// Validant routes (specific routes first)
router.get('/credentials/pending', protect, isValidant, getPendingCredentials);

// Credentialist routes (specific routes before parameterized)
router.post('/credentials', protect, isCredentialist, uploadCredential);
router.get('/credentials/verified', protect, isCredentialist, getVerifiedCredentials);
router.get('/credentials/stats', protect, isCredentialist, getCredentialStats);
router.get('/credentials', protect, isCredentialist, getMyCredentials);
router.get('/credentials/:id', protect, getCredentialById);
router.patch('/credentials/:id', protect, isCredentialist, updateCredential);
router.delete('/credentials/:id', protect, isCredentialist, deleteCredential);
router.post(
  '/credentials/:id/request-verification',
  protect,
  isCredentialist,
  requestVerification
);

// More validant routes
router.post('/credentials/:id/verify', protect, isValidant, verifyCredential);
router.post('/credentials/:id/reject', protect, isValidant, rejectCredential);

export default router;

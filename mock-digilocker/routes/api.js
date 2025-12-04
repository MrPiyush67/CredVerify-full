import express from 'express';
import { getUserById } from '../data/users.js';
import { getDocumentsByUserId, getDocumentByUri } from '../data/documents.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// User info endpoint
router.get('/user_info', requireAuth, (req, res) => {
  const user = getUserById(req.userId);

  if (!user) {
    return res.status(404).json({ error: 'user_not_found' });
  }
  res.json({
    sub: user.userId,
    name: user.name,
    email: user.email,
    dob: user.dob,
    aadhaar: user.aadhaar
  });
});

// Files/Documents endpoint
router.get('/files', requireAuth, (req, res) => {
  const documents = getDocumentsByUserId(req.userId);

  res.json({
    files: documents,
    count: documents.length
  });
});

// Download document endpoint
router.post('/files/download', requireAuth, (req, res) => {
  const { uri } = req.body;

  const doc = getDocumentByUri(req.userId, uri);

  if (!doc) {
    return res.status(404).json({
      error: 'document_not_found',
      error_description: 'The requested document was not found'
    });
  }

  // Generate fake PDF content (in real scenario, this would be actual PDF bytes)
  const fakePdfContent = `Mock PDF Content for: ${doc.name}\nIssuer: ${doc.issuer}\nDate: ${doc.date}`;
  const base64Content = Buffer.from(fakePdfContent).toString('base64');

  res.json({
    uri: doc.uri,
    mimeType: 'application/pdf',
    fileContentBase64: base64Content,
    filename: `${doc.name.replace(/[^a-z0-9]/gi, '_')}.pdf`,
    size: doc.size,
    metadata: doc
  });
});

export default router;

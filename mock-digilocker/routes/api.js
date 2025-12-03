import express from 'express';
import { getUserById } from '../data/users.js';
import { getDocumentsByUserId, getDocumentByUri } from '../data/documents.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// User info endpoint
router.get('/user_info', requireAuth, (req, res) => {
  console.log('\n👤 USER INFO ENDPOINT CALLED');
  console.log('User ID:', req.userId);

  const user = getUserById(req.userId);

  if (!user) {
    console.log('❌ User not found:', req.userId);
    return res.status(404).json({ error: 'user_not_found' });
  }

  console.log('✅ Returning user info for:', user.name);
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
  console.log('\n📄 FILES ENDPOINT CALLED');
  console.log('User ID:', req.userId);

  const documents = getDocumentsByUserId(req.userId);
  console.log('📄 Found', documents.length, 'documents');

  res.json({
    files: documents,
    count: documents.length
  });
});

// Download document endpoint
router.post('/files/download', requireAuth, (req, res) => {
  console.log('\n⬇️ DOWNLOAD ENDPOINT CALLED');
  console.log('User ID:', req.userId);
  console.log('Request body:', req.body);

  const { uri } = req.body;

  const doc = getDocumentByUri(req.userId, uri);

  if (!doc) {
    console.log('❌ Document not found:', uri);
    return res.status(404).json({
      error: 'document_not_found',
      error_description: 'The requested document was not found'
    });
  }

  console.log('✅ Serving document:', doc.name);

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

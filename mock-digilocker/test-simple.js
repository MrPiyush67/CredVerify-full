import express from 'express';

const app = express();
const PORT = 6000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

console.log('About to start server...');

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

console.log('Script end - server should be running');

import express from 'express';

const app = express();
const PORT = 3002;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

console.log('Script reached end');

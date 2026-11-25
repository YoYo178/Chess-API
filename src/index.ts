import http from 'node:http';
import app from '@/app.js';

const server = http.createServer(app);

// Start listening on the server
server.listen(3000, async () => {
  console.log(`Listening on port ${3000}`);
});
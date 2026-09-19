/**
 * server.js
 * Lightweight, zero-dependency local development server for TaskFlow.
 * Uses native Node.js HTTP and File System modules.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
};

function createServer(port) {
  const server = http.createServer((req, res) => {
    // Parse URL and strip query parameters
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Map root to index.html
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    // Resolve safe file path within workspace
    const safePath = path.normalize(path.join(BASE_DIR, pathname));

    // Prevent directory traversal attacks
    if (!safePath.startsWith(BASE_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(safePath, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>404 Not Found</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h2>404 - File Not Found</h2>
              <p>The requested file <code>${pathname}</code> was not found.</p>
              <a href="/">Return to TaskFlow Dashboard</a>
            </body>
          </html>
        `);
        return;
      }

      // If directory, check for index.html inside
      let filePath = safePath;
      if (stats.isDirectory()) {
        filePath = path.join(safePath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error: ' + readErr.code);
          return;
        }

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
        res.end(content);
      });
    });
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      createServer(port + 1);
    } else {
      console.error('Server error:', e);
    }
  });

  server.listen(port, () => {
    console.log('\n==================================================');
    console.log('  TaskFlow Local Development Server is Running!  ');
    console.log('==================================================');
    console.log(`  Local URL:   http://localhost:${port}`);
    console.log(`  Directory:   ${BASE_DIR}`);
    console.log('  Ready to serve requests. Press Ctrl+C to stop.\n');
  });
}

createServer(DEFAULT_PORT);

const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.md': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';

  const filePath = path.join(DIR, url);
  const ext = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';

  let data;
  try {
    data = fs.readFileSync(filePath);
  } catch (e) {
    if (!res.writableEnded) {
      res.writeHead(404);
      res.end('Not Found');
    }
    return;
  }

  if (!res.writableEnded) {
    res.writeHead(200, { 'Content-Type': ext });
    res.end(data);
  }
});

server.listen(8080, () => {
  console.log('服务器已启动: http://localhost:8080');
});

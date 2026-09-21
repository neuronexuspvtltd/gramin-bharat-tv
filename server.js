const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogv": "video/ogg"
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split("?")[0];
  if (reqUrl === "/") reqUrl = "/index.html";

  const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 Not Found</h1>");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Handle HTTP Range Requests for HTML5 video seeking (.mp4, .webm)
    const range = req.headers.range;
    if (range && (ext === ".mp4" || ext === ".webm" || ext === ".ogv")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType
      });
      file.pipe(res);
      return;
    }

    res.writeHead(200, { "Content-Type": contentType, "Content-Length": stats.size });
    fs.createReadStream(filePath).pipe(res);
  });
});

let currentPort = parseInt(PORT, 10);

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Gramin Bharat TV Server running locally!`);
    console.log(`👉 Main Site:   http://localhost:${port}/`);
    console.log(`👉 Admin Panel:  http://localhost:${port}/admin.html`);
    console.log(`==================================================\n`);
  });
}

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${currentPort} is in use, trying port ${currentPort + 1}...`);
    currentPort += 1;
    startServer(currentPort);
  } else {
    console.error(err);
  }
});

startServer(currentPort);

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const host = option("--host", "0.0.0.0");
const port = Number(option("--port", "4173"));
const root = process.cwd();
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
};

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(request.url, `http://${request.headers.host || "localhost"}`)
        .pathname,
    );
  } catch (_) {
    response.writeHead(400).end("Invalid request");
    return;
  }
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  fs.stat(file, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.setHeader(
      "content-type",
      contentTypes[path.extname(file).toLowerCase()] ||
        "application/octet-stream",
    );
    fs.createReadStream(file)
      .on("error", () => response.writeHead(500).end("Server error"))
      .pipe(response);
  });
});

server.listen(port, host, () => {
  process.stdout.write(`MTECH Smart POS preview listening on ${host}:${port}\n`);
});

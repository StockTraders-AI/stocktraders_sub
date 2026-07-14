import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleLeadApi, sendJson } from "./leadApi.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5174);
const DIST_DIR = path.join(__dirname, "dist");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const serveStatic = async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  const requestedPath = decodeURIComponent(url.pathname);
  const safePath = requestedPath === "/" ? "/index.html" : requestedPath;
  const filePath = path.normalize(path.join(DIST_DIR, safePath));

  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    res.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
    });
    createReadStream(filePath).pipe(res);
    return;
  } catch {
    const hasFileExtension = path.extname(requestedPath) !== "";
    const isAssetRequest = requestedPath.startsWith("/assets/");
    if (hasFileExtension || isAssetRequest) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Static asset not found. Run npm run build and deploy the full dist folder.");
      return;
    }

    const fallback = path.join(DIST_DIR, "index.html");
    try {
      await stat(fallback);
      res.writeHead(200, { "Content-Type": contentTypes[".html"] });
      createReadStream(fallback).pipe(res);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Build frontend bằng npm run build trước khi chạy npm start.");
    }
  }
};

createServer(async (req, res) => {
  try {
    const handled = await handleLeadApi(req, res);
    if (!handled) await serveStatic(req, res);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: err.message || "Lỗi server" });
  }
}).listen(PORT, "0.0.0.0", () => {
  console.log("StockTraders landing running on http://localhost:" + PORT);
});

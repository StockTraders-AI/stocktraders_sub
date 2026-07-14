import { createServer } from "node:http";
import { mkdir, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5010);
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "leads.sqlite");
const DIST_DIR = path.join(__dirname, "dist");

await mkdir(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_FILE);
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    exp TEXT DEFAULT '',
    ts TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_leads_ts ON leads(ts DESC);
`);

const sendJson = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
};

const sendHtml = (res, status, html) => {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(html);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Payload quá lớn"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

const cleanValue = (value) => String(value || "").trim();
const escapeHtml = (value) =>
  String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));

const listLeads = () =>
  db.prepare("SELECT key, name, phone, email, exp, ts FROM leads ORDER BY ts DESC").all();

const renderHb = () => {
  const leads = listLeads();
  const rows = leads.length
    ? leads.map((lead, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(new Date(lead.ts).toLocaleString("vi-VN"))}</td>
          <td>${escapeHtml(lead.name)}</td>
          <td>${escapeHtml(lead.phone)}</td>
          <td>${escapeHtml(lead.email)}</td>
          <td>${escapeHtml(lead.exp)}</td>
        </tr>`).join("")
    : '<tr><td colspan="6" class="empty">Chưa có ai gửi thông tin.</td></tr>';

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HB - Leads</title>
  <style>
    body{font-family:Arial,sans-serif;background:#0A0D14;color:#F0F4FF;margin:0;padding:24px}
    h1{font-size:22px;margin:0 0 6px}.meta{color:#8fa1bd;margin-bottom:18px;font-size:14px}
    table{width:100%;border-collapse:collapse;background:#111520;border:1px solid #242E42;border-radius:10px;overflow:hidden}
    th,td{padding:10px 12px;border-bottom:1px solid #242E42;text-align:left;font-size:14px}
    th{color:#A8B8D0;background:#171D2E;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
    tr:last-child td{border-bottom:0}.empty{text-align:center;color:#5C7090;padding:28px}
    a{color:#3DD68C;text-decoration:none}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:16px}
  </style>
</head>
<body>
  <div class="top">
    <div>
      <h1>Danh sách người gửi thông tin</h1>
      <div class="meta">Tổng: ${leads.length} | Lưu tại SQLite: data/leads.sqlite</div>
    </div>
    <a href="/hb">Làm mới</a>
  </div>
  <table>
    <thead><tr><th>#</th><th>Thời gian</th><th>Họ tên</th><th>SĐT</th><th>Email</th><th>Kinh nghiệm</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
};

const handleRoutes = async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));

  if (url.pathname === "/hb" && req.method === "GET") {
    sendHtml(res, 200, renderHb());
    return true;
  }

  if (url.pathname === "/api/leads" && req.method === "GET") {
    sendJson(res, 200, { leads: listLeads() });
    return true;
  }

  if (url.pathname === "/api/leads" && req.method === "POST") {
    const body = await readBody(req);
    const input = body ? JSON.parse(body) : {};
    const name = cleanValue(input.name);
    const phone = cleanValue(input.phone);
    const email = cleanValue(input.email);
    const exp = cleanValue(input.exp);

    if (!name || !phone) {
      sendJson(res, 400, { error: "Vui lòng nhập họ tên và số điện thoại." });
      return true;
    }

    const lead = {
      key: "lead:" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      name,
      phone,
      email,
      exp,
      ts: new Date().toISOString(),
    };
    db.prepare("INSERT INTO leads (key, name, phone, email, exp, ts) VALUES (?, ?, ?, ?, ?, ?)")
      .run(lead.key, lead.name, lead.phone, lead.email, lead.exp, lead.ts);
    sendJson(res, 201, { lead });
    return true;
  }

  if (url.pathname.startsWith("/api/leads/") && req.method === "DELETE") {
    const key = decodeURIComponent(url.pathname.slice("/api/leads/".length));
    db.prepare("DELETE FROM leads WHERE key = ?").run(key);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "API không tồn tại." });
    return true;
  }

  return false;
};

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
  } catch {
    const fallback = path.join(DIST_DIR, "index.html");
    try {
      await stat(fallback);
      res.writeHead(200, { "Content-Type": contentTypes[".html"] });
      createReadStream(fallback).pipe(res);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Build frontend bằng npm run build, hoặc chạy Vite dev server riêng.");
    }
  }
};

createServer(async (req, res) => {
  try {
    const handled = await handleRoutes(req, res);
    if (!handled) await serveStatic(req, res);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: err.message || "Lỗi server" });
  }
}).listen(PORT, "0.0.0.0", () => {
  console.log("Backend/API running on http://localhost:" + PORT);
  console.log("HB page: http://localhost:" + PORT + "/hb");
});

import { createServer } from "node:http";
import { mkdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5174);
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "leads.sqlite");

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
const listLeads = () =>
  db.prepare("SELECT key, name, phone, email, exp, ts FROM leads ORDER BY ts DESC").all();

const handleRequest = async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));

  if (req.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === "/api/leads" && req.method === "GET") {
    sendJson(res, 200, { leads: listLeads() });
    return;
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
      return;
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
    return;
  }

  if (url.pathname.startsWith("/api/leads/") && req.method === "DELETE") {
    const key = decodeURIComponent(url.pathname.slice("/api/leads/".length));
    db.prepare("DELETE FROM leads WHERE key = ?").run(key);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "API không tồn tại." });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
};

createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error(err);
    sendJson(res, 500, { error: err.message || "Lỗi server" });
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log("Lead API running on http://127.0.0.1:" + PORT);
});

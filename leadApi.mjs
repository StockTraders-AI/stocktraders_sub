import { mkdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const DB_FILE = path.join(process.cwd(), "info.db");
let db;

const getDb = async () => {
  if (db) return db;
  await mkdir(path.dirname(DB_FILE), { recursive: true });
  db = new DatabaseSync(DB_FILE);
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

    CREATE TABLE IF NOT EXISTS teaser_leads (
      key TEXT PRIMARY KEY,
      name TEXT DEFAULT '',
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      ts TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_teaser_leads_ts ON teaser_leads(ts DESC);
  `);
  return db;
};

const cleanValue = (value) => String(value || "").trim();

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Payload quá lớn"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON không hợp lệ"));
      }
    });
    req.on("error", reject);
  });

export const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

const handleMainLeads = async (req, res, database, url) => {
  if (url.pathname === "/api/leads" && req.method === "GET") {
    const leads = database
      .prepare("SELECT key, name, phone, email, exp, ts FROM leads ORDER BY ts DESC")
      .all();
    sendJson(res, 200, { leads });
    return true;
  }

  if (url.pathname === "/api/leads" && req.method === "POST") {
    const input = await readJsonBody(req);
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

    database
      .prepare("INSERT INTO leads (key, name, phone, email, exp, ts) VALUES (?, ?, ?, ?, ?, ?)")
      .run(lead.key, lead.name, lead.phone, lead.email, lead.exp, lead.ts);

    sendJson(res, 201, { lead });
    return true;
  }

  if (url.pathname.startsWith("/api/leads/") && req.method === "DELETE") {
    const key = decodeURIComponent(url.pathname.slice("/api/leads/".length));
    database.prepare("DELETE FROM leads WHERE key = ?").run(key);
    sendJson(res, 200, { ok: true });
    return true;
  }

  return false;
};

const handleTeaserLeads = async (req, res, database, url) => {
  if (url.pathname === "/api/teaser-leads" && req.method === "GET") {
    const leads = database
      .prepare("SELECT key, name, phone, email, ts FROM teaser_leads ORDER BY ts DESC")
      .all();
    sendJson(res, 200, { leads });
    return true;
  }

  if (url.pathname === "/api/teaser-leads" && req.method === "POST") {
    const input = await readJsonBody(req);
    const name = cleanValue(input.name);
    const phone = cleanValue(input.phone);
    const email = cleanValue(input.email);

    if (!phone) {
      sendJson(res, 400, { error: "Vui lòng nhập số điện thoại." });
      return true;
    }

    const lead = {
      key: "teaser_lead:" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      name,
      phone,
      email,
      ts: new Date().toISOString(),
    };

    database
      .prepare("INSERT INTO teaser_leads (key, name, phone, email, ts) VALUES (?, ?, ?, ?, ?)")
      .run(lead.key, lead.name, lead.phone, lead.email, lead.ts);

    sendJson(res, 201, { lead });
    return true;
  }

  if (url.pathname.startsWith("/api/teaser-leads/") && req.method === "DELETE") {
    const key = decodeURIComponent(url.pathname.slice("/api/teaser-leads/".length));
    database.prepare("DELETE FROM teaser_leads WHERE key = ?").run(key);
    sendJson(res, 200, { ok: true });
    return true;
  }

  return false;
};

export const handleLeadApi = async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  const database = await getDb();

  if (req.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    res.statusCode = 204;
    res.end();
    return true;
  }

  if (await handleMainLeads(req, res, database, url)) return true;
  if (await handleTeaserLeads(req, res, database, url)) return true;

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "API không tồn tại." });
    return true;
  }

  return false;
};

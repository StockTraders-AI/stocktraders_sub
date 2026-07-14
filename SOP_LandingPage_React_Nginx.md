# SOP Chi tiet - Trien khai Landing Page React len Domain bang Nginx

## Buoc 1. Khoi tao Project React

### Muc tieu

Tao mot du an React moi.

### Dieu kien

- Da cai Node.js >= 22.
- Da cai Visual Studio Code.

### Cac buoc thuc hien

Kiem tra Node:
```bash
node -v
```
Kiem tra npm:
```bash
npm -v

```
Tao project:
```bash
npm create vite@latest stocktraders_sub -- --template react
```
Di vao project:
```bash
cd stocktraders_sub
```
Cai thu vien:
```bash
npm install
```

Chay thu:
```bash
npm run dev
```
### Ket qua mong doi
Project React chay tai:
```txt
http://localhost:5173
```
### Luu y
Neu port `5173` bi chiem, Vite se tu chuyen sang port khac.

## Buoc 2. Xay dung Landing Page
### Muc tieu
Dung file JSX mau de dung giao dien landing page.
### Cac buoc thuc hien
Tao thu muc component neu chua co:
```txt
src/components/
```
Copy file JSX vao:
```txt
src/components/StockTradersLanding.jsx
```
Sua `src/App.jsx`:
```jsx
import StockTradersLanding from "./components/StockTradersLanding";

export default function App() {
  return <StockTradersLanding />;
}
```
Kiem tra `src/main.jsx`:
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
Chay local:
```bash
npm run dev
```
### Ket qua mong doi
Landing page hien dung tren trinh duyet.
## Buoc 3. Sua JSX khi co Form dang ky
### Muc tieu
Dam bao form trong JSX khong con phu thuoc vao moi truong preview AI nhu:
```js
window.storage
```
### Truong hop co backend
Neu muon form luu vao database rieng, JSX can goi API:
```js
const API_BASE = "/api";

const requestJson = async (path, options = {}) => {
  const res = await fetch(API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Loi ket noi API (${res.status})`);
  }

  return data;
};
```
Khi gui form:
```js
await requestJson("/leads", {
  method: "POST",
  body: JSON.stringify({
    name,
    phone,
    email,
    exp,
  }),
});
```
Khi admin xem danh sach:
```js
const data = await requestJson("/leads");
const leads = Array.isArray(data?.leads) ? data.leads : [];
```
Khi xoa mot lead:
```js
await requestJson("/leads/" + encodeURIComponent(key), {
  method: "DELETE",
});
```
### Luu y quan trong
Doan API tren chi hoat dong khi co backend Node dang chay. Neu chi deploy bang Nginx static, request `/api/leads` se loi.
## Buoc 5. Build Production
### Muc tieu
Dong goi website thanh file tinh de Nginx phuc vu.
### Cac buoc thuc hien
Build:
```bash
npm run build
```
Kiem tra thu muc:
```txt
dist/
```
### Ket qua mong doi
`dist/` chua:
```txt
index.html
assets/
favicon.jpg
```
## Buoc 6. Upload Source len VPS
### Muc tieu
Dua source len may chu.
### Cac buoc thuc hien
Clone source:
```bash
git clone <repo-url> /root/stocktraders_sub
```
Hoac cap nhat source:
```bash
cd /root/stocktraders_sub
git pull origin master
```
Cai package neu moi clone:
```bash
npm install
```
Build tren VPS:
```bash
npm run build
```
### Ket qua mong doi
Source nam tai:
```txt
/root/stocktraders_sub
```
Va co thu muc:
```txt
/root/stocktraders_sub/dist
```
## Buoc 7. Deploy Web Root
### Muc tieu
Dua ban build vao thu muc Nginx doc.
### Cac buoc thuc hien
Tao web root neu chua co:
```bash
sudo mkdir -p /var/www/landing
```
Xoa ban cu:
```bash
sudo rm -rf /var/www/landing/*
```
Copy ban build:
```bash
sudo cp -r dist/* /var/www/landing/
```
Phan quyen:
```bash
sudo chown -R www-data:www-data /var/www/landing
```
### Ket qua mong doi
Nginx doc du lieu tu:
```txt
/var/www/landing
```
## Buoc 8. DNS
### Muc tieu
Tao subdomain tro ve VPS.
### Cac buoc thuc hien
Trong DNS provider, tao A Record:
```txt
Type: A
Name: landing
Value: <IP VPS>
```
Vi du:
```txt
landing -> 45.251.114.164
```
Kiem tra:
```bash
ping landing.tenmien.com
```
Hoac:
```bash
nslookup landing.tenmien.com
```
### Ket qua mong doi
Subdomain tro dung IP VPS.
## Buoc 9. Nginx
### Muc tieu
Cau hinh Nginx serve landing page.
### Cac buoc thuc hien
Tao file:
```bash
sudo nano /etc/nginx/sites-available/landing.tenmien.com
```
Noi dung mau:
```nginx
server {
    listen 80;
    listen [::]:80;

    server_name landing.tenmien.com;

    root /var/www/landing;
    index index.html;

    location = / {
        return 302 /ra-mat-web-2026;
    }

    location /assets/ {
        try_files $uri =404;
        expires 30d;
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/landing.tenmien.com /etc/nginx/sites-enabled/
```

Kiem tra Nginx:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

### Ket qua mong doi

Website truy cap duoc qua:

```txt
http://landing.tenmien.com
```

## Buoc 10. SSL

### Muc tieu

Kich hoat HTTPS.

### Cac buoc thuc hien

Chay Certbot:

```bash
sudo certbot --nginx -d landing.tenmien.com
```

Kiem tra:

```bash
curl -Iv https://landing.tenmien.com
```

### Ket qua mong doi

Website truy cap duoc qua HTTPS:

```txt
https://landing.tenmien.com
```

## Buoc 11. Deploy moi khi sua code

### Cac buoc thuc hien

```bash
cd /root/stocktraders_sub
git pull origin master
npm install
npm run build
sudo rm -rf /var/www/landing/*
sudo cp -r dist/* /var/www/landing/
sudo chown -R www-data:www-data /var/www/landing
sudo systemctl reload nginx
```

### Kiem tra nhanh

```bash
curl -I https://landing.tenmien.com
```

Kiem tra favicon:

```bash
curl -I https://landing.tenmien.com/favicon.jpg
```

Kiem tra Zalo preview meta:

```bash
curl -s https://landing.tenmien.com/ra-mat-web-2026 | grep og:image
```

## Phu luc. Backend SQLite mau cho 1 Landing Page

Phan nay la file mau cho 1 landing page duy nhat.

Backend nay chi co:

```txt
/api/leads
```


### Nguyen ly chay

Source co 2 phan:

- Frontend React build ra `dist/`.
- Backend Node xu ly `/api/leads` va luu vao SQLite `info.db`.

Nginx lam 2 viec:

- Serve frontend tu `/var/www/landing`.
- Proxy `/api/` ve Node server dang chay o `127.0.0.1:5174`.

Nginx khong tu chay file `.mjs`. Muon form luu duoc thi phai co Node server dang chay:

```bash
npm start
```

Lenh tren chay:

```bash
node server.mjs
```

### File mau 1: leadApi.mjs

Tao file ngang hang voi `package.json`:

```txt
leadApi.mjs
```

Noi dung:

```js
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

export const handleLeadApi = async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));

  if (req.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    res.statusCode = 204;
    res.end();
    return true;
  }

  const database = await getDb();

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

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "API không tồn tại." });
    return true;
  }

  return false;
};
```

### File mau 2: server.mjs

Tao file ngang hang voi `package.json`:

```txt
server.mjs
```

Noi dung:

```js
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
  console.log("Landing server running on http://localhost:" + PORT);
});
```

### Sua package.json

Trong `package.json`, them script:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server.mjs",
    "preview": "node server.mjs"
  }
}
```

### Sua vite.config.js de local dev goi duoc API

Tao hoac sua file:

```txt
vite.config.js
```

Noi dung mau:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { handleLeadApi, sendJson } from "./leadApi.mjs";

const leadApiPlugin = () => ({
  name: "landing-lead-api",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      try {
        const handled = await handleLeadApi(req, res);
        if (!handled) next();
      } catch (err) {
        console.error(err);
        sendJson(res, 500, { error: err.message || "Lỗi server" });
      }
    });
  },
});

export default defineConfig({
  plugins: [leadApiPlugin(), react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
  },
});
```

### Sua Nginx neu dung backend

Them block nay truoc `location /`:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5174;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Cach chay tren VPS

Build frontend:

```bash
npm run build
```

Copy `dist` cho Nginx:

```bash
sudo rm -rf /var/www/landing/*
sudo cp -r dist/* /var/www/landing/
sudo chown -R www-data:www-data /var/www/landing
```

Chay backend Node:

```bash
npm start
```

Kiem tra truc tiep backend:

```bash
curl http://127.0.0.1:5174/api/leads
```

Kiem tra qua domain:

```bash
curl https://landing.tenmien.com/api/leads
```

Ket qua dung:

```json
{"leads":[]}
```

### Luu y

Neu tat terminal dang chay `npm start`, backend se tat va form khong luu duoc nua.

Muon backend tu chay lai sau khi reboot VPS, can dung mot cach quan ly process nhu `systemd`, PM2, Docker hoac dich vu tuong duong. Day la phan van hanh server, khong phai code bat buoc trong source.

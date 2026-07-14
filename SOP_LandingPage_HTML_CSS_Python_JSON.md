# SOP Don Gian - Landing Page HTML/CSS + Python + JSON

Muc tieu: tao mot landing page don gian, co form dang ky, backend Python luu thong tin vao file `leads.json`.

Cau truc source:

```txt
landing-simple/
  app.py
  index.html
  style.css
  leads.json
```

Phu hop khi:

- Chi can 1 landing page.
- Form gom ho ten, so dien thoai, email, kinh nghiem.
- Can trang admin don gian de xem ai da gui thong tin.
- Khong muon React, Vite, npm build.
- Muon sua HTML/CSS truc tiep.

Khong phu hop khi:

- Traffic lon.
- Nhieu nguoi cung submit lien tuc.
- Can phan quyen admin that su.
- Can tim kiem/loc/phan trang du lieu lon.

Voi nhu cau lon hon, nen dung SQLite thay vi JSON.

## Buoc 1. Tao thu muc project

Tren VPS hoac may local:

```bash
mkdir landing-simple
cd landing-simple
```

Tao 4 file:

```bash
touch app.py index.html style.css leads.json
```

Khoi tao `leads.json`:

```json
[]
```

## Buoc 2. Cai Python package

Dung Flask cho de viet backend:

```bash
pip install flask
```

Neu may co nhieu ban Python:

```bash
python3 -m pip install flask
```

## Buoc 3. File index.html

Tao file:

```txt
index.html
```

Noi dung mau:

```html
<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StockTraders AI</title>
  <meta name="description" content="StockTraders AI - Landing page dang ky uu dai.">

  <link rel="stylesheet" href="/style.css">
  <link rel="icon" type="image/jpeg" href="/favicon.jpg">

  <meta property="og:type" content="website">
  <meta property="og:title" content="StockTraders AI">
  <meta property="og:description" content="Dang ky nhan uu dai StockTraders AI.">
  <meta property="og:image" content="https://landing.tenmien.com/favicon.jpg">
</head>
<body>
  <header class="nav">
    <div class="brand">StockTraders <span>AI</span></div>
    <a href="#signup" class="nav-btn">Dang ky uu dai</a>
  </header>

  <main>
    <section class="hero">
      <div class="eyebrow">Uu dai 50% - Kich hoat 02/08/2026</div>
      <h1>He thong do song chinh xac nhat thi truong chung khoan Viet</h1>
      <p>De lai thong tin, doi ngu se lien he xac nhan va huong dan kich hoat.</p>
      <a href="#signup" class="primary-btn">Dang ky ngay</a>
    </section>

    <section id="signup" class="form-section">
      <h2>Khoa gia 50% truoc 02/08/2026</h2>
      <p>Dien thong tin, doi ngu se lien he xac nhan.</p>

      <form id="lead-form" class="form-box">
        <label>Ho va ten *</label>
        <input id="lead-name" name="name" type="text" placeholder="Nguyen Van A" required>

        <label>So dien thoai *</label>
        <input id="lead-phone" name="phone" type="tel" placeholder="0901 234 567" required>

        <label>Email</label>
        <input id="lead-email" name="email" type="email" placeholder="email@example.com">

        <label>Kinh nghiem dau tu</label>
        <select id="lead-exp" name="exp">
          <option value="">Chon muc kinh nghiem</option>
          <option>Duoi 1 nam</option>
          <option>1 - 3 nam</option>
          <option>3 - 5 nam</option>
          <option>Tren 5 nam</option>
        </select>

        <div id="form-error" class="error" hidden></div>
        <button id="submit-btn" type="submit">Dang ky nhan uu dai 50%</button>
      </form>
    </section>
  </main>

  <footer>
    <button class="admin-link" onclick="toggleAdmin()">© 2026 StockTraders</button>
  </footer>

  <section id="admin-panel" class="admin-panel" hidden>
    <div id="admin-login" class="admin-login">
      <p>Nhap ma PIN de xem danh sach dang ky</p>
      <input id="admin-pin" type="password" placeholder="Ma PIN">
      <button onclick="adminLogin()">Truy cap</button>
      <div id="admin-error" class="error" hidden>Sai ma PIN.</div>
    </div>

    <div id="admin-dashboard" hidden>
      <div class="admin-header">
        <h3>Danh sach khach dang ky <span id="lead-count">(0)</span></h3>
        <button onclick="loadLeads()">Lam moi</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Thoi gian</th>
            <th>Ho ten</th>
            <th>SDT</th>
            <th>Email</th>
            <th>Kinh nghiem</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="lead-table-body"></tbody>
      </table>
    </div>
  </section>

  <script>
    const ADMIN_PIN = "9983";

    const form = document.getElementById("lead-form");
    const errorBox = document.getElementById("form-error");
    const submitBtn = document.getElementById("submit-btn");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorBox.hidden = true;

      const payload = {
        name: document.getElementById("lead-name").value.trim(),
        phone: document.getElementById("lead-phone").value.trim(),
        email: document.getElementById("lead-email").value.trim(),
        exp: document.getElementById("lead-exp").value,
      };

      if (!payload.name || !payload.phone) {
        errorBox.textContent = "Vui long nhap ho ten va so dien thoai.";
        errorBox.hidden = false;
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Dang gui...";

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Luu that bai");

        submitBtn.textContent = "Da dang ky - chung toi se lien he som";
        form.reset();
      } catch (err) {
        errorBox.textContent = err.message || "Khong the luu dang ky.";
        errorBox.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Dang ky nhan uu dai 50%";
      }
    });

    function toggleAdmin() {
      const panel = document.getElementById("admin-panel");
      panel.hidden = !panel.hidden;
    }

    async function adminLogin() {
      const pin = document.getElementById("admin-pin").value.trim();
      const err = document.getElementById("admin-error");

      if (pin !== ADMIN_PIN) {
        err.hidden = false;
        return;
      }

      err.hidden = true;
      document.getElementById("admin-login").hidden = true;
      document.getElementById("admin-dashboard").hidden = false;
      await loadLeads();
    }

    async function loadLeads() {
      const res = await fetch("/api/leads");
      const data = await res.json();
      const leads = data.leads || [];

      document.getElementById("lead-count").textContent = `(${leads.length})`;
      const tbody = document.getElementById("lead-table-body");

      if (!leads.length) {
        tbody.innerHTML = '<tr><td colspan="6">Chua co ai dang ky.</td></tr>';
        return;
      }

      tbody.innerHTML = leads.map((lead) => `
        <tr>
          <td>${new Date(lead.ts).toLocaleString("vi-VN")}</td>
          <td>${escapeHtml(lead.name)}</td>
          <td>${escapeHtml(lead.phone)}</td>
          <td>${escapeHtml(lead.email || "-")}</td>
          <td>${escapeHtml(lead.exp || "-")}</td>
          <td><button onclick="deleteLead('${lead.id}')">Xoa</button></td>
        </tr>
      `).join("");
    }

    async function deleteLead(id) {
      if (!confirm("Xoa dang ky nay?")) return;
      await fetch(`/api/leads/${encodeURIComponent(id)}`, { method: "DELETE" });
      await loadLeads();
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char]));
    }
  </script>
</body>
</html>
```

## Buoc 4. File style.css

Tao file:

```txt
style.css
```

Noi dung mau:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #0a0d14;
  color: #f0f4ff;
}

.nav {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid #242e42;
  background: #0a0d14;
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  font-weight: 800;
  font-size: 18px;
}

.brand span {
  color: #7c3aed;
}

.nav-btn,
.primary-btn,
button {
  background: #3dd68c;
  color: #06130c;
  border: 0;
  border-radius: 8px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}

.hero {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 24px;
}

.eyebrow {
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 999px;
  padding: 8px 16px;
  margin-bottom: 24px;
}

.hero h1 {
  max-width: 900px;
  font-size: clamp(36px, 6vw, 72px);
  line-height: 1.1;
  margin: 0 0 20px;
}

.hero p,
.form-section p {
  color: #a8b8d0;
  font-size: 18px;
  max-width: 680px;
}

.form-section {
  padding: 80px 24px;
  text-align: center;
}

.form-box {
  max-width: 520px;
  margin: 32px auto 0;
  padding: 32px;
  border: 1px solid #242e42;
  border-radius: 16px;
  background: #111520;
  text-align: left;
}

label {
  display: block;
  margin: 16px 0 8px;
  color: #5c7090;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

input,
select {
  width: 100%;
  padding: 13px 14px;
  border-radius: 8px;
  border: 1px solid #242e42;
  background: #171d2e;
  color: #f0f4ff;
  font-size: 15px;
}

.form-box button {
  width: 100%;
  margin-top: 20px;
}

.error {
  color: #ff2d55;
  margin-top: 14px;
  font-size: 14px;
}

footer {
  padding: 32px;
  border-top: 1px solid #242e42;
  text-align: center;
  color: #5c7090;
}

.admin-link {
  background: transparent;
  color: #5c7090;
  padding: 0;
}

.admin-panel {
  padding: 40px 24px 80px;
}

.admin-login,
#admin-dashboard {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  background: #111520;
  border: 1px solid #242e42;
  border-radius: 16px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 14px;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #242e42;
  text-align: left;
}

th {
  color: #5c7090;
}

@media (max-width: 720px) {
  .nav {
    padding: 0 16px;
  }

  .nav-btn {
    display: none;
  }

  .admin-header {
    align-items: flex-start;
    flex-direction: column;
  }

  table {
    display: block;
    overflow-x: auto;
  }
}
```

## Buoc 5. File app.py

Tao file:

```txt
app.py
```

Noi dung:

```python
from flask import Flask, jsonify, request, send_from_directory
from pathlib import Path
from datetime import datetime, timezone
import json
import uuid

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "leads.json"


def read_leads():
    if not DATA_FILE.exists():
        DATA_FILE.write_text("[]", encoding="utf-8")
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def write_leads(leads):
    DATA_FILE.write_text(
        json.dumps(leads, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


@app.get("/favicon.jpg")
def favicon():
    return send_from_directory(BASE_DIR, "favicon.jpg")


@app.get("/api/leads")
def get_leads():
    leads = read_leads()
    leads.sort(key=lambda item: item.get("ts", ""), reverse=True)
    return jsonify({"leads": leads})


@app.post("/api/leads")
def create_lead():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    phone = str(data.get("phone", "")).strip()
    email = str(data.get("email", "")).strip()
    exp = str(data.get("exp", "")).strip()

    if not name or not phone:
        return jsonify({"error": "Vui lòng nhập họ tên và số điện thoại."}), 400

    lead = {
        "id": str(uuid.uuid4()),
        "name": name,
        "phone": phone,
        "email": email,
        "exp": exp,
        "ts": datetime.now(timezone.utc).isoformat(),
    }

    leads = read_leads()
    leads.append(lead)
    write_leads(leads)

    return jsonify({"lead": lead}), 201


@app.delete("/api/leads/<lead_id>")
def delete_lead(lead_id):
    leads = read_leads()
    leads = [lead for lead in leads if lead.get("id") != lead_id]
    write_leads(leads)
    return jsonify({"ok": True})


@app.get("/<path:path>")
def fallback(path):
    file_path = BASE_DIR / path
    if file_path.exists() and file_path.is_file():
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(BASE_DIR, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
```

## Buoc 6. File leads.json

Tao file:

```txt
leads.json
```

Noi dung ban dau:

```json
[]
```

File nay se tu duoc cap nhat khi co nguoi gui form.

Vi du sau khi co lead:

```json
[
  {
    "id": "9f5c0c1e-7c1a-44d5-8d47-8f46c5b0c6a1",
    "name": "Nguyen Van A",
    "phone": "0901234567",
    "email": "a@example.com",
    "exp": "1 - 3 nam",
    "ts": "2026-07-14T10:00:00+00:00"
  }
]
```

## Buoc 7. Chay local

Cai Flask:

```bash
pip install flask
```

Chay app:

```bash
python app.py
```

Hoac:

```bash
python3 app.py
```

Mo trinh duyet:

```txt
http://localhost:8000
```

Test API:

```bash
curl http://localhost:8000/api/leads
```

Ket qua mong doi:

```json
{"leads":[]}
```

## Buoc 8. Upload len VPS

Copy thu muc `landing-simple` len VPS, vi du:

```txt
/root/landing-simple
```

Cai Flask tren VPS:

```bash
cd /root/landing-simple
pip install flask
```

Chay thu:

```bash
python3 app.py
```

Kiem tra tren VPS:

```bash
curl http://127.0.0.1:8000/api/leads
```

## Buoc 9. Nginx proxy ve Python

Tao file Nginx:

```bash
sudo nano /etc/nginx/sites-available/landing.tenmien.com
```

Noi dung:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name landing.tenmien.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/landing.tenmien.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Mo domain:

```txt
http://landing.tenmien.com
```

## Buoc 10. SSL

Chay Certbot:

```bash
sudo certbot --nginx -d landing.tenmien.com
```

Kiem tra:

```bash
curl -I https://landing.tenmien.com
```

## Buoc 11. Chay nen Python app

Neu chay:

```bash
python3 app.py
```

thi khi dong terminal, backend se tat.

Can dung mot cach chay nen nhu `systemd`, `supervisor`, `tmux`, `screen`, Docker, hoac PM2 cho Python.

Vi du don gian bang `tmux`:

```bash
sudo apt install tmux
cd /root/landing-simple
tmux new -s landing
python3 app.py
```

Thoat khoi tmux nhung van giu app chay:

```txt
Ctrl+B, sau do bam D
```

Vao lai:

```bash
tmux attach -t landing
```

## Buoc 12. Kiem tra sau deploy

Kiem tra web:

```bash
curl -I https://landing.tenmien.com
```

Kiem tra API:

```bash
curl https://landing.tenmien.com/api/leads
```

Kiem tra file data:

```bash
cat /root/landing-simple/leads.json
```

## Luu y ve JSON

Dung JSON rat don gian, nhung co gioi han:

- Neu 2 nguoi submit cung luc, co the can co lock file de tranh ghi de.
- Neu data lon, doc/ghi ca file JSON se cham.
- Neu can nghiem tuc hon, nen chuyen sang SQLite.

Voi landing page nho va so lead vua phai, JSON la cach de bat dau nhanh.
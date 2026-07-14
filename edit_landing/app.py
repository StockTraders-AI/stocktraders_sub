from datetime import datetime, timezone
from pathlib import Path
import sqlite3
import uuid

from flask import Flask, jsonify, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "leads.db"

app = Flask(__name__)


def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT DEFAULT '',
            ts TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS page_content (
            key TEXT PRIMARY KEY,
            html TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_ts ON leads(ts DESC)")
    return conn


def clean(value):
    return str(value or "").strip()


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


@app.get("/favicon.jpg")
def favicon():
    file_path = BASE_DIR / "favicon.jpg"
    if file_path.exists():
        return send_from_directory(BASE_DIR, "favicon.jpg")
    return ("", 404)


@app.get("/api/page-content")
def get_page_content():
    with get_db() as conn:
        row = conn.execute(
            "SELECT html, updated_at FROM page_content WHERE key = ?",
            ("editable_html",),
        ).fetchone()
    if not row:
        return jsonify({"html": "", "updated_at": ""})
    return jsonify({"html": row["html"], "updated_at": row["updated_at"]})


@app.post("/api/page-content")
def save_page_content():
    data = request.get_json(silent=True) or {}
    html = data.get("html")
    if not isinstance(html, str):
        return jsonify({"error": "Nội dung HTML không hợp lệ."}), 400
    if len(html) > 1_000_000:
        return jsonify({"error": "Nội dung HTML quá lớn."}), 400

    saved = {
        "key": "editable_html",
        "html": html,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO page_content (key, html, updated_at)
            VALUES (:key, :html, :updated_at)
            ON CONFLICT(key) DO UPDATE SET
                html = excluded.html,
                updated_at = excluded.updated_at
            """,
            saved,
        )
        conn.commit()
    return jsonify({"ok": True, "updated_at": saved["updated_at"]})


@app.delete("/api/page-content")
def reset_page_content():
    with get_db() as conn:
        conn.execute("DELETE FROM page_content WHERE key = ?", ("editable_html",))
        conn.commit()
    return jsonify({"ok": True})


@app.get("/api/leads")
def list_leads():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, name, phone, email, ts FROM leads ORDER BY ts DESC"
        ).fetchall()
    return jsonify({"leads": [dict(row) for row in rows]})


@app.post("/api/leads")
def create_lead():
    data = request.get_json(silent=True) or {}
    name = clean(data.get("name"))
    phone = clean(data.get("phone"))
    email = clean(data.get("email"))

    if not name or not phone:
        return jsonify({"error": "Vui lòng nhập họ tên và số điện thoại."}), 400

    lead = {
        "id": str(uuid.uuid4()),
        "name": name,
        "phone": phone,
        "email": email,
        "ts": datetime.now(timezone.utc).isoformat(),
    }

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO leads (id, name, phone, email, ts)
            VALUES (:id, :name, :phone, :email, :ts)
            """,
            lead,
        )
        conn.commit()

    return jsonify({"lead": lead}), 201


@app.delete("/api/leads/<lead_id>")
def delete_lead(lead_id):
    with get_db() as conn:
        conn.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
        conn.commit()
    return jsonify({"ok": True})


@app.get("/<path:path>")
def fallback(path):
    file_path = BASE_DIR / path
    if file_path.exists() and file_path.is_file():
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(BASE_DIR, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
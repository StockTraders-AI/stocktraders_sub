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
    conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_ts ON leads(ts DESC)")
    return conn


def clean(value):
    return str(value or "").strip()


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/styles.css")
def styles():
    return send_from_directory(BASE_DIR, "styles.css")


@app.get("/style.css")
def style_compat():
    return send_from_directory(BASE_DIR, "styles.css")


@app.get("/favicon.jpg")
def favicon():
    file_path = BASE_DIR / "favicon.jpg"
    if file_path.exists():
        return send_from_directory(BASE_DIR, "favicon.jpg")
    return ("", 404)


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
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    file_path = BASE_DIR / path
    if file_path.exists() and file_path.is_file():
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(BASE_DIR, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
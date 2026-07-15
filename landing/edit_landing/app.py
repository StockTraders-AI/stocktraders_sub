from datetime import datetime, timezone
from pathlib import Path
import sqlite3
import uuid

from flask import Flask, abort, jsonify, redirect, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
VALID_SLUGS = {"1", "2", "3", "4", "5"}

app = Flask(__name__)


def validate_slug(slug):
    if slug not in VALID_SLUGS:
        abort(404)
    return slug


def db_file_for(slug):
    validate_slug(slug)
    DATA_DIR.mkdir(exist_ok=True)
    return DATA_DIR / f"{slug}.db"


def get_db(slug):
    conn = sqlite3.connect(db_file_for(slug))
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


def init_all_dbs():
    for slug in sorted(VALID_SLUGS):
        with get_db(slug) as conn:
            conn.commit()


def clean(value):
    return str(value or "").strip()


@app.get("/")
def root():
    return redirect("/1/", code=302)


@app.get("/<slug>/")
def index(slug):
    validate_slug(slug)
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/style.css")
def root_style():
    return send_from_directory(BASE_DIR, "style.css")


@app.get("/<slug>/style.css")
def style(slug):
    validate_slug(slug)
    return send_from_directory(BASE_DIR, "style.css")


@app.get("/favicon.jpg")
@app.get("/<slug>/favicon.jpg")
def favicon(slug=None):
    if slug is not None:
        validate_slug(slug)
    file_path = BASE_DIR / "favicon.jpg"
    if file_path.exists():
        return send_from_directory(BASE_DIR, "favicon.jpg")
    return ("", 404)


@app.get("/<slug>/api/page-content")
def get_page_content(slug):
    with get_db(slug) as conn:
        row = conn.execute(
            "SELECT html, updated_at FROM page_content WHERE key = ?",
            ("editable_html",),
        ).fetchone()
    if not row:
        return jsonify({"html": "", "updated_at": ""})
    return jsonify({"html": row["html"], "updated_at": row["updated_at"]})


@app.post("/<slug>/api/page-content")
def save_page_content(slug):
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
    with get_db(slug) as conn:
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


@app.delete("/<slug>/api/page-content")
def reset_page_content(slug):
    with get_db(slug) as conn:
        conn.execute("DELETE FROM page_content WHERE key = ?", ("editable_html",))
        conn.commit()
    return jsonify({"ok": True})


@app.get("/<slug>/api/leads")
def list_leads(slug):
    with get_db(slug) as conn:
        rows = conn.execute(
            "SELECT id, name, phone, email, ts FROM leads ORDER BY ts DESC"
        ).fetchall()
    return jsonify({"leads": [dict(row) for row in rows]})


@app.post("/<slug>/api/leads")
def create_lead(slug):
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

    with get_db(slug) as conn:
        conn.execute(
            """
            INSERT INTO leads (id, name, phone, email, ts)
            VALUES (:id, :name, :phone, :email, :ts)
            """,
            lead,
        )
        conn.commit()

    return jsonify({"lead": lead}), 201


@app.delete("/<slug>/api/leads/<lead_id>")
def delete_lead(slug, lead_id):
    with get_db(slug) as conn:
        conn.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
        conn.commit()
    return jsonify({"ok": True})


@app.get("/<slug>/<path:path>")
def slug_fallback(slug, path):
    validate_slug(slug)
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    file_path = BASE_DIR / path
    if file_path.exists() and file_path.is_file():
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:path>")
def fallback(path):
    if path in VALID_SLUGS:
        return redirect(f"/{path}/", code=301)
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    file_path = BASE_DIR / path
    if file_path.exists() and file_path.is_file():
        return send_from_directory(BASE_DIR, path)
    abort(404)


init_all_dbs()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
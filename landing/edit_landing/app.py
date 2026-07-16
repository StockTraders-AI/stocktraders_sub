from datetime import datetime, timezone
from pathlib import Path
import re
import sqlite3
import unicodedata
import uuid

from flask import Flask, abort, jsonify, redirect, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
ADMIN_PIN = "9983"
LEGACY_SLUGS = {"1", "2", "3", "4", "5"}
SLUG_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$")
RESERVED_SLUGS = {"api", "manager", "assets", "static", "style", "favicon"}
RESERVED_COLUMNS = {"id", "ts"}
DEFAULT_FORM_FIELDS = [
    {"key": "name", "label": "Họ và tên", "type": "text", "placeholder": "Nguyễn Văn A", "required": True, "position": 10},
    {"key": "phone", "label": "Số điện thoại", "type": "tel", "placeholder": "0901 234 567", "required": True, "position": 20},
    {"key": "email", "label": "Email", "type": "email", "placeholder": "email@example.com", "required": False, "position": 30},
]

app = Flask(__name__)


def normalize_slug(value):
    text = unicodedata.normalize("NFKD", clean(value)).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9-]+", "-", text).strip("-").lower()
    text = re.sub(r"-+", "-", text)
    return text[:64]


def is_valid_slug(slug):
    return bool(slug and SLUG_RE.fullmatch(slug) and slug not in RESERVED_SLUGS)


def validate_slug(slug):
    slug = normalize_slug(slug)
    if not is_valid_slug(slug):
        abort(404)
    return slug


def db_file_for(slug):
    slug = validate_slug(slug)
    DATA_DIR.mkdir(exist_ok=True)
    return DATA_DIR / f"{slug}.db"


def clean(value):
    return str(value or "").strip()


def normalize_key(value):
    text = unicodedata.normalize("NFKD", clean(value)).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9_]+", "_", text).strip("_").lower()
    if not text:
        text = "field"
    if text[0].isdigit():
        text = "field_" + text
    return text[:40]


def quote_ident(identifier):
    if not re.fullmatch(r"[a-zA-Z_][a-zA-Z0-9_]*", identifier):
        raise ValueError("Invalid column name")
    return '"' + identifier + '"'


def lead_columns(conn):
    return [row[1] for row in conn.execute("PRAGMA table_info(leads)").fetchall()]


def ensure_lead_column(conn, key):
    if key in lead_columns(conn):
        return
    conn.execute(f"ALTER TABLE leads ADD COLUMN {quote_ident(key)} TEXT DEFAULT ''")


def create_base_tables(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            email TEXT DEFAULT '',
            ts TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS form_fields (
            key TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'text',
            placeholder TEXT NOT NULL DEFAULT '',
            required INTEGER NOT NULL DEFAULT 0,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
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
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        """
    )


def ensure_default_form_fields(conn):
    initialized = conn.execute(
        "SELECT value FROM app_settings WHERE key = ?", ("form_initialized",)
    ).fetchone()
    count = conn.execute("SELECT COUNT(*) FROM form_fields").fetchone()[0]
    if initialized:
        return
    if count != 0:
        conn.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
            ("form_initialized", "1"),
        )
        return

    now = datetime.now(timezone.utc).isoformat()
    for field in DEFAULT_FORM_FIELDS:
        conn.execute(
            """
            INSERT INTO form_fields (key, label, type, placeholder, required, position, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                field["key"], field["label"], field["type"], field["placeholder"],
                1 if field["required"] else 0, field["position"], now,
            ),
        )
    conn.execute(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
        ("form_initialized", "1"),
    )


def ensure_schema(conn):
    create_base_tables(conn)
    ensure_default_form_fields(conn)
    for key in [row[0] for row in conn.execute("SELECT key FROM form_fields")]:
        ensure_lead_column(conn, key)


def get_db(slug):
    conn = sqlite3.connect(db_file_for(slug))
    conn.row_factory = sqlite3.Row
    ensure_schema(conn)
    conn.commit()
    return conn


def landing_slugs():
    DATA_DIR.mkdir(exist_ok=True)
    slugs = set(LEGACY_SLUGS)
    for db_path in DATA_DIR.glob("*.db"):
        slug = db_path.stem
        if is_valid_slug(slug):
            slugs.add(slug)
    return sorted(slugs, key=lambda item: (not item.isdigit(), item))


def init_all_dbs():
    for slug in landing_slugs():
        with get_db(slug) as conn:
            conn.commit()


def setting_value(conn, key, default=""):
    row = conn.execute("SELECT value FROM app_settings WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else default


def set_setting(conn, key, value):
    conn.execute(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
        (key, clean(value)),
    )


def copy_public_template(src_slug, dst_slug):
    with get_db(src_slug) as src, get_db(dst_slug) as dst:
        page = src.execute(
            "SELECT html, updated_at FROM page_content WHERE key = ?",
            ("editable_html",),
        ).fetchone()
        dst.execute("DELETE FROM page_content WHERE key = ?", ("editable_html",))
        if page:
            dst.execute(
                """
                INSERT INTO page_content (key, html, updated_at)
                VALUES (?, ?, ?)
                """,
                ("editable_html", page["html"], datetime.now(timezone.utc).isoformat()),
            )

        fields = get_form_fields(src)
        dst.execute("DELETE FROM form_fields")
        for column in list(lead_columns(dst)):
            if column not in RESERVED_COLUMNS:
                drop_lead_column(dst, column)
        now = datetime.now(timezone.utc).isoformat()
        for index, field in enumerate(fields):
            dst.execute(
                """
                INSERT INTO form_fields (key, label, type, placeholder, required, position, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    field["key"], field["label"], field["type"], field["placeholder"],
                    1 if field["required"] else 0, (index + 1) * 10, now,
                ),
            )
            ensure_lead_column(dst, field["key"])
        set_setting(dst, "form_initialized", "1")
        dst.commit()


def delete_landing_files(slug):
    base = db_file_for(slug)
    for suffix in ("", "-wal", "-shm", "-journal"):
        path = base.with_name(base.name + suffix)
        if path.exists():
            path.unlink()


def field_dict(row):
    data = dict(row)
    data["required"] = bool(data.get("required"))
    data["protected"] = False
    return data


def get_form_fields(conn):
    rows = conn.execute(
        "SELECT key, label, type, placeholder, required, position FROM form_fields ORDER BY position, created_at, key"
    ).fetchall()
    return [field_dict(row) for row in rows]


def unique_field_key(conn, label):
    base = normalize_key(label)
    if base in RESERVED_COLUMNS:
        base = "field_" + base
    existing = set(lead_columns(conn)) | {row[0] for row in conn.execute("SELECT key FROM form_fields")}
    key = base
    i = 2
    while key in existing or key in RESERVED_COLUMNS:
        suffix = f"_{i}"
        key = (base[: 40 - len(suffix)] + suffix).strip("_")
        i += 1
    return key


def stable_field_key(conn, label, requested_key=None, current_key=None):
    candidate = normalize_key(requested_key or label)
    if candidate in RESERVED_COLUMNS:
        candidate = "field_" + candidate
    existing = set(lead_columns(conn)) | {row[0] for row in conn.execute("SELECT key FROM form_fields")}
    if current_key:
        existing.discard(current_key)
    key = candidate
    i = 2
    while key in existing or key in RESERVED_COLUMNS:
        suffix = f"_{i}"
        key = (candidate[: 40 - len(suffix)] + suffix).strip("_")
        i += 1
    return key


def normalize_field_payload(field, fallback_position):
    label = clean(field.get("label"))
    if not label:
        return None
    input_type = clean(field.get("type")) or "text"
    if input_type not in {"text", "tel", "email", "number", "date", "textarea"}:
        input_type = "text"
    return {
        "key": normalize_key(field.get("key") or label),
        "label": label,
        "type": input_type,
        "placeholder": clean(field.get("placeholder")),
        "required": bool(field.get("required")),
        "position": int(field.get("position") or fallback_position),
    }


def column_definition(col):
    if col == "id":
        return '"id" TEXT PRIMARY KEY'
    if col == "ts":
        return '"ts" TEXT NOT NULL'
    return f"{quote_ident(col)} TEXT DEFAULT ''"


def drop_lead_column(conn, key):
    columns = lead_columns(conn)
    if key not in columns:
        return
    keep = [col for col in columns if col != key]
    definitions = [column_definition(col) for col in keep]
    keep_sql = ", ".join(quote_ident(col) for col in keep)
    conn.execute("DROP TABLE IF EXISTS leads_new")
    conn.execute(f"CREATE TABLE leads_new ({', '.join(definitions)})")
    conn.execute(f"INSERT INTO leads_new ({keep_sql}) SELECT {keep_sql} FROM leads")
    conn.execute("DROP TABLE leads")
    conn.execute("ALTER TABLE leads_new RENAME TO leads")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_ts ON leads(ts DESC)")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        """
    )


@app.get("/manager")
@app.get("/manager/")
def manager():
    return send_from_directory(BASE_DIR, "manager.html")


@app.get("/api/landings")
def list_landings():
    items = []
    for slug in landing_slugs():
        with get_db(slug) as conn:
            lead_count = conn.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
            items.append({
                "slug": slug,
                "url": f"/{slug}/",
                "title": setting_value(conn, "landing_title", slug),
                "leads": lead_count,
                "protected": slug == "1",
            })
    return jsonify({"landings": items})


@app.delete("/api/landings/<slug>")
def delete_landing(slug):
    data = request.get_json(silent=True) or {}
    if clean(data.get("pin")) != ADMIN_PIN:
        return jsonify({"error": "Mã PIN không đúng."}), 403

    slug = normalize_slug(slug)
    if not is_valid_slug(slug):
        return jsonify({"error": "Landing không hợp lệ."}), 400
    if slug == "1":
        return jsonify({"error": "Không xoá landing gốc /1/."}), 400

    db_path = db_file_for(slug)
    if not db_path.exists():
        return jsonify({"error": "Landing không tồn tại."}), 404
    delete_landing_files(slug)
    return jsonify({"ok": True, "slug": slug})


@app.post("/api/landings")
def create_landing():
    data = request.get_json(silent=True) or {}
    if clean(data.get("pin")) != ADMIN_PIN:
        return jsonify({"error": "Mã PIN không đúng."}), 403

    slug = normalize_slug(data.get("slug") or data.get("title"))
    if not is_valid_slug(slug):
        return jsonify({"error": "Slug chỉ dùng chữ thường, số và dấu gạch ngang."}), 400

    db_path = db_file_for(slug)
    if db_path.exists():
        return jsonify({"error": "Landing này đã tồn tại."}), 409

    source = clean(data.get("source")) or "default"
    copy_from = normalize_slug(data.get("copy_from"))
    with get_db(slug) as conn:
        set_setting(conn, "landing_title", data.get("title") or slug)
        conn.commit()

    if source == "copy":
        if not is_valid_slug(copy_from) or not db_file_for(copy_from).exists():
            db_path.unlink(missing_ok=True)
            return jsonify({"error": "Landing nguồn để copy không tồn tại."}), 400
        copy_public_template(copy_from, slug)
        with get_db(slug) as conn:
            set_setting(conn, "landing_title", data.get("title") or slug)
            conn.commit()
    elif source == "html":
        html = data.get("html")
        if isinstance(html, str) and html.strip():
            with get_db(slug) as conn:
                conn.execute(
                    """
                    INSERT INTO page_content (key, html, updated_at)
                    VALUES (?, ?, ?)
                    ON CONFLICT(key) DO UPDATE SET html = excluded.html, updated_at = excluded.updated_at
                    """,
                    ("editable_html", html.strip(), datetime.now(timezone.utc).isoformat()),
                )
                conn.commit()

    return jsonify({
        "ok": True,
        "landing": {
            "slug": slug,
            "url": f"/{slug}/",
            "title": clean(data.get("title")) or slug,
        },
    }), 201


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
        row = conn.execute("SELECT html, updated_at FROM page_content WHERE key = ?", ("editable_html",)).fetchone()
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
    saved = {"key": "editable_html", "html": html, "updated_at": datetime.now(timezone.utc).isoformat()}
    with get_db(slug) as conn:
        conn.execute(
            """
            INSERT INTO page_content (key, html, updated_at)
            VALUES (:key, :html, :updated_at)
            ON CONFLICT(key) DO UPDATE SET html = excluded.html, updated_at = excluded.updated_at
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


@app.get("/<slug>/api/form-fields")
def list_form_fields(slug):
    with get_db(slug) as conn:
        return jsonify({"fields": get_form_fields(conn)})


@app.put("/<slug>/api/form-fields")
def replace_form_fields(slug):
    data = request.get_json(silent=True) or {}
    incoming = data.get("fields")
    if not isinstance(incoming, list):
        return jsonify({"error": "Danh sách trường form không hợp lệ."}), 400

    normalized = []
    seen_labels = set()
    for index, field in enumerate(incoming):
        if not isinstance(field, dict):
            continue
        item = normalize_field_payload(field, (index + 1) * 10)
        if not item:
            continue
        label_key = item["label"].strip().lower()
        if label_key in seen_labels:
            continue
        seen_labels.add(label_key)
        normalized.append(item)

    with get_db(slug) as conn:
        existing_fields = get_form_fields(conn)
        existing_by_label = {field["label"].strip().lower(): field for field in existing_fields}
        keep_keys = []
        now = datetime.now(timezone.utc).isoformat()
        conn.execute("DELETE FROM form_fields")

        for index, item in enumerate(normalized):
            previous = existing_by_label.get(item["label"].strip().lower())
            key = previous["key"] if previous else stable_field_key(conn, item["label"], item.get("key"))
            keep_keys.append(key)
            ensure_lead_column(conn, key)
            conn.execute(
                """
                INSERT INTO form_fields (key, label, type, placeholder, required, position, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    key, item["label"], item["type"], item["placeholder"],
                    1 if item["required"] else 0, (index + 1) * 10, now,
                ),
            )

        for column in list(lead_columns(conn)):
            if column not in RESERVED_COLUMNS and column not in keep_keys:
                drop_lead_column(conn, column)

        conn.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
            ("form_initialized", "1"),
        )
        conn.commit()
        fields = get_form_fields(conn)
    return jsonify({"ok": True, "fields": fields})


@app.post("/<slug>/api/form-fields")
def add_form_field(slug):
    data = request.get_json(silent=True) or {}
    label = clean(data.get("label"))
    if not label:
        return jsonify({"error": "Vui lòng nhập tên trường."}), 400
    input_type = clean(data.get("type")) or "text"
    if input_type not in {"text", "tel", "email", "number", "date", "textarea"}:
        input_type = "text"
    placeholder = clean(data.get("placeholder"))
    required = bool(data.get("required"))
    now = datetime.now(timezone.utc).isoformat()
    with get_db(slug) as conn:
        key = unique_field_key(conn, label)
        max_pos = conn.execute("SELECT COALESCE(MAX(position), 0) FROM form_fields").fetchone()[0]
        conn.execute(
            """
            INSERT INTO form_fields (key, label, type, placeholder, required, position, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (key, label, input_type, placeholder, 1 if required else 0, max_pos + 10, now),
        )
        ensure_lead_column(conn, key)
        conn.commit()
        fields = get_form_fields(conn)
    return jsonify({"ok": True, "field": next(f for f in fields if f["key"] == key), "fields": fields}), 201


@app.patch("/<slug>/api/form-fields/<field_key>")
def update_form_field(slug, field_key):
    key = normalize_key(field_key)
    data = request.get_json(silent=True) or {}
    label = clean(data.get("label"))
    if not label:
        return jsonify({"error": "Vui lòng nhập tên trường."}), 400
    input_type = clean(data.get("type")) or "text"
    if input_type not in {"text", "tel", "email", "number", "date", "textarea"}:
        input_type = "text"
    placeholder = clean(data.get("placeholder"))
    required = bool(data.get("required"))

    with get_db(slug) as conn:
        row = conn.execute("SELECT key FROM form_fields WHERE key = ?", (key,)).fetchone()
        if not row:
            return jsonify({"error": "Không tìm thấy trường form."}), 404
        conn.execute(
            """
            UPDATE form_fields
            SET label = ?, type = ?, placeholder = ?, required = ?
            WHERE key = ?
            """,
            (label, input_type, placeholder, 1 if required else 0, key),
        )
        conn.commit()
        fields = get_form_fields(conn)
    return jsonify({"ok": True, "field": next(f for f in fields if f["key"] == key), "fields": fields})

@app.delete("/<slug>/api/form-fields/<field_key>")
def delete_form_field(slug, field_key):
    key = normalize_key(field_key)
    if key in RESERVED_COLUMNS:
        return jsonify({"error": "Không thể xoá cột hệ thống."}), 400
    with get_db(slug) as conn:
        row = conn.execute("SELECT key FROM form_fields WHERE key = ?", (key,)).fetchone()
        if not row:
            return jsonify({"error": "Không tìm thấy trường form."}), 404
        conn.execute("DELETE FROM form_fields WHERE key = ?", (key,))
        drop_lead_column(conn, key)
        conn.commit()
        fields = get_form_fields(conn)
    return jsonify({"ok": True, "fields": fields})


@app.get("/<slug>/api/leads")
def list_leads(slug):
    with get_db(slug) as conn:
        fields = get_form_fields(conn)
        columns = ["id", "ts"] + [field["key"] for field in fields]
        select_sql = ", ".join(quote_ident(col) for col in columns)
        rows = conn.execute(f"SELECT {select_sql} FROM leads ORDER BY ts DESC").fetchall()
    return jsonify({"fields": fields, "leads": [dict(row) for row in rows]})


@app.post("/<slug>/api/leads")
def create_lead(slug):
    data = request.get_json(silent=True) or {}
    with get_db(slug) as conn:
        fields = get_form_fields(conn)
        values = {field["key"]: clean(data.get(field["key"])) for field in fields}
        missing = [field["label"] for field in fields if field["required"] and not values.get(field["key"])]
        if missing:
            return jsonify({"error": "Vui lòng nhập: " + ", ".join(missing)}), 400
        lead = {"id": str(uuid.uuid4()), "ts": datetime.now(timezone.utc).isoformat(), **values}
        columns = ["id", *[field["key"] for field in fields], "ts"]
        placeholders = ", ".join("?" for _ in columns)
        insert_sql = f"INSERT INTO leads ({', '.join(quote_ident(col) for col in columns)}) VALUES ({placeholders})"
        conn.execute(insert_sql, [lead.get(col, "") for col in columns])
        conn.commit()
    return jsonify({"lead": lead, "fields": fields}), 201


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
    normalized = normalize_slug(path)
    if normalized == path and is_valid_slug(path):
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
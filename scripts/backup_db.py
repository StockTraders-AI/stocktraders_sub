#!/usr/bin/env python3
"""Backup service for the edit_landing page-manager SQLite databases.

edit_landing (landing/edit_landing) is the Flask page manager used to
edit content for several landing pages, each with its own SQLite file
under data/ plus a shared leads.db. This walks that subfolder only for
every *.db file and backs each one up under a name derived from its
relative path, so files with the same basename don't collide.

Runs as a long-lived process (systemd/pm2), not via cron. On startup it
takes a backup immediately, then schedules one every day at 00:00. Old
backups (older than RETENTION_DAYS) are pruned after each run.
"""
import gzip
import logging
import shutil
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

from apscheduler.schedulers.blocking import BlockingScheduler

PROJECT_ROOT = Path(__file__).resolve().parent.parent / "landing" / "edit_landing"
BACKUP_DIR = Path("/root/db-backups/stocktraders-landing-edit_landing")
RETENTION_DAYS = 365

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(BACKUP_DIR / "backup.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("backup_edit_landing")


def find_db_files() -> list[Path]:
    return sorted(PROJECT_ROOT.rglob("*.db"))


def safe_name(db_path: Path) -> str:
    rel = db_path.relative_to(PROJECT_ROOT).with_suffix("")
    return str(rel).replace("/", "__").replace("\\", "__")


def prune_old_backups() -> None:
    cutoff = datetime.now() - timedelta(days=RETENTION_DAYS)
    for f in BACKUP_DIR.glob("*.sqlite.gz"):
        if datetime.fromtimestamp(f.stat().st_mtime) < cutoff:
            f.unlink()
            log.info("Da xoa backup qua han: %s", f.name)


def backup_one(db_path: Path, stamp: str) -> None:
    name = safe_name(db_path)
    tmp_sqlite = Path(f"/tmp/{name}_{stamp}.sqlite")
    final_gz = BACKUP_DIR / f"{name}_{stamp}.sqlite.gz"

    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    try:
        conn.execute(f"VACUUM INTO '{tmp_sqlite}'")
    finally:
        conn.close()

    with open(tmp_sqlite, "rb") as src, gzip.open(final_gz, "wb", compresslevel=9) as dst:
        shutil.copyfileobj(src, dst)
    tmp_sqlite.unlink(missing_ok=True)
    log.info("Backup xong: %s", final_gz)


def backup_job() -> None:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y-%m-%d")
    db_files = find_db_files()
    if not db_files:
        log.warning("Khong tim thay file .db nao trong %s", PROJECT_ROOT)
        return

    for db_path in db_files:
        try:
            backup_one(db_path, stamp)
        except Exception:
            log.exception("Backup that bai: %s", db_path)
    prune_old_backups()


def main() -> None:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_job()  # chay ngay 1 lan khi service khoi dong

    scheduler = BlockingScheduler(timezone="Asia/Ho_Chi_Minh")
    scheduler.add_job(backup_job, "cron", hour=0, minute=0)
    log.info("Backup service da khoi dong, lich chay moi ngay 00:00")
    scheduler.start()


if __name__ == "__main__":
    main()

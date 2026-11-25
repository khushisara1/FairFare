"""Database configuration and session management for SQLite via SQLAlchemy 2.0."""

import os
from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fairfare_trip_splitter.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""


@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, _connection_record) -> None:
    """Enforce SQLite foreign key constraints on every connection."""
    if DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def create_db_and_tables() -> None:
    """Create all database tables if they do not exist."""
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    if DATABASE_URL.startswith("sqlite"):
        with engine.begin() as conn:
            cols = conn.exec_driver_sql("PRAGMA table_info(member)").fetchall()
            col_names = {row[1] for row in cols}
            if "user_id" not in col_names:
                conn.exec_driver_sql(
                    "ALTER TABLE member ADD COLUMN user_id INTEGER REFERENCES user(id) ON DELETE SET NULL"
                )


def get_session() -> Generator[Session, None, None]:
    """Yield a scoped SQLAlchemy session per request."""
    with SessionLocal() as session:
        yield session

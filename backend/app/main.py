"""FastAPI application entrypoint for FairFare – Trip Splitter."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal, create_db_and_tables
from app.routers import trips, users
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Initialize SQLite tables and seed synthetic trips if empty."""
    create_db_and_tables()
    with SessionLocal() as session:
        seed_if_empty(session)
    yield


app = FastAPI(
    title="FairFare – Trip Splitter API",
    version="0.1.0",
    description="Zero-sum integer-cent trip expense splitting and minimum-payment settlement API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(trips.router)
app.include_router(users.router)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Simple healthcheck endpoint."""
    return {"status": "ok", "service": "fairfare-trip-splitter"}

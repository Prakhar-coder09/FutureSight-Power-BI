import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.config import settings
from app.db.database import engine, Base, SessionLocal
from app.data.ingestion import load_or_initialize_dataset
from app.api.router import api_router

# Import modular route handlers
from routes.forecast import router as forecast_router
from routes.dashboard import router as dashboard_router
from routes.war_room import router as war_room_router
from routes.copilot import router as copilot_router
from routes.decisions import router as decisions_router
from routes.scenarios import router as scenarios_router
from routes.tasks import router as tasks_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default canonical OJ dataset
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        load_or_initialize_dataset(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Future-Sight AI — Enterprise Decision Cockpit & War Room",
    version=settings.VERSION,
    description="See Next Month. Simulate What-If. Act Before Impact.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Register main API router
app.include_router(api_router, prefix=settings.API_PREFIX)

# 2. Register modular route modules under API prefix
app.include_router(forecast_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(war_room_router, prefix=settings.API_PREFIX)
app.include_router(copilot_router, prefix=settings.API_PREFIX)
app.include_router(decisions_router, prefix=settings.API_PREFIX)
app.include_router(scenarios_router, prefix=settings.API_PREFIX)
app.include_router(tasks_router, prefix=settings.API_PREFIX)

@app.get("/health")
def healthcheck():
    return {
        "status": "HEALTHY",
        "service": "Future-Sight AI",
        "version": settings.VERSION
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to Future-Sight AI API Gateway",
        "docs_url": "/docs",
        "api_v1": settings.API_PREFIX
    }

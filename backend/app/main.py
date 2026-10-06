from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.db.database import engine, Base, SessionLocal
from app.data.ingestion import load_or_initialize_dataset
from app.api.router import api_router

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
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Decision Cockpit: See Next Month. Simulate What-If. Act Before Impact.",
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

app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/health")
def healthcheck():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to BusinessSight AI API Gateway",
        "docs_url": "/docs",
        "api_v1": settings.API_PREFIX
    }

import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "data_storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "BusinessSight AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Storage and DB
    STORAGE_PATH: str = str(STORAGE_DIR)
    DATABASE_URL: str = f"sqlite:///{STORAGE_DIR / 'businesssight.db'}"
    DEFAULT_DATASET_CSV: str = str(STORAGE_DIR / "oj_sales_simulated.csv")
    
    # OJ simulation defaults
    NUM_STORES_SAMPLE: int = 50  # Balanced sample of stores for high-responsiveness demo (can be scaled)
    TOTAL_WEEKS: int = 121
    
    # Financial Cockpit defaults
    DEFAULT_GROSS_MARGIN_PCT: float = 0.42
    DEFAULT_OPEX_PCT: float = 0.18
    DEFAULT_LOGISTICS_COST_PER_UNIT: float = 0.15
    DEFAULT_ADVERT_COST_PER_RUN: float = 350.0
    DEFAULT_WASTAGE_PCT: float = 0.025

    # Privacy Vault
    COLLABORATION_K_ANONYMITY_THRESHOLD: int = 10

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()

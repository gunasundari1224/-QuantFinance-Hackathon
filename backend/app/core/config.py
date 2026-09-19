import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Quantitative Multi-Asset Financial Intelligence & Backtesting Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "*"]
    
    # Seed data directory
    SEED_DATA_DIR: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "data", "seed_data")
    )
    
    class Config:
        case_sensitive = True

settings = Settings()

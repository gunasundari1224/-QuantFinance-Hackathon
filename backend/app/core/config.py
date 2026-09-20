import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Explicitly load backend .env file if present
ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(ENV_PATH)

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
    
    # Gemini API settings
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# backend/app/core/config.py
# Purpose: Environment variable configuration management using Pydantic Settings.
# Enforces validation and ensures Neon database URLs meet SSL and dialect requirements.

from typing import Any, List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Inventory & Order Management System"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "dev_secret_key_for_local_testing_only"

    # CORS configuration: Parses comma-separated strings or lists
    BACKEND_CORS_ORIGINS: Union[List[str], str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        return []

    # Neon PostgreSQL connection string (Reads directly from environment)
    # The Pydantic validator below ensures the connection is configured correctly.
    DATABASE_URL: str

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            raise ValueError("DATABASE_URL environment variable is required")
            
        # 1. SQLAlchemy 2.0 strictly requires 'postgresql://' instead of legacy 'postgres://'
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
            
        # 2. Neon requires SSL connections. Ensure 'sslmode=require' is present for neon.tech URLs
        if "neon.tech" in v and "sslmode=" not in v:
            separator = "&" if "?" in v else "?"
            v = f"{v}{separator}sslmode=require"
            
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

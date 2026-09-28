import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Customer Relationship & Service Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "banking-crm-enterprise-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Primary DB URL (MySQL), fallback handles SQLite if MySQL server is unreachable
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/crm_db")
    SQLITE_FALLBACK_URL: str = "sqlite:///./crm.db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

import os
import pymysql
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# MySQL Database connection configuration
MYSQL_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/srm_erp")
SQLITE_URL = "sqlite:///./srm_erp.db"

engine = None

# Try connecting to MySQL first
try:
    temp_engine = create_engine(MYSQL_URL, pool_pre_ping=True)
    with temp_engine.connect() as conn:
        pass
    engine = temp_engine
    print("[DB] Connected successfully to MySQL database 'srm_erp'.")
except Exception as e:
    print(f"[DB] MySQL connection failed ({e}). Falling back to SQLite database 'srm_erp.db'...")
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

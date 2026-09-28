import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# MySQL Database connection configuration with SQLite fallback
MYSQL_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/srm_erp")
SQLITE_URL = os.getenv("SQLITE_URL", "sqlite:///./extra_curricular.db")

engine = None

try:
    temp_engine = create_engine(MYSQL_URL, pool_pre_ping=True)
    with temp_engine.connect() as conn:
        pass
    engine = temp_engine
    print("[DB:ExtraCurricular] Connected successfully to MySQL database 'srm_erp'.")
except Exception as e:
    print(f"[DB:ExtraCurricular] MySQL connection fallback to SQLite 'extra_curricular.db' ({e})")
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

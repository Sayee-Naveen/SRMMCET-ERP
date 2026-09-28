import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "srm_erp.db")

# MySQL Database connection configuration
MYSQL_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/srm_erp")
SQLITE_URL = f"sqlite:///{DB_PATH}"

engine = None

# Try connecting to MySQL if pymysql is available
try:
    import pymysql
    temp_engine = create_engine(MYSQL_URL, pool_pre_ping=True)
    with temp_engine.connect() as conn:
        pass
    engine = temp_engine
    print("[DB] Connected successfully to MySQL database 'srm_erp'.")
except Exception as e:
    print(f"[DB] MySQL unavailable ({e}). Using SQLite database 'srm_erp.db'...")
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

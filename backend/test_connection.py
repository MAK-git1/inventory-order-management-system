# backend/test_connection.py
# Purpose: Basic Python utility to verify database connectivity.

import sys
import os
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

# Append current directory to search path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

try:
    from app.core.config import settings
    from app.core.database import engine
    from sqlalchemy import text
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Please make sure you have installed requirements via: pip install -r requirements.txt")
    sys.exit(1)

def test_connection():
    print("--------------------------------------------------")
    print("Checking database configuration parameters...")
    print(f"Project Name: {settings.PROJECT_NAME}")
    print(f"Environment:  {settings.ENVIRONMENT}")
    print(f"Database URL: {settings.DATABASE_URL.split('@')[-1] if settings.DATABASE_URL else 'None'}")
    print("--------------------------------------------------")
    
    print("Attempting to connect to Neon PostgreSQL database...")
    try:
        # Establish connection check
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            postgres_version = result.scalar()
            print("\n[SUCCESS] Connection successfully established!")
            print(f"PostgreSQL Version:\n{postgres_version}\n")
    except Exception as err:
        print("\n[FAILURE] Connection failed!")
        print(f"Error Details: {err}")
        print("\nTroubleshooting tips:")
        print("1. Confirm that your DATABASE_URL in '.env' matches the connection details copied from Neon.")
        print("2. Verify that Neon is active (not paused).")
        print("3. Ensure that your internet connection permits access on port 5432.")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import sys

# Add parent directory to path to import models
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from models.models import Interaction

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_db():
    db = SessionLocal()
    try:
        interactions = db.query(Interaction).all()
        print(f"Total interactions in DB: {len(interactions)}")
        for i in interactions:
            print(f"ID: {i.id}, HCP: {i.hcp_name}, Date: {i.date}, Topics: {i.topics_discussed[:30] if i.topics_discussed else 'None'}...")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()

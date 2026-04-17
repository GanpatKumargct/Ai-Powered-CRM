import sys
import os

sys.path.append('e:/Ai Powered CRM/backend')

from database.database import engine
from models.models import Base

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Database schema dropped and recreated successfully.")

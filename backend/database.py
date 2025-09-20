# backend/database.py
import motor.motor_asyncio
from pymongo import ASCENDING
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client["nuri_section_db"]

async def init_indexes():
    """Bazadagi kerakli indexlarni yaratish."""
    # Projects
    await db.projects.create_index([("created_at", ASCENDING)])
    await db.projects.create_index([("name", ASCENDING)], unique=False)
    # Reports (results o'rniga)
    await db.reports.create_index([("created_at", ASCENDING)])
    await db.reports.create_index([("project_id", ASCENDING)])

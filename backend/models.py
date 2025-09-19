from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


# -----------------------------
#  Point modeli (nuqtalar)
# -----------------------------
class Point(BaseModel):
    x: float
    y: float
    z: float


# -----------------------------
#  Project modeli (loyiha)
# -----------------------------
class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# -----------------------------
#  Report modeli (hisobot natijalari)
# -----------------------------
class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    strike: float
    dip: float
    dip_direction: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


# -----------------------------
#  API uchun kiruvchi so‘rov
# -----------------------------
class ReportRequest(BaseModel):
    project_id: str
    points: List[Point]


# -----------------------------
#  API javobi
# -----------------------------
class ReportResult(BaseModel):
    project_id: str
    strike: float
    dip: float
    dip_direction: float
    created_at: datetime

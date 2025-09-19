from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.database import db
from backend.models import Project, Report
from backend.services.report_engine import calculate_strike_dip
from datetime import datetime, timezone

app = FastAPI(title="Nuri3D Geologik API", version="1.0.0")

# === CORS middleware ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/projects")
async def create_project(project: Project):
    project_dict = project.model_dump(by_alias=True, exclude_none=True)
    result = await db["projects"].insert_one(project_dict)
    project_dict["_id"] = str(result.inserted_id)
    return project_dict

@app.get("/api/projects")
async def get_projects():
    projects = []
    cursor = db["projects"].find()
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        projects.append(doc)
    return projects

@app.post("/api/generate-report")
async def generate_report(payload: dict):
    points = payload.get("points")
    if not points or len(points) != 3:
        raise HTTPException(status_code=400, detail="3 ta nuqta yuborishingiz kerak")

    try:
        strike, dip, dip_dir = calculate_strike_dip(points)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    report_data = {
        "project_id": payload.get("project_id"),
        "strike": strike,
        "dip": dip,
        "dip_direction": dip_dir,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db["reports"].insert_one(report_data)
    report_data["_id"] = str(result.inserted_id)
    return report_data

@app.get("/api/reports")
async def get_reports():
    reports = []
    cursor = db["reports"].find()
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        reports.append(doc)
    return reports

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
from .database import db, init_indexes
import io
import pandas as pd
import numpy as np
from fastapi.responses import StreamingResponse, JSONResponse

app = FastAPI(title="NuriSection 3D GeoAnalyser", version="1.0")

# ==== CORS ====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_indexes()

# ==== MODELLAR ====
class ProjectCreate(BaseModel):
    name: str
    description: str = ""

class Point(BaseModel):
    x: float
    y: float
    z: float

class ThreePointInput(BaseModel):
    project_id: str
    points: List[Point]

# ==== ENDPOINTLAR ====
@app.post("/api/projects")
async def create_project(data: ProjectCreate):
    new_project = {
        "name": data.name,
        "description": data.description,
        "created_at": datetime.utcnow(),
    }
    result = await db.projects.insert_one(new_project)
    return {"id": str(result.inserted_id), "message": "Project created"}

@app.get("/api/projects")
async def list_projects():
    projects = []
    async for p in db.projects.find({}).sort("created_at", -1):
        p["_id"] = str(p["_id"])
        projects.append(p)
    return projects

@app.post("/api/analyze/three-point")
async def three_point(data: ThreePointInput):
    if len(data.points) != 3:
        raise HTTPException(400, detail="Exactly 3 points required.")

    p1, p2, p3 = np.array([[p.x, p.y, p.z] for p in data.points])
    v1, v2 = p2 - p1, p3 - p1
    normal = np.cross(v1, v2)

    strike = (np.degrees(np.arctan2(normal[1], normal[0])) + 360) % 360
    dip = np.degrees(np.arccos(abs(normal[2]) / np.linalg.norm(normal)))
    dip_direction = (strike + 90) % 360

    result = {
        "project_id": data.project_id,
        "strike": round(strike, 2),
        "dip": round(dip, 2),
        "dip_direction": round(dip_direction, 2),
        "created_at": datetime.utcnow()
    }

    await db.results.insert_one(result)
    return result

@app.get("/api/results")
async def get_results():
    results = []
    async for r in db.results.find({}).sort("created_at", -1):
        r["_id"] = str(r["_id"])
        results.append(r)
    return results

@app.get("/api/results/export/{fmt}")
async def export_results(fmt: str):
    data = []
    async for r in db.results.find({}).sort("created_at", -1):
        data.append({
            "project_id": r.get("project_id", ""),
            "strike": r["strike"],
            "dip": r["dip"],
            "dip_direction": r["dip_direction"],
            "created_at": r["created_at"],
        })
    if not data:
        raise HTTPException(404, detail="No results to export")

    df = pd.DataFrame(data)

    if fmt == "csv":
        stream = io.BytesIO()
        df.to_csv(stream, index=False)
        stream.seek(0)
        return StreamingResponse(stream, media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=results.csv"})
    elif fmt == "json":
        return JSONResponse(content=data)
    elif fmt == "pdf":
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        pdf_stream = io.BytesIO()
        doc = SimpleDocTemplate(pdf_stream, pagesize=A4)
        table_data = [["Project", "Strike", "Dip", "Dip Dir", "Created At"]]
        for r in data:
            table_data.append([
                r["project_id"], r["strike"], r["dip"], r["dip_direction"],
                str(r["created_at"])
            ])
        table = Table(table_data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightblue),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        doc.build([table])
        pdf_stream.seek(0)
        return StreamingResponse(pdf_stream, media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=results.pdf"})
    else:
        raise HTTPException(400, detail="Format not supported")

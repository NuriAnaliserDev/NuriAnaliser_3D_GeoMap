from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from backend.database import db, init_indexes
import io
import pandas as pd
import numpy as np
from fastapi.responses import StreamingResponse, JSONResponse
from bson import ObjectId
import hashlib
import secrets
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_indexes()
    yield
    # Shutdown
    pass

app = FastAPI(title="NuriSection 3D GeoAnalyser", version="1.0", lifespan=lifespan)

# ==== CORS ====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# ==== AUTH FUNCTIONS ====
security = HTTPBearer()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_token() -> str:
    return secrets.token_urlsafe(32)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user = await db.users.find_one({"token": token})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# ==== ENDPOINTLAR ====

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Foydalanuvchi mavjudligini tekshirish
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(400, detail="Username already registered")
    
    # Yangi foydalanuvchi yaratish
    hashed_password = hash_password(user.password)
    token = create_token()
    
    user_data = {
        "username": user.username,
        "password": hashed_password,
        "token": token,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_data)
    
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    # Foydalanuvchini topish
    db_user = await db.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(401, detail="Invalid username or password")
    
    # Yangi token yaratish
    token = create_token()
    await db.users.update_one(
        {"username": user.username}, 
        {"$set": {"token": token}}
    )
    
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/projects")
async def create_project(data: ProjectCreate, current_user = Depends(get_current_user)):
    new_project = {
        "name": data.name,
        "description": data.description,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.projects.insert_one(new_project)
    return {"id": str(result.inserted_id), "message": "Project created"}

@app.get("/api/projects")
async def list_projects(current_user = Depends(get_current_user)):
    projects = []
    async for p in db.projects.find({}).sort("created_at", -1):
        p["_id"] = str(p["_id"])
        projects.append(p)
    return projects

@app.post("/api/analyze/three-point")
async def three_point(data: ThreePointInput, current_user = Depends(get_current_user)):
    if len(data.points) != 3:
        raise HTTPException(400, detail="Exactly 3 points required.")

    # 3 ta nuqta koordinatalarini numpy massiviga o'tkazamiz
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
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    insert_result = await db.reports.insert_one(result)
    result["_id"] = str(insert_result.inserted_id)
    return result

@app.post("/api/analyze/upload-csv")
async def upload_csv(file: UploadFile = File(...), project_id: str = "default", current_user = Depends(get_current_user)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, detail="Faqat CSV fayllar qabul qilinadi")
    
    try:
        # CSV faylni o'qish
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # CSV formatini tekshirish (x, y, z ustunlari kerak)
        required_columns = ['x', 'y', 'z']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(400, detail="CSV faylda x, y, z ustunlari bo'lishi kerak")
        
        results = []
        
        # Har 3 ta qatorni guruhlab, nuqtalarni hisoblash
        for i in range(0, len(df) - 2, 3):
            if i + 2 < len(df):
                points = [
                    {"x": float(df.iloc[i]['x']), "y": float(df.iloc[i]['y']), "z": float(df.iloc[i]['z'])},
                    {"x": float(df.iloc[i+1]['x']), "y": float(df.iloc[i+1]['y']), "z": float(df.iloc[i+1]['z'])},
                    {"x": float(df.iloc[i+2]['x']), "y": float(df.iloc[i+2]['y']), "z": float(df.iloc[i+2]['z'])}
                ]
                
                # Strike, dip hisoblash
                p1, p2, p3 = np.array([[p['x'], p['y'], p['z']] for p in points])
                v1, v2 = p2 - p1, p3 - p1
                normal = np.cross(v1, v2)
                
                strike = (np.degrees(np.arctan2(normal[1], normal[0])) + 360) % 360
                dip = np.degrees(np.arccos(abs(normal[2]) / np.linalg.norm(normal)))
                dip_direction = (strike + 90) % 360
                
                result = {
                    "project_id": project_id,
                    "strike": round(strike, 2),
                    "dip": round(dip, 2),
                    "dip_direction": round(dip_direction, 2),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "points": points
                }
                
                await db.reports.insert_one(result)
                results.append(result)
        
        return {
            "message": f"{len(results)} ta natija hisoblandi va saqlandi",
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(400, detail=f"CSV faylni qayta ishlashda xatolik: {str(e)}")

@app.get("/api/results")
async def get_results(current_user = Depends(get_current_user)):
    results = []
    async for r in db.reports.find({}).sort("created_at", -1):
        r["_id"] = str(r["_id"])
        results.append(r)
    return results

@app.get("/api/results/export/{fmt}")
async def export_results(fmt: str):
    data = []
    async for r in db.reports.find({}).sort("created_at", -1):
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
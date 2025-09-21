"""
Integration testlar - MongoDB bilan real aloqa
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from server import app
from backend.database import db, init_indexes
import motor.motor_asyncio
from datetime import datetime, timezone


class TestMongoDBIntegration:
    """MongoDB integration testlari"""
    
    @pytest.fixture
    def client(self):
        """Test client yaratish"""
        return TestClient(app)
    
    @pytest.fixture
    async def test_db(self):
        """Test MongoDB database yaratish"""
        # Test uchun alohida database
        test_client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
        test_db = test_client["nuri3d_test_db"]
        
        # Indexlarni yaratish
        await init_indexes()
        
        yield test_db
        
        # Test tugagach, test databaseni tozalash
        await test_client.drop_database("nuri3d_test_db")
        test_client.close()
    
    @pytest.fixture
    def auth_headers(self, client):
        """Authentication headers yaratish"""
        user_data = {"username": "testuser", "password": "testpass123"}
        client.post("/api/auth/register", json=user_data)
        
        response = client.post("/api/auth/login", json=user_data)
        token = response.json()["access_token"]
        
        return {"Authorization": f"Bearer {token}"}
    
    def test_database_connection(self, test_db):
        """Database ulanishini tekshirish"""
        # Ping test
        result = asyncio.run(test_db.command("ping"))
        assert result["ok"] == 1
    
    def test_index_creation(self, test_db):
        """Indexlarni yaratish testi"""
        # Indexlarni tekshirish
        projects_indexes = asyncio.run(test_db.projects.list_indexes().to_list(None))
        reports_indexes = asyncio.run(test_db.reports.list_indexes().to_list(None))
        
        # created_at indexlari mavjud bo'lishi kerak
        project_created_at_exists = any(
            "created_at" in str(index) for index in projects_indexes
        )
        reports_created_at_exists = any(
            "created_at" in str(index) for index in reports_indexes
        )
        
        assert project_created_at_exists
        assert reports_created_at_exists
    
    def test_project_creation_and_retrieval(self, client, auth_headers):
        """Loyiha yaratish va olish testi"""
        project_data = {
            "name": "Test Project",
            "description": "Test loyiha tavsifi"
        }
        
        # Loyiha yaratish
        response = client.post(
            "/api/projects/create",
            json=project_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        project = response.json()
        
        assert project["name"] == "Test Project"
        assert project["description"] == "Test loyiha tavsifi"
        assert "id" in project
        assert "created_at" in project
        
        # Loyihalarni olish
        response = client.get("/api/projects/list", headers=auth_headers)
        
        assert response.status_code == 200
        projects = response.json()
        
        assert len(projects) >= 1
        assert any(p["name"] == "Test Project" for p in projects)
    
    def test_three_point_analysis_and_storage(self, client, auth_headers):
        """3-nuqta tahlili va saqlash testi"""
        analysis_data = {
            "project_id": "test_project",
            "points": [
                {"x": 0, "y": 0, "z": 100},
                {"x": 10, "y": 0, "z": 120},
                {"x": 0, "y": 10, "z": 110}
            ]
        }
        
        # Tahlil yaratish
        response = client.post(
            "/api/analyze/three-point",
            json=analysis_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        result = response.json()
        
        assert "strike" in result
        assert "dip" in result
        assert "dip_direction" in result
        assert "project_id" in result
        assert "created_at" in result
        
        # Natijalarni olish
        response = client.get(
            f"/api/results?project_id={analysis_data['project_id']}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        results = response.json()
        
        assert len(results) >= 1
        assert any(r["project_id"] == "test_project" for r in results)
    
    def test_csv_upload_and_storage(self, client, auth_headers):
        """CSV yuklash va saqlash testi"""
        import io
        import pandas as pd
        
        # Test CSV yaratish
        test_data = {
            'x': [0, 10, 0, 5, 15, 5],
            'y': [0, 0, 10, 5, 5, 15],
            'z': [100, 120, 110, 105, 125, 115]
        }
        
        df = pd.DataFrame(test_data)
        csv_content = df.to_csv(index=False)
        csv_file = io.BytesIO(csv_content.encode('utf-8'))
        
        # CSV yuklash
        response = client.post(
            "/api/analyze/upload-csv",
            files={"file": ("test.csv", csv_file, "text/csv")},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["results"]) == 2  # 6 nuqta = 2 ta 3-nuqta guruhi
        
        # Har bir natija database da saqlanganligini tekshirish
        for result in data["results"]:
            assert "strike" in result
            assert "dip" in result
            assert "dip_direction" in result
            assert "created_at" in result
    
    def test_export_functionality(self, client, auth_headers):
        """Eksport funksiyasi testi"""
        # Avval ba'zi ma'lumotlar yaratish
        analysis_data = {
            "project_id": "export_test",
            "points": [
                {"x": 0, "y": 0, "z": 100},
                {"x": 10, "y": 0, "z": 120},
                {"x": 0, "y": 10, "z": 110}
            ]
        }
        
        client.post(
            "/api/analyze/three-point",
            json=analysis_data,
            headers=auth_headers
        )
        
        # CSV eksport
        response = client.get(
            "/api/results/export/csv",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        
        # JSON eksport
        response = client.get(
            "/api/results/export/json",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        
        # PDF eksport
        response = client.get(
            "/api/results/export/pdf",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
    
    def test_concurrent_operations(self, client, auth_headers):
        """Bir vaqtda bir nechta operatsiya testi"""
        import threading
        import time
        
        results = []
        errors = []
        
        def create_analysis(i):
            """Tahlil yaratish funksiyasi"""
            try:
                analysis_data = {
                    "project_id": f"concurrent_test_{i}",
                    "points": [
                        {"x": i, "y": i, "z": 100 + i},
                        {"x": i + 10, "y": i, "z": 120 + i},
                        {"x": i, "y": i + 10, "z": 110 + i}
                    ]
                }
                
                response = client.post(
                    "/api/analyze/three-point",
                    json=analysis_data,
                    headers=auth_headers
                )
                
                if response.status_code == 200:
                    results.append(response.json())
                else:
                    errors.append(f"Error in analysis {i}: {response.status_code}")
                    
            except Exception as e:
                errors.append(f"Exception in analysis {i}: {str(e)}")
        
        # 5 ta parallel operatsiya
        threads = []
        for i in range(5):
            thread = threading.Thread(target=create_analysis, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Barcha threadlarni kutish
        for thread in threads:
            thread.join()
        
        # Natijalarni tekshirish
        assert len(errors) == 0, f"Errors occurred: {errors}"
        assert len(results) == 5
        
        # Har bir natija to'g'ri bo'lishi kerak
        for result in results:
            assert "strike" in result
            assert "dip" in result
            assert "dip_direction" in result


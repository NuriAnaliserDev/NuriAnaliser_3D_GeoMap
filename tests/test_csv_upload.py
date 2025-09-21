"""
CSV Upload funksiyalarini test qilish
"""
import pytest
import io
import pandas as pd
from fastapi.testclient import TestClient
from server import app
import tempfile
import os


class TestCSVUpload:
    """CSV Upload testlari"""
    
    @pytest.fixture
    def client(self):
        """Test client yaratish"""
        return TestClient(app)
    
    @pytest.fixture
    def auth_headers(self, client):
        """Authentication headers yaratish"""
        # Test foydalanuvchi yaratish
        user_data = {"username": "testuser", "password": "testpass123"}
        client.post("/api/auth/register", json=user_data)
        
        # Login va token olish
        response = client.post("/api/auth/login", json=user_data)
        token = response.json()["access_token"]
        
        return {"Authorization": f"Bearer {token}"}
    
    def create_test_csv(self, data):
        """Test CSV fayli yaratish"""
        df = pd.DataFrame(data)
        csv_content = df.to_csv(index=False)
        return io.BytesIO(csv_content.encode('utf-8'))
    
    def test_valid_csv_upload(self, client, auth_headers):
        """To'g'ri CSV fayl yuklash"""
        # Test ma'lumotlari
        test_data = {
            'x': [0, 10, 0, 5, 15, 5],
            'y': [0, 0, 10, 5, 5, 15], 
            'z': [100, 120, 110, 105, 125, 115]
        }
        
        csv_file = self.create_test_csv(test_data)
        
        response = client.post(
            "/api/analyze/upload-csv",
            files={"file": ("test.csv", csv_file, "text/csv")},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "results" in data
        assert len(data["results"]) == 2  # 6 nuqta = 2 ta 3-nuqta guruhi
        
        # Har bir natija uchun tekshirish
        for result in data["results"]:
            assert "strike" in result
            assert "dip" in result
            assert "dip_direction" in result
            assert "points" in result
            assert len(result["points"]) == 3
    
    def test_csv_with_wrong_columns(self, client, auth_headers):
        """Noto'g'ri ustunlar bilan CSV"""
        test_data = {
            'lat': [0, 10, 0],
            'lon': [0, 0, 10],
            'elevation': [100, 120, 110]
        }
        
        csv_file = self.create_test_csv(test_data)
        
        response = client.post(
            "/api/analyze/upload-csv",
            files={"file": ("test.csv", csv_file, "text/csv")},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "x, y, z ustunlari bo'lishi kerak" in data["detail"]
    
    def test_csv_with_insufficient_points(self, client, auth_headers):
        """Yetarli bo'lmagan nuqtalar bilan CSV"""
        test_data = {
            'x': [0, 10],
            'y': [0, 0],
            'z': [100, 120]
        }
        
        csv_file = self.create_test_csv(test_data)
        
        response = client.post(
            "/api/analyze/upload-csv",
            files={"file": ("test.csv", csv_file, "text/csv")},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 0  # Hech qanday natija bo'lmasligi kerak
    
    def test_csv_with_invalid_data(self, client, auth_headers):
        """Noto'g'ri ma'lumotlar bilan CSV"""
        test_data = {
            'x': [0, 10, 0],
            'y': [0, 0, 10],
            'z': ['invalid', 120, 110]  # Noto'g'ri ma'lumot turi
        }
        
        csv_file = self.create_test_csv(test_data)
        
        response = client.post(
            "/api/analyze/upload-csv",
            files={"file": ("test.csv", csv_file, "text/csv")},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "CSV faylni qayta ishlashda xatolik" in data["detail"]
    
    def test_non_csv_file(self, client, auth_headers):
        """CSV bo'lmagan fayl yuklash"""
        # Text fayl yaratish
        text_content = "Bu CSV fayl emas"
        text_file = io.BytesIO(text_content.encode('utf-8'))
        
        response = client.post(
            "/api/analyze/upload-csv",
            files={"file": ("test.txt", text_file, "text/plain")},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "Faqat CSV fayllar qabul qilinadi" in data["detail"]
    
    def test_upload_without_authentication(self, client):
        """Authentication siz yuklash"""
        test_data = {
            'x': [0, 10, 0],
            'y': [0, 0, 10],
            'z': [100, 120, 110]
        }
        
        csv_file = self.create_test_csv(test_data)
        
        response = client.post(
            "/api/analyze/upload-csv",
            files={"file": ("test.csv", csv_file, "text/csv")}
        )
        
        assert response.status_code == 403  # Forbidden
    
    def test_large_csv_file(self, client, auth_headers):
        """Katta CSV fayl yuklash"""
        # 100 ta nuqta yaratish (33 ta 3-nuqta guruhi)
        n_points = 99  # 3 ga bo'linadigan son
        test_data = {
            'x': [i for i in range(n_points)],
            'y': [i * 0.5 for i in range(n_points)],
            'z': [100 + i * 0.1 for i in range(n_points)]
        }
        
        csv_file = self.create_test_csv(test_data)
        
        response = client.post(
            "/api/analyze/upload-csv",
            files={"file": ("large_test.csv", csv_file, "text/csv")},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == n_points // 3  # 33 ta natija
    
    def test_csv_with_empty_rows(self, client, auth_headers):
        """Bo'sh qatorlar bilan CSV"""
        test_data = {
            'x': [0, 10, 0, None, 5, 15],
            'y': [0, 0, 10, None, 5, 5],
            'z': [100, 120, 110, None, 105, 125]
        }
        
        csv_file = self.create_test_csv(test_data)
        
        response = client.post(
            "/api/analyze/upload-csv",
            files={"file": ("test.csv", csv_file, "text/csv")},
            headers=auth_headers
        )
        
        # Bo'sh qatorlar tashlab ketilishi kerak
        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 2  # 5 ta to'g'ri nuqta = 1 ta 3-nuqta guruhi


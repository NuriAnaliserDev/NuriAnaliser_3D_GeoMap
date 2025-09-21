"""
Authentication funksiyalarini test qilish
"""
import pytest
from fastapi.testclient import TestClient
from server import app
from backend.database import db
import hashlib
import secrets


class TestAuthentication:
    """Authentication testlari"""
    
    @pytest.fixture
    def client(self):
        """Test client yaratish"""
        return TestClient(app)
    
    @pytest.fixture
    def test_user_data(self):
        """Test foydalanuvchi ma'lumotlari"""
        return {
            "username": "testuser",
            "password": "testpass123"
        }
    
    def test_password_hashing(self):
        """Parol hashlash testi"""
        from server import hash_password, verify_password
        
        password = "testpass123"
        hashed = hash_password(password)
        
        # Hash SHA256 formatida bo'lishi kerak
        assert len(hashed) == 64  # SHA256 hex length
        assert hashed.isalnum()
        
        # To'g'ri parol tekshiruvi
        assert verify_password(password, hashed) == True
        
        # Noto'g'ri parol tekshiruvi
        assert verify_password("wrongpass", hashed) == False
    
    def test_token_creation(self):
        """Token yaratish testi"""
        from server import create_token
        
        token = create_token()
        
        # Token URL-safe bo'lishi kerak
        assert isinstance(token, str)
        assert len(token) > 20  # Kifoya qadar uzun
        assert token.replace('-', '').replace('_', '').isalnum()
    
    def test_user_registration_success(self, client, test_user_data):
        """Muvaffaqiyatli ro'yxatdan o'tish"""
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
    
    def test_user_registration_duplicate(self, client, test_user_data):
        """Takroriy ro'yxatdan o'tish"""
        # Birinchi marta ro'yxatdan o'tish
        client.post("/api/auth/register", json=test_user_data)
        
        # Ikkinchi marta ro'yxatdan o'tish
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "Username already registered" in data["detail"]
    
    def test_user_login_success(self, client, test_user_data):
        """Muvaffaqiyatli kirish"""
        # Avval ro'yxatdan o'tish
        client.post("/api/auth/register", json=test_user_data)
        
        # Keyin kirish
        response = client.post("/api/auth/login", json=test_user_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
    
    def test_user_login_invalid_credentials(self, client):
        """Noto'g'ri ma'lumotlar bilan kirish"""
        invalid_data = {
            "username": "nonexistent",
            "password": "wrongpass"
        }
        
        response = client.post("/api/auth/login", json=invalid_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "Invalid username or password" in data["detail"]
    
    def test_protected_endpoint_without_token(self, client):
        """Token siz himoyalangan endpoint"""
        response = client.post("/api/analyze/three-point", json={
            "project_id": "test",
            "points": [
                {"x": 0, "y": 0, "z": 100},
                {"x": 10, "y": 0, "z": 120},
                {"x": 0, "y": 10, "z": 110}
            ]
        })
        
        assert response.status_code == 403  # Forbidden
    
    def test_protected_endpoint_with_valid_token(self, client, test_user_data):
        """To'g'ri token bilan himoyalangan endpoint"""
        # Ro'yxatdan o'tish va token olish
        register_response = client.post("/api/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]
        
        # Token bilan himoyalangan endpointga so'rov
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/analyze/three-point", 
                             json={
                                 "project_id": "test",
                                 "points": [
                                     {"x": 0, "y": 0, "z": 100},
                                     {"x": 10, "y": 0, "z": 120},
                                     {"x": 0, "y": 10, "z": 110}
                                 ]
                             },
                             headers=headers)
        
        assert response.status_code == 200
    
    def test_protected_endpoint_with_invalid_token(self, client):
        """Noto'g'ri token bilan himoyalangan endpoint"""
        headers = {"Authorization": "Bearer invalid_token_123"}
        response = client.post("/api/analyze/three-point", 
                             json={
                                 "project_id": "test",
                                 "points": [
                                     {"x": 0, "y": 0, "z": 100},
                                     {"x": 10, "y": 0, "z": 120},
                                     {"x": 0, "y": 10, "z": 110}
                                 ]
                             },
                             headers=headers)
        
        assert response.status_code == 401


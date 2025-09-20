
# tests/test_server.py
import pytest
from httpx import AsyncClient, ASGITransport
from server import app

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_three_point_analysis():
    payload = {
        "project_id": "test_project",
        "points": [
            {"x": 0, "y": 0, "z": 100},
            {"x": 10, "y": 0, "z": 120},
            {"x": 0, "y": 10, "z": 110}
        ]
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/analyze/three-point", json=payload)

    assert resp.status_code == 200, f"Xato javob: {resp.text}"
    data = resp.json()
    assert "strike" in data
    assert "dip" in data
    assert "dip_direction" in data

@pytest.mark.asyncio
async def test_three_point_invalid_points():
    """
    Bu test noto'g'ri nuqtalar soni yuborilganda 400 xatolik qaytishini tekshiradi.
    """
    payload = {
        "project_id": "test_project",
        "points": [
            {"x": 0, "y": 0, "z": 100},
            {"x": 10, "y": 0, "z": 120}
        ]
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/analyze/three-point", json=payload)

    assert resp.status_code == 400, f"422 yoki 500 chiqdi: {resp.text}"
    data = resp.json()
    # ✅ Backend qaytargan xabarning "detail" maydonini tekshiramiz
    assert "detail" in data
    assert "3 points required" in data["detail"]

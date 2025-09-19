import sys
import os

# Loyihaning root papkasini sys.path ga qo'shamiz
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


# tests/test_report_engine.py
import pytest
from backend.services.report_engine import calculate_strike_dip

def test_calculate_strike_dip_valid():
    # Uchta nuqta: x, y, z koordinatalar
    points = [
        (0, 0, 0),
        (10, 0, 0),
        (0, 10, -5)
    ]

    strike, dip, dip_dir = calculate_strike_dip(points)

    # Natija son bo'lishi kerak
    assert isinstance(strike, float)
    assert isinstance(dip, float)
    assert isinstance(dip_dir, float)

    # Dip burchagi 0 va 90° oralig'ida bo'lishi kerak
    assert 0 <= dip <= 90

def test_calculate_strike_dip_invalid_points():
    with pytest.raises(ValueError):
        calculate_strike_dip([(0, 0, 0), (1, 1, 1)])  # faqat 2 nuqta - xato

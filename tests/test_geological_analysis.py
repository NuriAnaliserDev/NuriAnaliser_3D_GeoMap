"""
Geological Analysis funksiyalarini test qilish
"""
import pytest
import numpy as np
from backend.services.geological_analysis import (
    calculate_structural_elements,
    create_geological_section,
    analyze_stratigraphic_column
)


class TestCalculateStructuralElements:
    """3-nuqta asosida strukturaviy elementlarni hisoblash testlari"""
    
    def test_valid_three_points(self):
        """To'g'ri 3 nuqta bilan test"""
        points = [
            [0, 0, 100],
            [10, 0, 120], 
            [0, 10, 110]
        ]
        
        result = calculate_structural_elements(points)
        
        assert "strike_azimuth" in result
        assert "dip_angle" in result
        assert "dip_azimuth" in result
        assert "strike_line" in result
        assert "dip_line" in result
        
        # Qiymatlar to'g'ri diapazonda bo'lishi kerak
        assert 0 <= result["strike_azimuth"] <= 360
        assert 0 <= result["dip_angle"] <= 90
        assert 0 <= result["dip_azimuth"] <= 360
    
    def test_invalid_points_count(self):
        """Noto'g'ri nuqtalar soni bilan test"""
        with pytest.raises(ValueError, match="Uchta nuqta kerak"):
            calculate_structural_elements([[0, 0, 0], [1, 1, 1]])
    
    def test_collinear_points(self):
        """Collinear nuqtalar bilan test"""
        points = [
            [0, 0, 0],
            [1, 1, 1],
            [2, 2, 2]
        ]
        
        # Collinear nuqtalar uchun dip burchagi 0 bo'lishi kerak
        result = calculate_structural_elements(points)
        assert result["dip_angle"] == 0.0
    
    def test_horizontal_plane(self):
        """Gorizontal tekislik testi"""
        points = [
            [0, 0, 100],
            [10, 0, 100],
            [0, 10, 100]
        ]
        
        result = calculate_structural_elements(points)
        assert result["dip_angle"] == 0.0
    
    def test_vertical_plane(self):
        """Vertikal tekislik testi"""
        points = [
            [0, 0, 0],
            [0, 0, 10],
            [10, 0, 0]
        ]
        
        result = calculate_structural_elements(points)
        assert result["dip_angle"] == 90.0


class TestCreateGeologicalSection:
    """Geologik kesma yaratish testlari"""
    
    def test_valid_section_creation(self):
        """To'g'ri kesma yaratish"""
        points = [
            [0, 0, 100],
            [10, 0, 120],
            [0, 10, 110]
        ]
        section_azimuth = 45
        
        result = create_geological_section(points, section_azimuth)
        
        assert "strike_azimuth" in result
        assert "dip_angle" in result
        assert "dip_azimuth" in result
        assert "section_azimuth" in result
        assert "apparent_dip_angle" in result
        assert "description" in result
        
        assert result["section_azimuth"] == 45
        assert 0 <= result["apparent_dip_angle"] <= 90
    
    def test_perpendicular_section(self):
        """Perpendikulyar kesma testi"""
        points = [
            [0, 0, 100],
            [10, 0, 120],
            [0, 10, 110]
        ]
        
        # Strike ga perpendikulyar kesma
        elements = calculate_structural_elements(points)
        section_azimuth = elements["strike_azimuth"] + 90
        
        result = create_geological_section(points, section_azimuth)
        
        # Perpendikulyar kesmada apparent dip = true dip
        assert abs(result["apparent_dip_angle"] - result["dip_angle"]) < 0.1


class TestAnalyzeStratigraphicColumn:
    """Stratigrafik ustun tahlili testlari"""
    
    def test_valid_layers(self):
        """To'g'ri qatlamlar bilan test"""
        layers = [
            {
                "name": "Layer A",
                "age": "Jurassic",
                "thickness": 100,
                "lithology": "Sandstone"
            },
            {
                "name": "Layer B", 
                "age": "Cretaceous",
                "thickness": 150,
                "lithology": "Limestone"
            }
        ]
        
        result = analyze_stratigraphic_column(layers)
        
        assert "total_thickness_of_column" in result
        assert "layers_analysis" in result
        assert "summary" in result
        
        assert result["total_thickness_of_column"] == 250
        assert len(result["layers_analysis"]) == 2
        
        # Har bir qatlam uchun tavsif mavjud bo'lishi kerak
        for layer_analysis in result["layers_analysis"]:
            assert "layer_name" in layer_analysis
            assert "age" in layer_analysis
            assert "thickness" in layer_analysis
            assert "lithology" in layer_analysis
            assert "description" in layer_analysis
    
    def test_empty_layers(self):
        """Bo'sh qatlamlar ro'yxati bilan test"""
        result = analyze_stratigraphic_column([])
        
        assert result["total_thickness_of_column"] == 0
        assert len(result["layers_analysis"]) == 0
        assert "summary" in result
    
    def test_missing_fields(self):
        """Yetishmayotgan maydonlar bilan test"""
        layers = [
            {
                "name": "Layer A",
                "thickness": 100
                # age va lithology yo'q
            }
        ]
        
        result = analyze_stratigraphic_column(layers)
        
        assert result["total_thickness_of_column"] == 100
        assert len(result["layers_analysis"]) == 1
        
        layer_analysis = result["layers_analysis"][0]
        assert layer_analysis["layer_name"] == "Layer A"
        assert layer_analysis["thickness"] == 100
        assert layer_analysis["age"] is None
        assert layer_analysis["lithology"] is None


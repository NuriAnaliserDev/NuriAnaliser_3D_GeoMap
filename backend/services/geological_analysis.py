# backend/services/geological_analysis.py
import numpy as np
import math

def calculate_diagonal_correction(strike, dip, diagonal_angle):
    """
    Diagonal yo'nalishdagi kesmada yotish burchagini tuzatish.
    
    Args:
        strike: Qatlamning yo'nalish burchagi (gradus)
        dip: Qatlamning yotish burchagi (gradus)  
        diagonal_angle: Diagonal yo'nalish burchagi (gradus)
    
    Returns:
        corrected_dip: Tuzatilgan yotish burchagi (gradus)
    """
    # Formulalar: tgφ = tgα * cosγ
    strike_rad = math.radians(strike)
    dip_rad = math.radians(dip)
    diagonal_rad = math.radians(diagonal_angle)
    
    # γ burchagini hisoblash (qatlam yo'nalishi bilan kesma yo'nalishi orasidagi burchak)
    gamma = abs(strike - diagonal_angle)
    if gamma > 90:
        gamma = 180 - gamma
    gamma_rad = math.radians(gamma)
    
    # Tuzatilgan yotish burchagi
    corrected_dip_rad = math.atan(math.tan(dip_rad) * math.cos(gamma_rad))
    corrected_dip = math.degrees(corrected_dip_rad)
    
    return round(corrected_dip, 2)

def calculate_structural_elements(points):
    """
    Qatlamning barcha strukturaviy elementlarini hisoblash.
    
    Args:
        points: [(x1, y1, z1), (x2, y2, z2), (x3, y3, z3)] - 3 ta nuqta
    
    Returns:
        dict: Barcha strukturaviy elementlar
    """
    if len(points) != 3:
        raise ValueError("Uchta nuqta kerak!")
    
    p1, p2, p3 = [np.array(p) for p in points]
    
    # Vektorlar
    v1 = p2 - p1
    v2 = p3 - p1
    normal = np.cross(v1, v2)
    
    # Normal vektor komponentlari
    a, b, c = normal
    
    # 1. Yo'nalish chizig'i (Strike)
    strike_rad = math.atan2(b, a)
    strike_deg = (math.degrees(strike_rad) + 360) % 360
    
    # 2. Yo'nalish azimuti (Strike Azimuth)
    strike_azimuth = strike_deg
    
    # 3. Yotish burchagi (Dip)
    dip_rad = math.atan(abs(c) / math.sqrt(a**2 + b**2))
    dip_deg = math.degrees(dip_rad)
    
    # 4. Yotish azimuti (Dip Direction)
    dip_direction = (strike_deg + 90) % 360
    
    # 5. Yotish chizig'i yo'nalishi
    # Yotish chizig'i yo'nalish chizig'iga perpendikulyar
    dip_line_direction = (strike_deg + 90) % 360
    
    # 6. Qatlamning qiyalik yo'nalishi
    # Balandlik ko'rsatkichi katta bo'lgan tomonga qiyalik
    if c > 0:
        dip_towards = dip_direction
    else:
        dip_towards = (dip_direction + 180) % 360
    
    return {
        "strike": round(strike_deg, 2),
        "strike_azimuth": round(strike_azimuth, 2),
        "dip": round(dip_deg, 2),
        "dip_direction": round(dip_direction, 2),
        "dip_line_direction": round(dip_line_direction, 2),
        "dip_towards": round(dip_towards, 2),
        "normal_vector": {
            "x": round(a, 4),
            "y": round(b, 4), 
            "z": round(c, 4)
        }
    }

def create_geological_section(points, section_azimuth):
    """
    Geologik kesma yaratish uchun ma'lumotlar.
    
    Args:
        points: 3 ta nuqta
        section_azimuth: Kesma yo'nalishi (azimut)
    
    Returns:
        dict: Kesma ma'lumotlari
    """
    elements = calculate_structural_elements(points)
    
    # Diagonal yo'nalishda tuzatma
    corrected_dip = calculate_diagonal_correction(
        elements["strike"], 
        elements["dip"], 
        section_azimuth
    )
    
    return {
        "section_azimuth": section_azimuth,
        "original_dip": elements["dip"],
        "corrected_dip": corrected_dip,
        "correction_angle": elements["dip"] - corrected_dip,
        "structural_elements": elements
    }

def analyze_stratigraphic_column(layers_data):
    """
    Stratigrafik ustun tahlili.
    
    Args:
        layers_data: Qatlamlar ma'lumotlari
    
    Returns:
        dict: Stratigrafik tahlil
    """
    # Qatlamlarni yosh bo'yicha tartiblash
    sorted_layers = sorted(layers_data, key=lambda x: x.get('age', 0))
    
    # Umumiy qalinlik
    total_thickness = sum(layer.get('thickness', 0) for layer in sorted_layers)
    
    # Qatlam turlari
    layer_types = {}
    for layer in sorted_layers:
        layer_type = layer.get('type', 'Unknown')
        if layer_type not in layer_types:
            layer_types[layer_type] = 0
        layer_types[layer_type] += layer.get('thickness', 0)
    
    return {
        "total_layers": len(sorted_layers),
        "total_thickness": total_thickness,
        "layer_types": layer_types,
        "stratigraphic_column": sorted_layers
    }

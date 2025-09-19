# backend/services/report_engine.py
import numpy as np
import math

def calculate_strike_dip(points):
    """
    Uch nuqta usuli yordamida qatlamning strike (yo'nalish), dip (qiyalik)
    va dip direction (qiyalik yo'nalishi) ni hisoblaydi.

    points: [(x1, y1, z1), (x2, y2, z2), (x3, y3, z3)] formatida uch nuqta.
    """

    if len(points) != 3:
        raise ValueError("Uchta nuqta kerak!")

    p1, p2, p3 = [np.array(p) for p in points]

    # Ikki vektor hosil qilamiz
    v1 = p2 - p1
    v2 = p3 - p1

    # Normal vektor (tekislikning normali)
    normal = np.cross(v1, v2)

    # Tekislik tenglamasi: ax + by + cz + d = 0
    a, b, c = normal
    d = -(a * p1[0] + b * p1[1] + c * p1[2])

    # Strike (yo'nalish burchagi)
    strike_rad = math.atan2(b, a)
    strike_deg = (math.degrees(strike_rad) + 360) % 360

    # Dip burchagi
    dip_rad = math.atan(abs(c) / math.sqrt(a**2 + b**2))
    dip_deg = math.degrees(dip_rad)

    # Dip direction = strike + 90°
    dip_dir = (strike_deg + 90) % 360

    return round(strike_deg, 2), round(dip_deg, 2), round(dip_dir, 2)

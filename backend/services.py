import math
from typing import List

def calculate_strike_dip(p1: List[float], p2: List[float], p3: List[float]):
    v1 = [p2[i] - p1[i] for i in range(3)]
    v2 = [p3[i] - p1[i] for i in range(3)]

    n = [v1[1]*v2[2] - v1[2]*v2[1],
         v1[2]*v2[0] - v1[0]*v2[2],
         v1[0]*v2[1] - v1[1]*v2[0]]

    dip = math.degrees(math.atan2((n[0]**2 + n[1]**2) ** 0.5, abs(n[2])))
    strike = math.degrees(math.atan2(n[0], n[1]))
    if strike < 0:
        strike += 360
    dip_dir = (strike + 90) % 360
    return round(strike, 2), round(dip, 2), round(dip_dir, 2)

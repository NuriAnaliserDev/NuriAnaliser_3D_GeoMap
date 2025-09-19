import math

def calculate_plane_from_points(points):
    (x1, y1, z1), (x2, y2, z2), (x3, y3, z3) = [(p.x, p.y, p.z) for p in points]
    v1 = (x2 - x1, y2 - y1, z2 - z1)
    v2 = (x3 - x1, y3 - y1, z3 - z1)

    nx = v1[1]*v2[2] - v1[2]*v2[1]
    ny = v1[2]*v2[0] - v1[0]*v2[2]
    nz = v1[0]*v2[1] - v1[1]*v2[0]

    strike = math.degrees(math.atan2(nx, ny)) % 360
    dip = math.degrees(math.atan(abs(nz) / math.sqrt(nx**2 + ny**2)))
    dip_direction = (strike + 90) % 360

    return strike, dip, dip_direction

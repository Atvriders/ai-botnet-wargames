export type Vec3 = [number, number, number];

// Convert lat/lng (degrees) to 3D cartesian point on a unit sphere
export function latLngToXYZ(lat: number, lng: number, radius: number = 1): Vec3 {
  const latR = lat * Math.PI / 180;
  const lngR = lng * Math.PI / 180;
  return [
    radius * Math.cos(latR) * Math.sin(lngR),
    radius * Math.sin(latR),
    radius * Math.cos(latR) * Math.cos(lngR),
  ];
}

// Rotation matrices
export function rotateX(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

export function rotateY(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

// Perspective projection to 2D screen coords
export function project(p: Vec3, fov: number, cx: number, cy: number): [number, number, number] {
  const scale = fov / (fov + p[2]);
  return [p[0] * scale + cx, -p[1] * scale + cy, p[2]]; // z for depth sorting/visibility
}

// Is point on front hemisphere (visible)?
export function isFrontFacing(p: Vec3): boolean {
  return p[2] > -0.1; // slightly past equator so edge nodes are visible
}

// Generate wireframe grid lines for the globe
export function generateWireframe(radius: number, latLines: number = 18, lngLines: number = 36): Vec3[][] {
  const lines: Vec3[][] = [];

  // Latitude lines (horizontal circles)
  for (let i = 1; i < latLines; i++) {
    const lat = -90 + (180 / latLines) * i;
    const points: Vec3[] = [];
    for (let j = 0; j <= 72; j++) {
      const lng = (360 / 72) * j;
      points.push(latLngToXYZ(lat, lng, radius));
    }
    lines.push(points);
  }

  // Longitude lines (vertical great circles)
  for (let i = 0; i < lngLines; i++) {
    const lng = (360 / lngLines) * i;
    const points: Vec3[] = [];
    for (let j = 0; j <= 72; j++) {
      const lat = -90 + (180 / 72) * j;
      points.push(latLngToXYZ(lat, lng, radius));
    }
    lines.push(points);
  }

  return lines;
}

// Great circle arc between two lat/lng points (for connection lines)
export function greatCircleArc(lat1: number, lng1: number, lat2: number, lng2: number, radius: number, segments: number = 20): Vec3[] {
  const p1 = latLngToXYZ(lat1, lng1, radius);
  const p2 = latLngToXYZ(lat2, lng2, radius);

  const points: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Slerp (spherical linear interpolation)
    const dot = p1[0] * p2[0] + p1[1] * p2[1] + p1[2] * p2[2];
    const omega = Math.acos(Math.max(-1, Math.min(1, dot / (radius * radius))));

    if (Math.abs(omega) < 0.001) {
      // Points too close, just lerp
      points.push([
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
        p1[2] + (p2[2] - p1[2]) * t,
      ]);
    } else {
      const sinOmega = Math.sin(omega);
      const a = Math.sin((1 - t) * omega) / sinOmega;
      const b = Math.sin(t * omega) / sinOmega;
      points.push([
        a * p1[0] + b * p2[0],
        a * p1[1] + b * p2[1],
        a * p1[2] + b * p2[2],
      ]);
    }
  }
  return points;
}

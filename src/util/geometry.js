export const AXES = ['x', 'y'];

export function getLineAngle(line) {
  const a = line.p1.x - line.p2.x;
  const b = line.p1.y - line.p2.y;
  return Math.atan2(a, b);
}

export function getLineCenter(line) {
  return {
    x: (line.p1.x + line.p2.x) / 2,
    y: (line.p1.y + line.p2.y) / 2,
  };
}

export function rotatePoint(point, center, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  const translatedPoint = {
    x: point.x - center.x,
    y: point.y - center.y,
  };

  const newPoint = {
    x: translatedPoint.x * c - translatedPoint.y * s,
    y: translatedPoint.x * s + translatedPoint.y * c,
  };

  return {
    x: newPoint.x + center.x,
    y: newPoint.y + center.y,
  };
}

export function movePoint(point, amount, angle, axis) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  const newPoint = {
    x: point.x + amount * c,
    y: point.y + amount * s,
  };

  if (axis === null || axis === undefined) {
    return newPoint;
  }

  return { ...point, [axis]: newPoint[axis] };
}

export function getDistanceBetweenPoints(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;

  return Math.sqrt(dx * dx + dy * dy);
}

import { Point } from '@/types/shared';

export const calculatePolygonArea = (points: { x: number; y: number }[]) => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
};

// Convert pixels to square feet (1 grid cell = 1 foot)
export const convertToSquareFeet = (areaInPixels: number) => {
  // Each grid cell is 20x20 pixels and represents 1x1 foot
  const squareFeet = areaInPixels / (20 * 20);
  return Math.round(squareFeet);
};

export const calculateDistance = (point1: Point, point2: Point): number => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
};

export const snapToGrid = (value: number, gridSize: number = 20): number => {
  return Math.round(value / gridSize) * gridSize;
};

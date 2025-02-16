import { Point } from '@/types/shared';

export const calculatePolygonArea = (points: Point[]): number => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
};

export const convertToSquareFeet = (area: number): number => {
  // Assuming the grid is in inches (20px = 1 inch)
  const squareInches = area / 400; // 20 * 20 = 400 square pixels per square inch
  return Math.round(squareInches / 144); // 144 square inches in a square foot
};

export const calculateDistance = (point1: Point, point2: Point): number => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
};

export const snapToGrid = (value: number, gridSize: number = 20): number => {
  return Math.round(value / gridSize) * gridSize;
};

import { Point } from "@/types/floorplanner";

export function pixelsToFeetAndInches(
  pixels: number,
  gridSize: number = 20,
): string {
  const totalInches = (pixels / gridSize) * 12;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}' ${inches}"`;
}

export function calculateDistance(point1: Point, point2: Point): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2),
  );
}

export function getMidpoint(point1: Point, point2: Point): Point {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
}

export function getAngle(point1: Point, point2: Point): number {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x) * (180 / Math.PI);
}

export function getPerpendicularOffset(
  angle: number,
  offset: number = 15,
): Point {
  const perpendicular = angle + 90;
  return {
    x: Math.cos((perpendicular * Math.PI) / 180) * offset,
    y: Math.sin((perpendicular * Math.PI) / 180) * offset,
  };
}

import { Point, WallSegment, Corner } from "@/types/shared";

export const GRID_SIZE = 50; // 50 units per grid cell
export const SNAP_THRESHOLD = GRID_SIZE / 2;
const MIN_WALL_LENGTH = 50; // pixels
const MIN_CORNER_ANGLE = 30; // degrees

export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function snapToNearestCorner(point: Point, corners: Corner[]): Point | null {
  for (const corner of corners) {
    const distance = getDistance(point, corner);
    if (distance < SNAP_THRESHOLD) {
      return { x: corner.x, y: corner.y };
    }
  }
  return null;
}

export function snapToNearestWall(point: Point, wallSegments: WallSegment[]): Point | null {
  let closestPoint: Point | null = null;
  let minDistance = SNAP_THRESHOLD;

  wallSegments.forEach(wall => {
    const projected = projectPointOnLine(point, wall.start, wall.end);
    if (projected) {
      const distance = getDistance(point, projected);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = projected;
      }
    }
  });

  return closestPoint;
}

export function validateWallSegment(wall: WallSegment, existingWalls: WallSegment[]): string[] {
  const errors: string[] = [];
  
  // Check minimum length
  const length = getDistance(wall.start, wall.end);
  if (length < MIN_WALL_LENGTH) {
    errors.push(`Wall length (${length.toFixed(0)}px) is below minimum (${MIN_WALL_LENGTH}px)`);
  }

  // Check for intersections with existing walls
  existingWalls.forEach(existing => {
    if (doWallsIntersect(wall, existing)) {
      errors.push('Wall intersects with an existing wall');
    }
  });

  return errors;
}

export function validateCorner(corner: Corner): string[] {
  const errors: string[] = [];

  if (corner.wallSegments.length < 2) return errors;

  // Check angles between walls
  for (let i = 0; i < corner.wallSegments.length - 1; i++) {
    for (let j = i + 1; j < corner.wallSegments.length; j++) {
      const angle = getAngleBetweenWalls(corner.wallSegments[i], corner.wallSegments[j]);
      if (angle < MIN_CORNER_ANGLE) {
        errors.push(`Corner angle (${angle.toFixed(0)}°) is below minimum (${MIN_CORNER_ANGLE}°)`);
      }
    }
  }

  return errors;
}

// Helper functions
function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function projectPointOnLine(point: Point, lineStart: Point, lineEnd: Point): Point | null {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return null;

  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (length * length);
  
  if (t < 0) return lineStart;
  if (t > 1) return lineEnd;

  return {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy
  };
}

function doWallsIntersect(wall1: WallSegment, wall2: WallSegment): boolean {
  const x1 = wall1.start.x;
  const y1 = wall1.start.y;
  const x2 = wall1.end.x;
  const y2 = wall1.end.y;
  const x3 = wall2.start.x;
  const y3 = wall2.start.y;
  const x4 = wall2.end.x;
  const y4 = wall2.end.y;

  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denominator === 0) return false;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

  return t > 0 && t < 1 && u > 0 && u < 1;
}

function getAngleBetweenWalls(wall1: WallSegment, wall2: WallSegment): number {
  const angle1 = Math.atan2(wall1.end.y - wall1.start.y, wall1.end.x - wall1.start.x);
  const angle2 = Math.atan2(wall2.end.y - wall2.start.y, wall2.end.x - wall2.start.x);
  
  let angle = Math.abs(angle1 - angle2) * (180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  
  return angle;
} 
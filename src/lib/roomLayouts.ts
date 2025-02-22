import { Point, WallSegment, Corner } from "@/types/shared";

interface RoomLayout {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  points: Point[];
  wallSegments: WallSegment[];
  corners: Corner[];
  sqft: number;
  description: string;
}

// Helper function to create wall segments and corners from points
export function createWallsAndCorners(points: Point[]): { wallSegments: WallSegment[], corners: Corner[] } {
  const wallSegments: WallSegment[] = [];
  const corners: Corner[] = [];

  points.forEach((point, index) => {
    // Create corner
    const corner: Corner = {
      x: point.x,
      y: point.y,
      wallSegments: []
    };
    corners.push(corner);

    // Create wall segment between current point and next point
    if (index < points.length - 1) {
      const wallSegment: WallSegment = {
        start: point,
        end: points[index + 1],
        thickness: 6
      };
      wallSegments.push(wallSegment);
      corner.wallSegments.push(wallSegment);
    }
  });

  // Connect last point to first point if we have a complete shape
  if (points.length > 2) {
    const lastWallSegment: WallSegment = {
      start: points[points.length - 1],
      end: points[0],
      thickness: 6
    };
    wallSegments.push(lastWallSegment);
    corners[corners.length - 1].wallSegments.push(lastWallSegment);
    corners[0].wallSegments.push(lastWallSegment);
  }

  return { wallSegments, corners };
}

export const KITCHEN_LAYOUTS: RoomLayout[] = [
  {
    id: "l-shaped-kitchen",
    name: "L-Shaped Kitchen",
    type: "room",
    width: 360,
    height: 288,
    points: [
      { x: 0, y: 0 },
      { x: 360, y: 0 },
      { x: 360, y: 288 },
      { x: 144, y: 288 },
      { x: 144, y: 144 },
      { x: 0, y: 144 }
    ],
    ...createWallsAndCorners([
      { x: 0, y: 0 },
      { x: 360, y: 0 },
      { x: 360, y: 288 },
      { x: 144, y: 288 },
      { x: 144, y: 144 },
      { x: 0, y: 144 }
    ]),
    sqft: 180,
    description: "Classic L-shaped kitchen layout with ample counter space"
  },
  {
    id: "u-shaped-kitchen",
    name: "U-Shaped Kitchen",
    type: "room",
    width: 360,
    height: 288,
    points: [
      { x: 0, y: 0 },
      { x: 360, y: 0 },
      { x: 360, y: 288 },
      { x: 240, y: 288 },
      { x: 240, y: 144 },
      { x: 120, y: 144 },
      { x: 120, y: 288 },
      { x: 0, y: 288 }
    ],
    ...createWallsAndCorners([
      { x: 0, y: 0 },
      { x: 360, y: 0 },
      { x: 360, y: 288 },
      { x: 240, y: 288 },
      { x: 240, y: 144 },
      { x: 120, y: 144 },
      { x: 120, y: 288 },
      { x: 0, y: 288 }
    ]),
    sqft: 220,
    description: "Efficient U-shaped design with ample counter space"
  }
];

export const BATHROOM_LAYOUTS: RoomLayout[] = [
  {
    id: "master-bathroom",
    name: "Master Bathroom",
    type: "room",
    width: 144,
    height: 120,
    points: [
      { x: 0, y: 0 },
      { x: 144, y: 0 },
      { x: 144, y: 120 },
      { x: 0, y: 120 }
    ],
    wallSegments: [
      { start: { x: 0, y: 0 }, end: { x: 144, y: 0 }, thickness: 6 },
      { start: { x: 144, y: 0 }, end: { x: 144, y: 120 }, thickness: 6 },
      { start: { x: 144, y: 120 }, end: { x: 0, y: 120 }, thickness: 6 },
      { start: { x: 0, y: 120 }, end: { x: 0, y: 0 }, thickness: 6 }
    ],
    corners: [
      { x: 0, y: 0, wallSegments: [] },
      { x: 144, y: 0, wallSegments: [] },
      { x: 144, y: 120, wallSegments: [] },
      { x: 0, y: 120, wallSegments: [] }
    ],
    sqft: 120,
    description: "Spacious master bathroom with separate shower and tub areas"
  },
  {
    id: "powder-room",
    name: "Powder Room",
    type: "room",
    width: 60,
    height: 48,
    points: [
      { x: 0, y: 0 },
      { x: 60, y: 0 },
      { x: 60, y: 48 },
      { x: 0, y: 48 },
      { x: 0, y: 0 }
    ],
    ...createWallsAndCorners([
      { x: 0, y: 0 },
      { x: 60, y: 0 },
      { x: 60, y: 48 },
      { x: 0, y: 48 },
      { x: 0, y: 0 }
    ]),
    sqft: 20,
    description: "Compact powder room layout"
  }
]; 
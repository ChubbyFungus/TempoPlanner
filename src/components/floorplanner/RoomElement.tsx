import React, { useState, useEffect } from "react";
import ThreeRoomRenderer from "./ThreeRoomRenderer";
import { Point, WallSegment, Corner } from "@/types/shared";

interface Element {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  rotation: number;
  locked: boolean;
  points?: Point[];
  color?: string;
  wallSegments?: WallSegment[];
  corners?: Corner[];
  depth?: number;
  materialPreset?: any | null;
  overlayPreset?: any | null;
  selectedCorner?: Corner;
  selectedCornerIndex?: number;
  selectedWall?: WallSegment;
  selectedWallIndex?: number;
}

interface RoomElementProps {
  element: Element;
  selected: boolean;
  onSelect: (element: Element) => void;
  viewMode: "2d" | "3d";
  drawingMode: string;
}

const RoomElement = React.memo(({ element, selected, onSelect, viewMode, drawingMode }: RoomElementProps) => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [draggingCorner, setDraggingCorner] = useState<{
    corner: Corner;
    index: number;
    startX: number;
    startY: number;
  } | null>(null);

  const handleCornerMouseDown = (corner: Corner, index: number, e: React.MouseEvent) => {
    if (drawingMode !== "select") return;
    e.stopPropagation();
    setDraggingCorner({
      corner,
      index,
      startX: e.clientX,
      startY: e.clientY
    });
    setSelectedPart(`corner-${index}`);
    onSelect(element);
  };

  useEffect(() => {
    if (!draggingCorner) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - draggingCorner.startX;
      const dy = e.clientY - draggingCorner.startY;

      // Update corner position
      const updatedCorners = [...element.corners];
      updatedCorners[draggingCorner.index] = {
        ...updatedCorners[draggingCorner.index],
        x: draggingCorner.corner.x + dx,
        y: draggingCorner.corner.y + dy
      };

      // Update connected wall segments
      const updatedWallSegments = element.wallSegments.map(wall => {
        if (wall.start === draggingCorner.corner) {
          return { ...wall, start: updatedCorners[draggingCorner.index] };
        }
        if (wall.end === draggingCorner.corner) {
          return { ...wall, end: updatedCorners[draggingCorner.index] };
        }
        return wall;
      });

      onSelect({
        ...element,
        corners: updatedCorners,
        wallSegments: updatedWallSegments
      });
    };

    const handleMouseUp = () => {
      setDraggingCorner(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingCorner, element, onSelect]);

  const handleClick = (e: React.MouseEvent) => {
    if (drawingMode !== "select") return;
    e.preventDefault(); // Add this
    e.stopPropagation();
    onSelect(element);
  };

  return (
    <div
      id={`room-${element.id}`}
      data-element-id={element.id}
      data-element-type={element.type}
      className={`absolute room-element ${selected ? "ring-2 ring-primary" : ""}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: element.width || 400,
        height: element.height || 300,
        transform: `rotate(${element.rotation}deg)`,
        cursor: drawingMode === "select" ? "pointer" : "default",
        pointerEvents: drawingMode === "select" ? "all" : "none", // Make sure this is correct
        zIndex: selected ? 20 : 10,
        transformOrigin: "top left",
        willChange: "transform",
        position: "absolute"
      }}
      onMouseDown={(e) => handleClick(e)} // Change from onClick to onMouseDown
    >
      {viewMode === "2d" ? (
        <svg
          width={element.width}
          height={element.height}
          className="absolute inset-0"
          viewBox={`0 0 ${element.width || 400} ${element.height || 300}`}
          style={{ overflow: 'visible', pointerEvents: drawingMode === "select" ? "all" : "none" }}
        >
          {/* Room outline */}
          <path
            d={`M ${element.points?.map(p => `${p.x - element.x} ${p.y - element.y}`).join(" L ")} Z`}
            fill={element.color || "#f3f4f6"}
            stroke={selected ? "#0066cc" : "#000"}
            strokeWidth="4"
            style={{ pointerEvents: drawingMode === "select" ? "all" : "none" }}
          />
          
          {/* Wall segments */}
          {element.wallSegments?.map((wall, index) => (
            <line
              key={index}
              x1={wall.start.x - element.x}
              y1={wall.start.y - element.y}
              x2={wall.end.x - element.x}
              y2={wall.end.y - element.y}
              stroke={selectedPart === `wall-${index}` ? "#0066cc" : "#000"}
              strokeWidth={wall.thickness + (selectedPart === `wall-${index}` ? 2 : 0)}
              strokeLinecap="round"
              style={{ 
                cursor: drawingMode === "select" ? "pointer" : "default",
                pointerEvents: drawingMode === "select" ? "all" : "none"
              }}
            />
          ))}

          {/* Corners */}
          {element.corners?.map((corner, index) => (
            <circle
              key={index}
              cx={corner.x - element.x}
              cy={corner.y - element.y}
              r={selectedPart === `corner-${index}` ? 6 : 4}
              fill={selectedPart === `corner-${index}` ? "#0066cc" : "#000"}
              stroke="#fff"
              strokeWidth={2}
              style={{ 
                cursor: drawingMode === "select" ? "move" : "default",
                pointerEvents: drawingMode === "select" ? "all" : "none"
              }}
              onMouseDown={(e) => handleCornerMouseDown(corner, index, e)}
            />
          ))}
        </svg>
      ) : (
        <ThreeRoomRenderer
          points={element.points || []}
          viewMode={viewMode}
          wallHeight={96}
          wallThickness={6}
        />
      )}
    </div>
  );
});

export default RoomElement; 

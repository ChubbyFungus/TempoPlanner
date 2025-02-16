import React, { useState } from "react";
import { calculatePolygonArea, convertToSquareFeet } from "@/lib/geometry";
import { Card } from "@/components/ui/card";

interface Point {
  x: number;
  y: number;
}

interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Point[];
  color?: string;
  thickness?: number;
}

interface CanvasProps {
  elements?: CanvasElement[];
  gridSize?: number;
  drawingMode?: string;
  onElementSelect?: (element: CanvasElement | null) => void;
  onElementMove?: (element: CanvasElement, newX: number, newY: number) => void;
  onDrawComplete?: (points: Point[]) => void;
  onCanvasClick?: (x: number, y: number) => void;
}

const Canvas = ({
  elements = [],
  drawingMode = "",
  onDrawComplete = (points: Point[]) => {},
  onCanvasClick = (x: number, y: number) => {},
  gridSize = 20,
  onElementSelect = () => {},
  onElementMove = () => {},
}: CanvasProps) => {
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);

  // Create grid lines
  const gridLines = [];
  const canvasWidth = 932; // From design spec
  const canvasHeight = 982; // From design spec

  // Vertical lines
  for (let x = 0; x <= canvasWidth; x += gridSize) {
    gridLines.push(
      <line
        key={`v${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={canvasHeight}
        stroke="#e5e7eb"
        strokeWidth="1"
      />,
    );
  }

  // Horizontal lines
  for (let y = 0; y <= canvasHeight; y += gridSize) {
    gridLines.push(
      <line
        key={`h${y}`}
        x1={0}
        y1={y}
        x2={canvasWidth}
        y2={y}
        stroke="#e5e7eb"
        strokeWidth="1"
      />,
    );
  }

  const handleMouseDown = (element: CanvasElement, e: React.MouseEvent) => {
    setSelectedElement(element);
    onElementSelect(element);
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElement) {
      const canvasRect = (
        e.currentTarget as HTMLElement
      ).getBoundingClientRect();
      const newX =
        Math.round((e.clientX - canvasRect.left - dragOffset.x) / gridSize) *
        gridSize;
      const newY =
        Math.round((e.clientY - canvasRect.top - dragOffset.y) / gridSize) *
        gridSize;

      onElementMove(selectedElement, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Card className="w-full h-full bg-white overflow-hidden">
      <svg
        width={canvasWidth}
        height={canvasHeight}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`${drawingMode ? "cursor-crosshair" : "cursor-default"}`}
        onClick={(e) => {
          if (drawingMode) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round((e.clientX - rect.left) / gridSize) * gridSize;
            const y = Math.round((e.clientY - rect.top) / gridSize) * gridSize;

            if (drawingMode === "wall") {
              onCanvasClick(x, y);
            } else if (drawingMode === "room") {
              const newPoints = [...drawingPoints, { x, y }];
              setDrawingPoints(newPoints);

              // Complete room if clicking near start point
              if (drawingPoints.length > 2) {
                const startPoint = drawingPoints[0];
                const distance = Math.sqrt(
                  Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2),
                );
                if (distance < gridSize) {
                  onDrawComplete(drawingPoints);
                  setDrawingPoints([]);
                  return;
                }
              }
            }
          }
        }}
      >
        {/* Grid */}
        {gridLines}

        {/* Drawing Preview */}
        {drawingPoints.length > 0 && (
          <g>
            <path
              d={`M ${drawingPoints[0].x} ${drawingPoints[0].y} ${drawingPoints
                .slice(1)
                .map((p) => `L ${p.x} ${p.y}`)
                .join(" ")}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4"
            />
          </g>
        )}

        {/* Elements */}
        {elements.map((element) => {
          if (element.type === "wall") {
            const [start, end] = element.points || [];
            return (
              <g
                key={element.id}
                onMouseDown={(e) => handleMouseDown(element, e)}
                className={
                  selectedElement?.id === element.id ? "stroke-blue-500" : ""
                }
              >
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={
                    selectedElement?.id === element.id ? "#3b82f6" : "#1a1a1a"
                  }
                  strokeWidth={element.thickness || 8}
                  strokeLinecap="square"
                />
              </g>
            );
          } else if (element.type === "room") {
            return (
              <g
                key={element.id}
                onMouseDown={(e) => handleMouseDown(element, e)}
                className={
                  selectedElement?.id === element.id ? "stroke-blue-500" : ""
                }
              >
                <path
                  d={`M ${element.points?.[0].x} ${element.points?.[0].y} ${element.points
                    ?.slice(1)
                    .map((p) => `L ${p.x} ${p.y}`)
                    .join(" ")} Z`}
                  fill={element.color || "#f3f4f6"}
                  stroke={
                    selectedElement?.id === element.id ? "#3b82f6" : "#1a1a1a"
                  }
                  strokeWidth={2}
                />
                {element.points && (
                  <text
                    x={element.x + element.width / 2}
                    y={element.y + element.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none text-sm fill-gray-600"
                  >
                    {`${convertToSquareFeet(calculatePolygonArea(element.points))} sq ft`}
                  </text>
                )}
              </g>
            );
          } else if (element.type === "surface") {
            return (
              <g
                key={element.id}
                onMouseDown={(e) => handleMouseDown(element, e)}
                className={
                  selectedElement?.id === element.id ? "stroke-blue-500" : ""
                }
              >
                <path
                  d={`M ${element.points?.[0].x} ${element.points?.[0].y} ${element.points
                    ?.slice(1)
                    .map((p) => `L ${p.x} ${p.y}`)
                    .join(" ")} Z`}
                  fill={element.color || "#e5e7eb"}
                  stroke={
                    selectedElement?.id === element.id ? "#3b82f6" : "#d1d5db"
                  }
                  strokeWidth={2}
                  fillOpacity={0.5}
                />
              </g>
            );
          } else {
            return (
              <g
                key={element.id}
                transform={`translate(${element.x},${element.y})`}
                onMouseDown={(e) => handleMouseDown(element, e)}
                className={`cursor-move ${selectedElement?.id === element.id ? "stroke-blue-500" : ""}`}
              >
                <rect
                  width={element.width}
                  height={element.height}
                  fill={
                    selectedElement?.id === element.id ? "#e5e7eb" : "#f3f4f6"
                  }
                  stroke={
                    selectedElement?.id === element.id ? "#3b82f6" : "#d1d5db"
                  }
                  strokeWidth="2"
                />
                {element.type === "refrigerator" ? (
                  <image
                    href="/fridgetop.png"
                    width={element.width}
                    height={element.height}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <>
                    <rect
                      x={2}
                      y={2}
                      width={element.width - 4}
                      height={element.height - 4}
                      fill="#e2e8f0"
                      stroke="none"
                    />
                    {element.type.includes("upper-") && (
                      <line
                        x1={element.width * 0.2}
                        y1={element.height * 0.3}
                        x2={element.width * 0.8}
                        y2={element.height * 0.3}
                        stroke="#94a3b8"
                        strokeWidth="2"
                      />
                    )}
                    <text
                      x={element.width / 2}
                      y={element.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="select-none text-xs fill-gray-600"
                    >
                      {element.width}"W
                    </text>
                  </>
                )}
              </g>
            );
          }
        })}
      </svg>
    </Card>
  );
};

export default Canvas;

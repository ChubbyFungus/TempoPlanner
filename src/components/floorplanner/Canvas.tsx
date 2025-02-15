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
  rotation: number;
  locked: boolean;
  points?: Point[];
  color?: string;
  thickness?: number;
  label?: string;
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
  onDrawComplete = () => {},
  onCanvasClick = () => {},
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
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

  // Create grid lines
  const gridLines = [];
  const canvasWidth = 932;
  const canvasHeight = 982;
  const majorGridSize = gridSize * 5; // Major grid lines every 5 units

  // Vertical lines
  for (let x = 0; x <= canvasWidth; x += gridSize) {
    const isMajor = x % majorGridSize === 0;
    gridLines.push(
      <line
        key={`v${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={canvasHeight}
        stroke={isMajor ? "#d1d5db" : "#f3f4f6"}
        strokeWidth={isMajor ? "1" : "0.5"}
        strokeDasharray={isMajor ? "none" : "2,2"}
      />,
    );
  }

  // Horizontal lines
  for (let y = 0; y <= canvasHeight; y += gridSize) {
    const isMajor = y % majorGridSize === 0;
    gridLines.push(
      <line
        key={`h${y}`}
        x1={0}
        y1={y}
        x2={canvasWidth}
        y2={y}
        stroke={isMajor ? "#d1d5db" : "#f3f4f6"}
        strokeWidth={isMajor ? "1" : "0.5"}
        strokeDasharray={isMajor ? "none" : "2,2"}
      />,
    );
  }

  const handleMouseDown = (
    element: CanvasElement,
    e: React.MouseEvent<SVGElement>,
  ) => {
    setSelectedElement(element);
    onElementSelect(element);
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
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

    if (drawingMode === "room" && drawingPoints.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      let x = Math.round((e.clientX - rect.left) / gridSize) * gridSize;
      let y = Math.round((e.clientY - rect.top) / gridSize) * gridSize;

      if (e.shiftKey && drawingPoints.length > 0) {
        const lastPoint = drawingPoints[drawingPoints.length - 1];
        const dx = Math.abs(x - lastPoint.x);
        const dy = Math.abs(y - lastPoint.y);
        if (dx < dy) {
          x = lastPoint.x;
        } else {
          y = lastPoint.y;
        }
      }

      setPreviewPoint({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Card className="w-full h-full bg-white overflow-hidden relative">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2 z-10">
        <button
          className="p-1 hover:bg-gray-100 rounded"
          onClick={() => {
            /* TODO: Implement zoom */
          }}
        >
          +
        </button>
        <button
          className="p-1 hover:bg-gray-100 rounded"
          onClick={() => {
            /* TODO: Implement zoom */
          }}
        >
          -
        </button>
      </div>
      {/* Measurements */}
      <div className="absolute top-4 left-4 text-xs text-gray-500">
        Scale: 1:50
      </div>
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
            let x = Math.round((e.clientX - rect.left) / gridSize) * gridSize;
            let y = Math.round((e.clientY - rect.top) / gridSize) * gridSize;

            if (drawingMode === "wall") {
              if (e.shiftKey && drawingPoints.length > 0) {
                const lastPoint = drawingPoints[drawingPoints.length - 1];
                const dx = Math.abs(x - lastPoint.x);
                const dy = Math.abs(y - lastPoint.y);
                if (dx < dy) {
                  x = lastPoint.x;
                } else {
                  y = lastPoint.y;
                }
              }
              onCanvasClick(x, y);
            } else if (drawingMode === "room") {
              if (e.shiftKey && drawingPoints.length > 0) {
                const lastPoint = drawingPoints[drawingPoints.length - 1];
                const dx = Math.abs(x - lastPoint.x);
                const dy = Math.abs(y - lastPoint.y);
                if (dx < dy) {
                  x = lastPoint.x;
                } else {
                  y = lastPoint.y;
                }
              }

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
                  setPreviewPoint(null);
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
                .join(
                  " ",
                )}${previewPoint ? ` L ${previewPoint.x} ${previewPoint.y}` : ""}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4"
            />
            {previewPoint && (
              <circle
                cx={previewPoint.x}
                cy={previewPoint.y}
                r={4}
                fill="#3b82f6"
              />
            )}
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
                <g>
                  {/* Inner wall fill */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#000000"
                    strokeWidth={element.thickness || 8}
                    strokeLinecap="square"
                  />
                  {/* Wall measurements */}
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2 - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none text-xs fill-gray-600"
                    transform={`rotate(${(Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI}, ${(start.x + end.x) / 2}, ${(start.y + end.y) / 2})`}
                  >
                    {Math.round(
                      (Math.sqrt(
                        Math.pow(end.x - start.x, 2) +
                          Math.pow(end.y - start.y, 2),
                      ) /
                        gridSize) *
                        10,
                    ) / 10}{" "}
                    m
                  </text>
                </g>
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
                  fill={element.color || "#ffffff"}
                  stroke="#000000"
                  strokeWidth={selectedElement?.id === element.id ? 3 : 2}
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
            // Render appliances and fixtures
            return (
              <g
                key={element.id}
                transform={`translate(${element.x},${element.y}) rotate(${element.rotation || 0} ${element.width / 2} ${element.height / 2})`}
                onMouseDown={(e) => handleMouseDown(element, e)}
                className={`cursor-move ${selectedElement?.id === element.id ? "stroke-blue-500" : ""}`}
              >
                {/* Main shape */}
                <rect
                  width={element.width}
                  height={element.height}
                  fill={element.color || "#ffffff"}
                  stroke={
                    selectedElement?.id === element.id ? "#3b82f6" : "#000000"
                  }
                  strokeWidth="2"
                />

                {/* Interior details based on type */}
                {element.type === "refrigerator" && (
                  <>
                    <line
                      x1={0}
                      y1={element.height * 0.7}
                      x2={element.width}
                      y2={element.height * 0.7}
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <rect
                      x={element.width * 0.1}
                      y={element.height * 0.2}
                      width={element.width * 0.8}
                      height={element.height * 0.4}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                  </>
                )}
                {element.type === "sink" && (
                  <>
                    <ellipse
                      cx={element.width / 2}
                      cy={element.height / 2}
                      rx={element.width * 0.3}
                      ry={element.height * 0.3}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <line
                      x1={element.width / 2}
                      y1={element.height * 0.2}
                      x2={element.width / 2}
                      y2={element.height * 0.8}
                      stroke="#000000"
                      strokeWidth="1"
                    />
                  </>
                )}
                {element.type === "stove" && (
                  <>
                    <circle
                      cx={element.width * 0.25}
                      cy={element.height * 0.25}
                      r={element.width * 0.1}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <circle
                      cx={element.width * 0.75}
                      cy={element.height * 0.25}
                      r={element.width * 0.1}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <circle
                      cx={element.width * 0.25}
                      cy={element.height * 0.75}
                      r={element.width * 0.1}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <circle
                      cx={element.width * 0.75}
                      cy={element.height * 0.75}
                      r={element.width * 0.1}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                  </>
                )}
                {element.type === "base-cabinet" && (
                  <>
                    <rect
                      x={2}
                      y={2}
                      width={element.width - 4}
                      height={element.height - 4}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <line
                      x1={element.width * 0.2}
                      y1={2}
                      x2={element.width * 0.2}
                      y2={element.height - 2}
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <line
                      x1={element.width * 0.4}
                      y1={2}
                      x2={element.width * 0.4}
                      y2={element.height - 2}
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <line
                      x1={element.width * 0.6}
                      y1={2}
                      x2={element.width * 0.6}
                      y2={element.height - 2}
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <line
                      x1={element.width * 0.8}
                      y1={2}
                      x2={element.width * 0.8}
                      y2={element.height - 2}
                      stroke="#000000"
                      strokeWidth="1"
                    />
                  </>
                )}
                {element.type === "upper-cabinet" && (
                  <>
                    <rect
                      x={2}
                      y={2}
                      width={element.width - 4}
                      height={element.height - 4}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                    <line
                      x1={element.width * 0.2}
                      y1={2}
                      x2={element.width * 0.2}
                      y2={element.height - 2}
                      stroke="#000000"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                    <line
                      x1={element.width * 0.4}
                      y1={2}
                      x2={element.width * 0.4}
                      y2={element.height - 2}
                      stroke="#000000"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                    <line
                      x1={element.width * 0.6}
                      y1={2}
                      x2={element.width * 0.6}
                      y2={element.height - 2}
                      stroke="#000000"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                    <line
                      x1={element.width * 0.8}
                      y1={2}
                      x2={element.width * 0.8}
                      y2={element.height - 2}
                      stroke="#000000"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  </>
                )}
                {element.type === "island" && (
                  <>
                    <rect
                      x={2}
                      y={2}
                      width={element.width - 4}
                      height={element.height - 4}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <pattern
                      id={`grid-${element.id}`}
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="0.5"
                      />
                    </pattern>
                    <rect
                      x={2}
                      y={2}
                      width={element.width - 4}
                      height={element.height - 4}
                      fill={`url(#grid-${element.id})`}
                    />
                  </>
                )}

                {/* Dimensions */}
                {selectedElement?.id === element.id && (
                  <>
                    <text
                      x={element.width / 2}
                      y={-8}
                      textAnchor="middle"
                      className="select-none text-[10px] fill-gray-600"
                    >
                      {Math.round((element.width / 20) * 10) / 10}m
                    </text>
                    <text
                      x={element.width + 12}
                      y={element.height / 2}
                      textAnchor="middle"
                      transform={`rotate(90 ${element.width + 12} ${element.height / 2})`}
                      className="select-none text-[10px] fill-gray-600"
                    >
                      {Math.round((element.height / 20) * 10) / 10}m
                    </text>
                  </>
                )}

                {/* Label */}
                <text
                  x={element.width / 2}
                  y={element.height + 16}
                  textAnchor="middle"
                  className="select-none text-[10px] fill-gray-600"
                >
                  {element.label || element.type}
                </text>
              </g>
            );
          }
        })}
      </svg>
    </Card>
  );
};

export default Canvas;

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
  depth?: number;
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
        className={`${drawingMode ? "cursor-crosshair" : "cursor-default"}`}
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.1"/>
          </filter>
        </defs>
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
                {/* Main shape with shadow effect */}
                <rect
                  width={element.width}
                  height={element.depth || element.width}
                  fill="#FFFFFF"
                  stroke={
                    selectedElement?.id === element.id ? "#3b82f6" : "#94A3B8"
                  }
                  strokeWidth="2"
                  filter="url(#shadow)"
                />

                {/* Element-specific details */}
                {element.type === "refrigerator" && (
                  <>
                    {/* Main body with gradient */}
                    <defs>
                      <linearGradient id="refrigeratorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9CA3AF" />
                        <stop offset="50%" stopColor="#E5E7EB" />
                        <stop offset="100%" stopColor="#9CA3AF" />
                      </linearGradient>
                    </defs>
                    <rect
                      x={0}
                      y={0}
                      width={element.width}
                      height={element.depth || element.width}
                      fill="url(#refrigeratorGradient)"
                      stroke={selectedElement?.id === element.id ? "#3b82f6" : "#94A3B8"}
                      strokeWidth="1"
                      rx="2"
                    />
                    {/* Control panel */}
                    <rect
                      x={element.width / 2 - 15}
                      y={(element.depth || element.width) / 2 - 10}
                      width={30}
                      height={20}
                      fill="#1F2937"
                      rx="2"
                    />
                    {/* Control panel details */}
                    <line
                      x1={element.width / 2 - 10}
                      y1={(element.depth || element.width) / 2 - 5}
                      x2={element.width / 2 + 10}
                      y2={(element.depth || element.width) / 2 - 5}
                      stroke="#60A5FA"
                      strokeWidth="1"
                    />
                    <circle
                      cx={element.width / 2}
                      cy={(element.depth || element.width) / 2 + 5}
                      r="2"
                      fill="#60A5FA"
                    />
                  </>
                )}

                {element.type === "sink" && (
                  <>
                    <rect
                      x={4}
                      y={4}
                      width={element.width - 8}
                      height={(element.depth || element.width) - 8}
                      fill="#F8FAFC"
                      stroke={selectedElement?.id === element.id ? "#3b82f6" : "#94A3B8"}
                      strokeWidth="1"
                    />
                    <ellipse
                      cx={element.width / 2}
                      cy={(element.depth || element.width) / 2}
                      rx={element.width / 2.5}
                      ry={(element.depth || element.width) / 3}
                      fill="#E2E8F0"
                      stroke={selectedElement?.id === element.id ? "#3b82f6" : "#94A3B8"}
                      strokeWidth="2"
                    />
                    <line
                      x1={element.width / 2}
                      y1={(element.depth || element.width) / 2 - 5}
                      x2={element.width / 2}
                      y2={(element.depth || element.width) / 2 + 5}
                      stroke={
                        selectedElement?.id === element.id
                          ? "#3b82f6"
                          : "#94A3B8"
                      }
                      strokeWidth="1"
                    />
                  </>
                )}

                {element.type === "dishwasher" && (
                  <>
                    <rect
                      x={4}
                      y={4}
                      width={element.width - 8}
                      height={(element.depth || element.width) - 8}
                      fill="none"
                      stroke={
                        selectedElement?.id === element.id
                          ? "#3b82f6"
                          : "#94A3B8"
                      }
                      strokeWidth="1"
                    />
                    <line
                      x1={0}
                      y1={0}
                      x2={element.width}
                      y2={0}
                      stroke={
                        selectedElement?.id === element.id
                          ? "#3b82f6"
                          : "#94A3B8"
                      }
                      strokeWidth="2"
                    />
                  </>
                )}

                {element.type === "stove" && (
                  <>
                    <rect
                      x={4}
                      y={4}
                      width={element.width - 8}
                      height={(element.depth || element.width) - 8}
                      fill="#F8FAFC"
                      stroke={selectedElement?.id === element.id ? "#3b82f6" : "#94A3B8"}
                      strokeWidth="1"
                    />
                    <circle
                      cx={element.width / 4}
                      cy={(element.depth || element.width) / 4}
                      r={element.width / 8}
                      fill="none"
                      stroke={selectedElement?.id === element.id ? "#3b82f6" : "#94A3B8"}
                      strokeWidth="2"
                    />
                    <circle
                      cx={(3 * element.width) / 4}
                      cy={(element.depth || element.width) / 4}
                      r={8}
                      fill="none"
                      stroke={
                        selectedElement?.id === element.id
                          ? "#3b82f6"
                          : "#94A3B8"
                      }
                      strokeWidth="1"
                    />
                    <circle
                      cx={element.width / 4}
                      cy={(3 * (element.depth || element.width)) / 4}
                      r={8}
                      fill="none"
                      stroke={
                        selectedElement?.id === element.id
                          ? "#3b82f6"
                          : "#94A3B8"
                      }
                      strokeWidth="1"
                    />
                    <circle
                      cx={(3 * element.width) / 4}
                      cy={(3 * (element.depth || element.width)) / 4}
                      r={8}
                      fill="none"
                      stroke={
                        selectedElement?.id === element.id
                          ? "#3b82f6"
                          : "#94A3B8"
                      }
                      strokeWidth="1"
                    />
                  </>
                )}

                {element.type === "microwave" && (
                  <>
                    <rect
                      x={4}
                      y={4}
                      width={element.width - 8}
                      height={(element.depth || element.width) - 8}
                      fill="none"
                      stroke={
                        selectedElement?.id === element.id
                          ? "#3b82f6"
                          : "#94A3B8"
                      }
                      strokeWidth="1"
                      rx={4}
                    />
                    <circle
                      cx={element.width - 16}
                      cy={12}
                      r={4}
                      fill={
                        selectedElement?.id === element.id
                          ? "#3b82f6"
                          : "#94A3B8"
                      }
                    />
                  </>
                )}

                {(element.type === "base-cabinet" ||
                  element.type === "upper-cabinet") && (
                  <>
                    <rect
                      x={4}
                      y={4}
                      width={element.width - 8}
                      height={(element.depth || element.width) - 8}
                      fill="#F8FAFC"
                      stroke={selectedElement?.id === element.id ? "#3b82f6" : "#94A3B8"}
                      strokeWidth="1"
                    />
                    <line
                      x1={8}
                      y1={(element.depth || element.width) / 2}
                      x2={element.width - 8}
                      y2={(element.depth || element.width) / 2}
                      stroke={selectedElement?.id === element.id ? "#3b82f6" : "#94A3B8"}
                      strokeWidth="2"
                      strokeDasharray="4,4"
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
                      {Math.floor((element.width * 12) / 20 / 12)}'{" "}
                      {Math.round(((element.width * 12) / 20) % 12)}"
                    </text>
                    <text
                      x={element.width + 12}
                      y={(element.depth || element.width) / 2}
                      textAnchor="middle"
                      transform={`rotate(90 ${element.width + 12} ${(element.depth || element.width) / 2})`}
                      className="select-none text-[10px] fill-gray-600"
                    >
                      {Math.floor(
                        ((element.depth || element.width) * 12) / 20 / 12,
                      )}
                      '{" "}
                      {Math.round(
                        (((element.depth || element.width) * 12) / 20) % 12,
                      )}
                      "
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

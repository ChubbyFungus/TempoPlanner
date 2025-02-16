import React, { useState } from "react";
// Static assets
// Use absolute path for public assets
const fridgetopImage = "https://placehold.co/600x400";
import { calculatePolygonArea, convertToSquareFeet } from "@/lib/geometry";
import { Card } from "@/components/ui/card";
import { MaterialRenderer } from './MaterialRenderer';
import { MATERIAL_PRESETS, MATERIAL_OVERLAYS, MaterialDefinition, MaterialOverlay } from '@/types/materials';
import { Button } from "@/components/ui/button";
import { ThreeMaterialRenderer } from './ThreeMaterialRenderer';

console.log('Available Material Presets:', MATERIAL_PRESETS);
console.log('Available Material Overlays:', MATERIAL_OVERLAYS);

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
  materialId?: string;
  overlayId?: string;
}

interface CanvasProps {
  elements: CanvasElement[];
  drawingMode: string;
  selectedElement: CanvasElement | null;
  onDrawComplete: (points: Point[]) => void;
  onElementSelect: (element: CanvasElement | null) => void;
  onElementMove: (element: CanvasElement, newX: number, newY: number) => void;
  onCanvasClick?: (x: number, y: number) => void;
  onAddElements?: (elements: CanvasElement[]) => void;
}

const Canvas = ({
  elements = [],
  drawingMode = "",
  selectedElement,
  onDrawComplete = (points: Point[]) => {},
  onCanvasClick = (x: number, y: number) => {},
  onElementSelect = () => {},
  onElementMove = () => {},
  onAddElements = () => {},
}: CanvasProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);

  // Create grid lines
  const gridLines = [];
  const canvasWidth = 932; // From design spec
  const canvasHeight = 982; // From design spec

  // Vertical lines
  for (let x = 0; x <= canvasWidth; x += 20) {
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
  for (let y = 0; y <= canvasHeight; y += 20) {
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
        Math.round((e.clientX - canvasRect.left - dragOffset.x) / 20) *
        20;
      const newY =
        Math.round((e.clientY - canvasRect.top - dragOffset.y) / 20) *
        20;

      onElementMove(selectedElement, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getMaterialForType = (element: CanvasElement): MaterialDefinition => {
    console.log('Getting material for element:', {
      id: element.id,
      type: element.type,
      materialId: element.materialId
    });
    
    // If a specific material is specified, use it
    if (element.materialId && element.materialId in MATERIAL_PRESETS) {
      console.log('Using specified material:', MATERIAL_PRESETS[element.materialId]);
      return MATERIAL_PRESETS[element.materialId];
    }

    // Otherwise, use default based on type
    let material: MaterialDefinition;
    if (element.type.toLowerCase().includes('sub-zero')) {
      material = MATERIAL_PRESETS.subZeroStainless;
    } else if (element.type.toLowerCase().includes('thermador')) {
      material = MATERIAL_PRESETS.thermadorProfessional;
    } else if (element.type.toLowerCase().includes('liebherr')) {
      material = MATERIAL_PRESETS.liebherrMonolith;
    } else {
      material = MATERIAL_PRESETS.subZeroStainless;
    }
    
    console.log('Using default material:', material);
    return material;
  };

  const getOverlayForType = (element: CanvasElement): MaterialOverlay => {
    console.log('Getting overlay for element:', {
      id: element.id,
      type: element.type,
      overlayId: element.overlayId
    });

    // If a specific overlay is specified, use it
    if (element.overlayId && element.overlayId in MATERIAL_OVERLAYS) {
      console.log('Using specified overlay:', MATERIAL_OVERLAYS[element.overlayId]);
      return MATERIAL_OVERLAYS[element.overlayId];
    }

    // Otherwise, use default based on type
    let overlay: MaterialOverlay;
    if (element.type.toLowerCase().includes('sub-zero')) {
      overlay = MATERIAL_OVERLAYS.professionalBrushed;
    } else if (element.type.toLowerCase().includes('thermador')) {
      overlay = MATERIAL_OVERLAYS.verticalBrushed;
    } else if (element.type.toLowerCase().includes('liebherr')) {
      overlay = MATERIAL_OVERLAYS.circularBrushed;
    } else {
      overlay = MATERIAL_OVERLAYS.professionalBrushed;
    }

    console.log('Using default overlay:', overlay);
    return overlay;
  };

  return (
    <Card className="w-full h-full bg-white overflow-hidden relative">
      <svg
        width={canvasWidth}
        height={canvasHeight}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`${drawingMode ? "cursor-crosshair" : "cursor-default"}`}
      >
        <g
          onClick={(e) => {
            if (drawingMode) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x =
                Math.round((e.clientX - rect.left) / 20) * 20;
              const y =
                Math.round((e.clientY - rect.top) / 20) * 20;

              if (drawingMode === "wall") {
                onCanvasClick(x, y);
              } else if (drawingMode === "room") {
                const newPoints = [...drawingPoints, { x, y }];
                setDrawingPoints(newPoints);

                // Complete room if clicking near start point
                if (drawingPoints.length > 2) {
                  const startPoint = drawingPoints[0];
                  const distance = Math.sqrt(
                    Math.pow(x - startPoint.x, 2) +
                      Math.pow(y - startPoint.y, 2),
                  );
                  if (distance < 20) {
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
              const isAppliance = element.type.includes("refrigerator");
              
              return (
                <g
                  key={element.id}
                  transform={`translate(${element.x},${element.y})`}
                  onMouseDown={(e) => handleMouseDown(element, e)}
                  className={`cursor-move ${selectedElement?.id === element.id ? "stroke-blue-500" : ""}`}
                >
                  {isAppliance ? (
                    <foreignObject 
                      width={element.width} 
                      height={element.height}
                    >
                      <ThreeMaterialRenderer
                        elementId={element.id}
                        material={getMaterialForType(element)}
                        overlay={getOverlayForType(element)}
                        width={element.width}
                        height={element.height}
                      />
                    </foreignObject>
                  ) : (
                    <>
                      <rect
                        width={element.width}
                        height={element.height}
                        fill={selectedElement?.id === element.id ? "#e5e7eb" : "#f3f4f6"}
                        stroke={selectedElement?.id === element.id ? "#3b82f6" : "#d1d5db"}
                        strokeWidth="2"
                      />
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
        </g>
      </svg>
    </Card>
  );
};

export default Canvas;

import React, { useState } from "react";
// Static assets
// Use absolute path for public assets
const fridgetopImage = "https://placehold.co/600x400";
import { calculatePolygonArea, convertToSquareFeet } from "@/lib/geometry";
import { Card } from "@/components/ui/card";
import { MaterialRenderer } from './MaterialRenderer';
import { MATERIAL_PRESETS, MATERIAL_OVERLAYS } from '@/lib/materials';
import { Button } from "@/components/ui/button";
import { ThreeMaterialRenderer } from './ThreeMaterialRenderer';
import { CanvasElement, Point } from '@/types/shared';
import { getMaterialPreset } from '@/lib/materialPresets';
import { createPBRMaterial } from '@/lib/pbrMaterialManager';

console.log('Available Material Presets:', MATERIAL_PRESETS);
console.log('Available Material Overlays:', MATERIAL_OVERLAYS);

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

const getDefaultMaterialForType = (type: string) => {
  switch (type) {
    case 'wall':
      return 'drywall';
    case 'room':
      return 'hardwood';
    case 'surface':
      return 'granite';
    default:
      if (type.toLowerCase().includes('sub-zero')) {
        return 'subZeroStainless';
      } else if (type.toLowerCase().includes('thermador')) {
        return 'thermadorProfessional';
      } else if (type.toLowerCase().includes('liebherr')) {
        return 'liebherrMonolith';
      }
      return 'subZeroStainless';
  }
};

const getDefaultOverlayForType = (type: string) => {
  switch (type) {
    case 'wall':
      return null;
    case 'room':
      return 'woodGrain';
    case 'surface':
      return 'marbleTextured';
    default:
      if (type.toLowerCase().includes('sub-zero')) {
        return 'professionalBrushed';
      } else if (type.toLowerCase().includes('thermador')) {
        return 'verticalBrushed';
      } else if (type.toLowerCase().includes('liebherr')) {
        return 'circularBrushed';
      }
      return 'professionalBrushed';
  }
};

const Canvas: React.FC<CanvasProps> = ({
  elements = [],
  drawingMode = "",
  selectedElement,
  onDrawComplete = (points: Point[]) => {},
  onCanvasClick = (x: number, y: number) => {},
  onElementSelect = () => {},
  onElementMove = () => {},
  onAddElements = () => {},
}) => {
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

  const renderElement = (element: CanvasElement) => {
    const materialPreset = getMaterialPreset(element.type);
    
    if (element.type === "wall") {
      const [start, end] = element.points || [];
      return (
        <g
          key={element.id}
          onMouseDown={(e) => handleMouseDown(element, e)}
          className={selectedElement?.id === element.id ? "stroke-blue-500" : ""}
        >
          <foreignObject
            x={start.x}
            y={start.y}
            width={Math.abs(end.x - start.x) || element.thickness}
            height={Math.abs(end.y - start.y) || element.thickness}
          >
            <ThreeMaterialRenderer
              elementId={element.id}
              materialPreset={materialPreset}
              width={Math.abs(end.x - start.x) || element.thickness}
              height={Math.abs(end.y - start.y) || element.thickness}
              type="wall"
            />
          </foreignObject>
        </g>
      );
    } else if (element.type === "room") {
      return (
        <g
          key={element.id}
          onMouseDown={(e) => handleMouseDown(element, e)}
          className={selectedElement?.id === element.id ? "stroke-blue-500" : ""}
        >
          <foreignObject
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
          >
            <ThreeMaterialRenderer
              elementId={element.id}
              materialPreset={materialPreset}
              width={element.width}
              height={element.height}
              type="room"
            />
          </foreignObject>
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
          className={selectedElement?.id === element.id ? "stroke-blue-500" : ""}
        >
          <foreignObject
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
          >
            <ThreeMaterialRenderer
              elementId={element.id}
              materialPreset={materialPreset}
              width={element.width}
              height={element.height}
              type="surface"
            />
          </foreignObject>
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
                materialPreset={materialPreset}
                width={element.width}
                height={element.height}
                type={element.type}
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
        onClick={(e) => {
          if (drawingMode) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round((e.clientX - rect.left) / 20) * 20;
            const y = Math.round((e.clientY - rect.top) / 20) * 20;
            onCanvasClick(x, y);
          }
        }}
      >
        <g>
          {/* Grid */}
          {gridLines}

          {/* Drawing Preview */}
          {drawingMode === "room" && drawingPoints.length > 0 && (
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
          {elements.map(renderElement)}
        </g>
      </svg>
    </Card>
  );
};

export default Canvas;

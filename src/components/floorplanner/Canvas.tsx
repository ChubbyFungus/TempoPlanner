import React, { useState, useEffect, useRef } from "react";
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
  scale?: number;
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
  scale = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 932, height: 982 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 932, height: 982 });

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        setViewBox(prev => ({ ...prev, width, height }));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setIsPanning(true);
        document.body.style.cursor = 'grab';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanning(false);
        document.body.style.cursor = 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.body.style.cursor = 'default';
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanning) {
      setLastMousePos({ x: e.clientX, y: e.clientY });
      document.body.style.cursor = 'grabbing';
      return;
    }

    if (e.target instanceof Element && (e.target as HTMLElement).closest('g')) {
      const element = elements.find(el => el.id === (e.target as HTMLElement).closest('g')?.getAttribute('data-id'));
      if (element) {
        onElementSelect(element);
        setIsDragging(true);
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && e.buttons === 1) {
      const dx = (e.clientX - lastMousePos.x) / scale;
      const dy = (e.clientY - lastMousePos.y) / scale;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDragging && selectedElement) {
      const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const newX = Math.round((e.clientX - canvasRect.left - dragOffset.x) / 20) * 20;
      const newY = Math.round((e.clientY - canvasRect.top - dragOffset.y) / 20) * 20;
      onElementMove(selectedElement, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isPanning) {
      document.body.style.cursor = 'grab';
    }
  };

  const renderElement = (element: CanvasElement) => {
    const materialPreset = getMaterialPreset(element.type);
    
    if (element.type === "wall") {
      const [start, end] = element.points || [];
      return (
        <g
          key={element.id}
          onMouseDown={(e) => handleMouseDown(e)}
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
          onMouseDown={(e) => handleMouseDown(e)}
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
          onMouseDown={(e) => handleMouseDown(e)}
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
          onMouseDown={(e) => handleMouseDown(e)}
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
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="bg-white"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Grid Lines */}
        <g>
          {/* Vertical lines */}
          {Array.from({ length: Math.ceil(dimensions.width / 20) + 1 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * 20}
              y1={0}
              x2={i * 20}
              y2={dimensions.height}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: Math.ceil(dimensions.height / 20) + 1 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * 20}
              x2={dimensions.width}
              y2={i * 20}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Elements */}
        {elements.map(element => (
          <g key={element.id} data-id={element.id}>
            {renderElement(element)}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Canvas;

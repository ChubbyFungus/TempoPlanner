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
  onDrawComplete?: (points: Point[]) => void;
  onElementSelect: (element: CanvasElement | null) => void;
  onElementMove: (element: CanvasElement, newX: number, newY: number) => void;
  onCanvasClick?: (x: number, y: number) => void;
  onDoubleClick?: () => void;
  onAddElements?: (elements: CanvasElement[]) => void;
  scale?: number;
  wallStartPoint?: Point | null;
  drawingPoints?: Point[];
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
  onDoubleClick = () => {},
  onElementSelect = () => {},
  onElementMove = () => {},
  onAddElements = () => {},
  scale = 1,
  wallStartPoint = null,
  drawingPoints = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 932, height: 982 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 932, height: 982 });
  const [mousePosition, setMousePosition] = useState<Point | null>(null);

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

  // Helper function to convert screen coordinates to SVG coordinates
  const convertToSVGCoordinates = (clientX: number, clientY: number) => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return { x: 0, y: 0 };

    const pt = svgElement.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const svgP = pt.matrixTransform(svgElement.getScreenCTM()?.inverse());
    return {
      x: Math.round((svgP.x + viewBox.x) / 20) * 20,
      y: Math.round((svgP.y + viewBox.y) / 20) * 20
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanning) {
      setLastMousePos({ x: e.clientX, y: e.clientY });
      document.body.style.cursor = 'grabbing';
      return;
    }

    const coords = convertToSVGCoordinates(e.clientX, e.clientY);

    // Handle drawing modes
    if (drawingMode === "wall" || drawingMode === "surface" || drawingMode === "room") {
      onCanvasClick(coords.x, coords.y);
      return;
    }

    // Handle element selection
    if (e.target instanceof Element && (e.target as HTMLElement).closest('g[data-id]')) {
      const element = elements.find(el => el.id === (e.target as HTMLElement).closest('g[data-id]')?.getAttribute('data-id'));
      if (element) {
        onElementSelect(element);
        setIsDragging(true);
        setDragOffset({
          x: coords.x - (element.x || 0),
          y: coords.y - (element.y || 0)
        });
      }
    } else {
      onElementSelect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = convertToSVGCoordinates(e.clientX, e.clientY);
    setMousePosition(coords);

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
      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;
      onElementMove(selectedElement, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isPanning) {
      document.body.style.cursor = 'grab';
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (drawingMode) {
      e.preventDefault();
      onDoubleClick();
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
          data-id={element.id}
          onMouseDown={(e) => handleMouseDown(e)}
          className={`cursor-move ${selectedElement?.id === element.id ? "stroke-blue-500" : ""}`}
        >
          {element.points && (
            <>
              <path
                d={`M ${element.points[0].x} ${element.points[0].y} ${element.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} Z`}
                fill="#f3f4f6"
                stroke={selectedElement?.id === element.id ? "#3b82f6" : "#d1d5db"}
                strokeWidth="8"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <text
                x={element.x + element.width / 2}
                y={element.y + element.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none text-sm fill-gray-600 pointer-events-none"
              >
                {`${convertToSquareFeet(calculatePolygonArea(element.points))} sq ft`}
              </text>
            </>
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
      const isAppliance = element.type.toLowerCase().includes("refrigerator") || 
                         element.type.toLowerCase().includes("sub-zero") ||
                         element.type.toLowerCase().includes("thermador") ||
                         element.type.toLowerCase().includes("liebherr");
      
      return (
        <g
          key={element.id}
          data-id={element.id}
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
              <text
                x={element.width / 2}
                y={element.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none text-xs fill-gray-600"
              >
                {`${element.width}"W`}
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
        onMouseLeave={() => setMousePosition(null)}
        onDoubleClick={handleDoubleClick}
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

        {/* Drawing Preview */}
        {drawingMode === "wall" && wallStartPoint && mousePosition && (
          <line
            x1={wallStartPoint.x}
            y1={wallStartPoint.y}
            x2={mousePosition.x}
            y2={mousePosition.y}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4"
          />
        )}

        {drawingMode === "surface" && wallStartPoint && mousePosition && (
          <rect
            x={Math.min(wallStartPoint.x, mousePosition.x)}
            y={Math.min(wallStartPoint.y, mousePosition.y)}
            width={Math.abs(mousePosition.x - wallStartPoint.x)}
            height={Math.abs(mousePosition.y - wallStartPoint.y)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4"
          />
        )}

        {drawingMode === "room" && drawingPoints.length > 0 && mousePosition && (
          <g>
            <path
              d={`M ${drawingPoints[0].x} ${drawingPoints[0].y} ${drawingPoints.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${mousePosition.x} ${mousePosition.y} ${drawingPoints.length >= 3 ? `L ${drawingPoints[0].x} ${drawingPoints[0].y}` : ''}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4"
            />
            {drawingPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={index === 0 ? "#3b82f6" : "#fff"}
                stroke="#3b82f6"
                strokeWidth="2"
              />
            ))}
          </g>
        )}

        {/* Elements */}
        {elements.map(element => {
          const isAppliance = element.type.toLowerCase().includes("refrigerator") || 
                            element.type.toLowerCase().includes("sub-zero") ||
                            element.type.toLowerCase().includes("thermador") ||
                            element.type.toLowerCase().includes("liebherr");

          if (element.type === "wall") {
            const [start, end] = element.points || [];
            return (
              <g
                key={element.id}
                data-id={element.id}
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
                    materialPreset={getMaterialPreset(element.type)}
                    width={Math.abs(end.x - start.x) || element.thickness}
                    height={Math.abs(end.y - start.y) || element.thickness}
                    type="wall"
                  />
                </foreignObject>
              </g>
            );
          }

          if (element.type === "room") {
            return (
              <g
                key={element.id}
                data-id={element.id}
                onMouseDown={(e) => handleMouseDown(e)}
                className={`cursor-move ${selectedElement?.id === element.id ? "stroke-blue-500" : ""}`}
              >
                {element.points && (
                  <>
                    <path
                      d={`M ${element.points[0].x} ${element.points[0].y} ${element.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} Z`}
                      fill="#f3f4f6"
                      stroke={selectedElement?.id === element.id ? "#3b82f6" : "#d1d5db"}
                      strokeWidth="8"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <text
                      x={element.x + element.width / 2}
                      y={element.y + element.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="select-none text-sm fill-gray-600 pointer-events-none"
                    >
                      {`${convertToSquareFeet(calculatePolygonArea(element.points))} sq ft`}
                    </text>
                  </>
                )}
              </g>
            );
          }

          if (element.type === "surface") {
            return (
              <g
                key={element.id}
                data-id={element.id}
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
                    materialPreset={getMaterialPreset(element.type)}
                    width={element.width}
                    height={element.height}
                    type="surface"
                  />
                </foreignObject>
              </g>
            );
          }
          
          return (
            <g 
              key={element.id} 
              data-id={element.id}
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
                    materialPreset={getMaterialPreset(element.type)}
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
                  <text
                    x={element.width / 2}
                    y={element.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none text-xs fill-gray-600"
                  >
                    {`${element.width}"W`}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Canvas;

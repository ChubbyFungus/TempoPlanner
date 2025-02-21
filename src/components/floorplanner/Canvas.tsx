import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import LayersPanel from "./LayersPanel";
import { ThreeMaterialRenderer } from "./ThreeMaterialRenderer";
import ThreeRoomRenderer from "./ThreeRoomRenderer";
import { MATERIAL_PRESETS } from "@/lib/materials";
import { snapToGrid, snapToNearestCorner, snapToNearestWall, validateWallSegment, validateCorner } from "@/lib/wallUtils";
import { Point, WallSegment, Corner } from "@/types/shared";
import { MaterialCategory, MaterialId } from "@/types/materials";
import { MaterialDefinition } from "@/lib/materials";
import { MaterialPreset } from "@/types/shared";

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
  materialPreset?: MaterialPreset | null;
  overlayPreset?: any | null;
  selectedCorner?: Corner;
  selectedCornerIndex?: number;
  selectedWall?: WallSegment;
  selectedWallIndex?: number;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  elements: Element[];
}

interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface DragState {
  startX: number;
  startY: number;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
}

interface Props {
  viewMode?: "2d" | "3d";
  selectedElement?: Element;
  onElementSelect?: (element: Element) => void;
  onElementUpdate?: (element: Element) => void;
  layers: Layer[];
  activeLayer?: string;
  onLayerAdd?: () => void;
  onLayerDelete?: (id: string) => void;
  onLayerVisibilityToggle?: (id: string) => void;
  onLayerSelect?: (id: string) => void;
  drawingMode: string;
  setDrawingMode: (mode: string) => void;
  onCanvasClick?: (x: number, y: number) => void;
  onDoubleClick?: () => void;
  scale?: number;
  wallStartPoint?: Point | null;
  drawingPoints?: Point[];
  wallSegments?: WallSegment[];
  corners?: Corner[];
  onWallValidationError?: (errors: string[]) => void;
}

const getMaterialPreset = (type: string): MaterialPreset => {
  const preset = MATERIAL_PRESETS[type] || MATERIAL_PRESETS.default;
  return {
    category: 'appliances' as MaterialCategory,
    materialId: 'default' as MaterialId,
    settings: {
      normalScale: 0.6,
      roughness: 0.8,
      metalness: 0.2,
      displacementScale: 0.015,
      textureScale: { x: 1, y: 1 }
    }
  };
};

const RoomElement = memo(({ element, selected, onSelect, viewMode, drawingMode }: {
  element: Element;
  selected: boolean;
  onSelect: (element: Element) => void;
  viewMode: "2d" | "3d";
  drawingMode: string;
}) => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  console.log('RoomElement render:', {
    element,
    points: element.points,
    width: element.width,
    height: element.height,
    x: element.x,
    y: element.y
  });

  const handleCornerClick = (e: React.MouseEvent, corner: Corner, index: number) => {
    if (drawingMode !== "select") return;
    e.stopPropagation();
    setSelectedPart(`corner-${index}`);
    onSelect({
      ...element,
      selectedCorner: corner,
      selectedCornerIndex: index
    });
  };

  const handleWallClick = (e: React.MouseEvent, wall: WallSegment, index: number) => {
    if (drawingMode !== "select") return;
    e.stopPropagation();
    setSelectedPart(`wall-${index}`);
    onSelect({
      ...element,
      selectedWall: wall,
      selectedWallIndex: index
    });
  };

  const handleRoomClick = (e: React.MouseEvent) => {
    if (drawingMode !== "select") return;
    e.stopPropagation();
    setSelectedPart(null);
    onSelect(element);
  };

  return (
    <div
      className={`absolute room-element ${selected ? "ring-2 ring-primary" : ""}`}
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        cursor: drawingMode === "select" ? "pointer" : "default",
        pointerEvents: drawingMode === "select" ? "all" : "none",
        zIndex: 10,
        transformOrigin: "top left"
      }}
      onClick={(e) => {
        if (drawingMode === "select") {
          e.stopPropagation();
          onSelect(element);
        }
      }}
    >
      {viewMode === "2d" ? (
        <svg
          width={element.width}
          height={element.height}
          className="absolute inset-0"
          viewBox={`0 0 ${element.width} ${element.height}`}
          style={{ overflow: 'visible', pointerEvents: drawingMode === "select" ? "all" : "none" }}
        >
          {/* Room outline */}
          <path
            d={`M ${element.points?.map(p => `${p.x - element.x} ${p.y - element.y}`).join(" L ")} Z`}
            fill={element.color || "#f3f4f6"}
            stroke="#000"
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
              onClick={(e) => handleWallClick(e, wall, index)}
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
                cursor: drawingMode === "select" ? "pointer" : "default",
                pointerEvents: drawingMode === "select" ? "all" : "none"
              }}
              onClick={(e) => handleCornerClick(e, corner, index)}
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

const Canvas = ({
  viewMode = "2d",
  selectedElement,
  onElementSelect,
  onElementUpdate,
  layers = [],
  activeLayer,
  onLayerAdd,
  onLayerDelete,
  onLayerVisibilityToggle,
  onLayerSelect,
  drawingMode,
  setDrawingMode,
  onCanvasClick,
  onDoubleClick,
  scale = 1,
  wallStartPoint,
  drawingPoints = [],
  wallSegments = [],
  corners = [],
  onWallValidationError,
}: Props) => {
  const [mousePos, setMousePos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 2.0,
    offsetX: window.innerWidth / 2 - 1000,
    offsetY: window.innerHeight / 2 - 1000
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      e.preventDefault();
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      
      setViewport(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDragging && dragState) {
      const rect = e.currentTarget.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - viewport.offsetX) / viewport.scale;
      const currentY = (e.clientY - rect.top - viewport.offsetY) / viewport.scale;
      
      let width = Math.abs(currentX - dragState.startX);
      let height = width / dragState.aspectRatio;
      
      width = Math.max(width, 200);
      height = Math.max(height, 200);
      
      const updatedElement: Partial<Element> = {
        width,
        height,
        points: [
          { x: dragState.startX, y: dragState.startY },
          { x: dragState.startX + width, y: dragState.startY },
          { x: dragState.startX + width, y: dragState.startY + height },
          { x: dragState.startX, y: dragState.startY + height }
        ]
      };
      
      const targetLayer = layers.find(layer => layer.id === activeLayer) || layers[0];
      const roomElement = targetLayer?.elements.find(el => el.type === "room" && el === selectedElement);
      
      if (roomElement) {
        onElementUpdate?.({
          ...roomElement,
          ...updatedElement
        });
      }
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = e.currentTarget.parentElement?.scrollLeft || 0;
    const scrollTop = e.currentTarget.parentElement?.scrollTop || 0;

    let x = (e.clientX + scrollLeft - rect.left) / scale;
    let y = (e.clientY + scrollTop - rect.top) / scale;

    const point = { x, y };
    let snappedPoint = snapToGrid(point);

    const cornerSnap = snapToNearestCorner(point, corners);
    if (cornerSnap) {
      snappedPoint = cornerSnap;
    } else {
      const wallSnap = snapToNearestWall(point, wallSegments);
      if (wallSnap) {
        snappedPoint = wallSnap;
      }
    }

    setMousePos(snappedPoint);
  }, [scale, corners, wallSegments, isPanning, lastMousePos, isDragging, dragState, layers, onElementUpdate, selectedElement, activeLayer, viewport]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!onCanvasClick) return;

    if (drawingMode === "select") {
      const target = e.target as HTMLElement;
      const roomElement = target.closest('.room-element');
      
      if (roomElement) {
        return;
      }

      if (onElementSelect) {
        onElementSelect(null);
      }
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = e.currentTarget.parentElement?.scrollLeft || 0;
    const scrollTop = e.currentTarget.parentElement?.scrollTop || 0;

    let x = (e.clientX + scrollLeft - rect.left) / scale;
    let y = (e.clientY + scrollTop - rect.top) / scale;

    const point = { x, y };
    let snappedPoint = snapToGrid(point);

    const cornerSnap = snapToNearestCorner(point, corners);
    if (cornerSnap) {
      snappedPoint = cornerSnap;
    } else {
      const wallSnap = snapToNearestWall(point, wallSegments);
      if (wallSnap) {
        snappedPoint = wallSnap;
      }
    }

    if (drawingMode === "draw-wall" && drawingPoints.length > 0) {
      const newWall: WallSegment = {
        start: drawingPoints[drawingPoints.length - 1],
        end: snappedPoint,
        thickness: 6
      };

      const errors = validateWallSegment(newWall, wallSegments);
      setValidationErrors(errors);
      
      if (errors.length > 0) {
        onWallValidationError?.(errors);
        return;
      }
    }

    onCanvasClick(snappedPoint.x, snappedPoint.y);
  }, [scale, corners, wallSegments, drawingMode, drawingPoints, onCanvasClick, onWallValidationError, onElementSelect]);

  const handleDoubleClick = () => {
    onDoubleClick?.();
  };

  const debugRoomPoints = drawingPoints;

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(Math.max(viewport.scale + delta, 1.0), 5);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const pointXBeforeZoom = (mouseX - viewport.offsetX) / viewport.scale;
    const pointYBeforeZoom = (mouseY - viewport.offsetY) / viewport.scale;
    
    const pointXAfterZoom = (mouseX - viewport.offsetX) / newScale;
    const pointYAfterZoom = (mouseY - viewport.offsetY) / newScale;
    
    const newOffsetX = viewport.offsetX + (pointXAfterZoom - pointXBeforeZoom) * newScale;
    const newOffsetY = viewport.offsetY + (pointYAfterZoom - pointYBeforeZoom) * newScale;
    
    setViewport({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY
    });
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    console.log('Drawing Mode:', drawingMode);
    console.log('Drawing Points:', drawingPoints);
    console.log('Debug Room Points:', debugRoomPoints);
    
    if (drawingMode === "draw-room") {
      console.log('Room Drawing Mode Active');
      console.log('Room Points Length:', debugRoomPoints.length);
      if (debugRoomPoints.length > 0) {
        console.log('Room Points:', debugRoomPoints);
      }
      if (debugRoomPoints.length > 2 && viewMode === "3d") {
        console.log('3D Room Preview Available');
      }
    }
  }, [drawingMode, drawingPoints, debugRoomPoints, viewMode]);

  console.log('Render - Drawing Mode:', drawingMode);
  console.log('Render - Drawing Points:', drawingPoints);
  console.log('Render - Debug Room Points:', debugRoomPoints);

  useEffect(() => {
    const centerCanvas = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      if (!parent) return;

      const newOffsetX = (parent.clientWidth / 2) - (1000 * viewport.scale);
      const newOffsetY = (parent.clientHeight / 2) - (1000 * viewport.scale);

      setViewport(prev => ({
        ...prev,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      }));
    };

    centerCanvas();
    window.addEventListener('resize', centerCanvas);
    return () => window.removeEventListener('resize', centerCanvas);
  }, [viewport.scale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grab';
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        setIsPanning(false);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = drawingMode === "select" ? "default" : "crosshair";
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, drawingMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log('MouseDown - Drawing Mode:', drawingMode);
    
    if (drawingMode === "draw-room") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left - viewport.offsetX) / viewport.scale;
      const y = (e.clientY - rect.top - viewport.offsetY) / viewport.scale;
      
      console.log('Room Start Position:', { x, y });
      
      const initialWidth = 200;
      const initialHeight = 200;
      const aspectRatio = 1;
      
      setDragState({
        startX: x,
        startY: y,
        originalWidth: initialWidth,
        originalHeight: initialHeight,
        aspectRatio
      });
      
      setIsDragging(true);
      
      const newElement: Element = {
        id: `room-${Date.now()}`,
        type: "room",
        x,
        y,
        width: initialWidth,
        height: initialHeight,
        rotation: 0,
        locked: false,
        points: [
          { x, y },
          { x: x + initialWidth, y },
          { x: x + initialWidth, y: y + initialHeight },
          { x, y: y + initialHeight }
        ],
        wallSegments: [],
        corners: []
      };

      console.log('Created Room Element:', newElement);

      const targetLayer = layers.find(layer => layer.id === activeLayer) || layers[0];
      if (targetLayer) {
        console.log('Target Layer:', targetLayer.id);
        onElementUpdate?.(newElement);
        onElementSelect?.(newElement);
      }
    }
  }, [drawingMode, onElementSelect, onElementUpdate, layers, activeLayer, viewport]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragState(null);
      setDrawingMode("select");
    }
  }, [isDragging, setDrawingMode]);

  return (
    <div className="relative w-full h-full bg-background flex overflow-hidden">
      <div
        ref={canvasRef}
        className="absolute bg-white"
        style={{
          width: "4000px",
          height: "4000px",
          transform: `scale(${viewport.scale})`,
          transformOrigin: "top left",
          left: `${viewport.offsetX}px`,
          top: `${viewport.offsetY}px`,
          cursor: isSpacePressed ? (isPanning ? 'grabbing' : 'grab') : (drawingMode === "select" ? "default" : "crosshair"),
          willChange: "transform",
          userSelect: 'none'
        }}
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
        onMouseMove={handleMouseMove}
        onMouseDown={(e) => {
          e.preventDefault();
          handleMouseDown(e);
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 grid-background"
          style={{
            backgroundImage:
              "linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.2,
            pointerEvents: "all"
          }}
        />

        {drawingMode === "draw-wall" && wallStartPoint && (
          <>
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 999 }}>
              <circle
                cx={wallStartPoint.x - 1000}
                cy={wallStartPoint.y - 1000}
                r={4}
                fill="#000"
                stroke="white"
                strokeWidth="2"
              />
              {mousePos && (
                <>
                  <line
                    x1={wallStartPoint.x - 1000}
                    y1={wallStartPoint.y - 1000}
                    x2={mousePos.x - 1000}
                    y2={mousePos.y - 1000}
                    stroke="#000"
                    strokeWidth="4"
                  />
                  <circle
                    cx={mousePos.x - 1000}
                    cy={mousePos.y - 1000}
                    r={4}
                    fill="#000"
                    stroke="white"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
          </>
        )}

        {drawingMode === "draw-surface" && (
          <>
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 999 }}
            >
              {drawingPoints.length > 0 && (
                <>
                  {drawingPoints.map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = drawingPoints[index - 1];
                    return (
                      <line
                        key={index}
                        x1={prevPoint.x - 1000}
                        y1={prevPoint.y - 1000}
                        x2={point.x - 1000}
                        y2={point.y - 1000}
                        stroke="#666"
                        strokeWidth="2"
                      />
                    );
                  })}
                  {mousePos && (
                    <line
                      x1={drawingPoints[drawingPoints.length - 1].x - 1000}
                      y1={drawingPoints[drawingPoints.length - 1].y - 1000}
                      x2={mousePos.x - 1000}
                      y2={mousePos.y - 1000}
                      stroke="#000"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  )}
                  {drawingPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x - 1000}
                      cy={point.y - 1000}
                      r={4}
                      fill={index === 0 ? "#00ff00" : "#000"}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </>
              )}
              {wallStartPoint && (
                <circle
                  cx={wallStartPoint.x - 1000}
                  cy={wallStartPoint.y - 1000}
                  r={4}
                  fill="#000"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
            </svg>
            {drawingPoints.length > 2 && viewMode === "3d" && (
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 998,
                  pointerEvents: "none",
                }}
              >
                <ThreeRoomRenderer
                  points={drawingPoints.map((p) => ({
                    x: p.x - 1000,
                    y: p.y - 1000,
                  }))}
                  viewMode={viewMode}
                />
              </div>
            )}
          </>
        )}

        {drawingMode === "draw-room" && (
          <>
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 2000 }}
              viewBox="0 0 4000 4000"
            >
              {debugRoomPoints.length === 0 && (
                <text x="10" y="20" fill="black" fontSize="16">No Points Yet</text>
              )}
              {debugRoomPoints.length > 0 && (
                <>
                  {debugRoomPoints.map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = debugRoomPoints[index - 1];
                    return (
                      <line
                        key={index}
                        x1={prevPoint.x}
                        y1={prevPoint.y}
                        x2={point.x}
                        y2={point.y}
                        stroke="#000"
                        strokeWidth="2"
                      />
                    );
                  })}
                  {mousePos && debugRoomPoints.length > 0 && (
                    <line
                      x1={debugRoomPoints[debugRoomPoints.length - 1].x}
                      y1={debugRoomPoints[debugRoomPoints.length - 1].y}
                      x2={mousePos.x}
                      y2={mousePos.y}
                      stroke="#000"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  )}
                  {debugRoomPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r={4}
                      fill={index === 0 ? "#00ff00" : "#000"}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </>
              )}
            </svg>
            {debugRoomPoints.length > 2 && viewMode === "3d" && (
              <div
                className="absolute inset-0"
                style={{ zIndex: 1999, pointerEvents: "none" }}
              >
                <ThreeRoomRenderer
                  points={debugRoomPoints.map((p) => ({ x: p.x, y: p.y }))}
                  viewMode={viewMode}
                />
              </div>
            )}
          </>
        )}

        {layers.map(
          (layer) =>
            layer.visible && (
              <div
                key={layer.id}
                className="absolute inset-0"
                style={{ 
                  zIndex: layer.id === "layer-0" ? 0 : 1,
                  pointerEvents: layer.id === "layer-0" ? "none" : "auto"
                }}
              >
                {layer.elements.map((element) => {
                  if (element.type === "room") {
                    return (
                      <RoomElement
                        key={element.id}
                        element={element}
                        selected={selectedElement?.id === element.id}
                        onSelect={onElementSelect!}
                        viewMode={viewMode}
                        drawingMode={drawingMode}
                      />
                    );
                  }

                  if (element.type?.startsWith('appliance-')) {
                    return (
                      <div
                        className={`absolute ${selectedElement?.id === element.id ? "ring-2 ring-primary" : ""}`}
                        style={{
                          position: 'absolute',
                          left: `${element.x}px`,
                          top: `${element.y}px`,
                          width: `${element.width}px`,
                          height: `${element.height}px`,
                          transform: `rotate(${element.rotation}deg)`,
                          transformOrigin: 'center',
                          cursor: drawingMode === "select" ? "pointer" : "default",
                          zIndex: 2
                        }}
                        onClick={(e) => {
                          if (drawingMode === "select") {
                            e.stopPropagation();
                            onElementSelect?.(element);
                          }
                        }}
                      >
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <ThreeMaterialRenderer
                            elementId={element.id}
                            materialPreset={element.materialPreset || getMaterialPreset(element.type)}
                            width={element.width}
                            height={element.height}
                            type={element.type}
                            position={{ 
                              x: element.x,
                              y: 0, // Keep at ground level
                              z: element.y  // Use y coordinate for z position
                            }}
                            rotation={{ 
                              x: 0,
                              y: element.rotation * (Math.PI / 180), // Convert degrees to radians
                              z: 0 
                            }}
                          />
                        </div>
                      </div>
                    );
                  }

                  const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (drawingMode === "select") {
                      onElementSelect?.(element);
                    }
                  };

                  return (
                    <div
                      key={element.id}
                      className={`absolute ${selectedElement?.id === element.id ? "ring-2 ring-primary" : ""}`}
                      style={{
                        left: element.x - 1000,
                        top: element.y - 1000,
                        width: element.width,
                        height: element.height,
                        cursor: drawingMode === "select" ? "pointer" : "default",
                        zIndex: 2
                      }}
                      onClick={handleClick}
                    >
                      <ThreeMaterialRenderer
                        elementId={element.id}
                        materialPreset={{
                          category: "appliances" as MaterialCategory,
                          materialId: "stainlessSteel" as MaterialId,
                          settings: {
                            normalScale: 0.45,
                            roughness: 0.2,
                            metalness: 0.95,
                            displacementScale: 0.01,
                            textureScale: { x: 2, y: 2 }
                          }
                        }}
                        width={element.width}
                        height={element.height}
                        type={element.type}
                      />
                    </div>
                  );
                })}
              </div>
            ),
        )}

        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
          {wallSegments.map((wall, index) => (
            <g key={index}>
              <line
                x1={wall.start.x}
                y1={wall.start.y}
                x2={wall.end.x}
                y2={wall.end.y}
                stroke="#000"
                strokeWidth={wall.thickness}
                strokeLinecap="round"
              />
            </g>
          ))}
          {corners.map((corner, index) => (
            <circle
              key={index}
              cx={corner.x}
              cy={corner.y}
              r={4}
              fill="#000"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </svg>

        {validationErrors.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-red-100 p-2 rounded shadow-lg">
            {validationErrors.map((error, index) => (
              <p key={index} className="text-red-600 text-sm">{error}</p>
            ))}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "5px",
            border: "1px solid black",
            zIndex: 1000,
          }}
        >
          <div>{`Drawing Mode: ${drawingMode}`}</div>
          <div>{`Points Count: ${drawingPoints.length}`}</div>
          <div>{`Debug Points Count: ${debugRoomPoints.length}`}</div>
          <div>{`Mouse Position: ${JSON.stringify(mousePos)}`}</div>
        </div>
      </div>
    </div>
  );
};

export default memo(Canvas);
import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import LayersPanel from "./LayersPanel";
import { ThreeMaterialRenderer } from "./ThreeMaterialRenderer";
import ThreeRoomRenderer from "./ThreeRoomRenderer";
import { MATERIAL_PRESETS } from "@/lib/materials";
import { snapToGrid, snapToNearestCorner, snapToNearestWall, validateWallSegment, validateCorner, GRID_SIZE, SNAP_THRESHOLD } from "@/lib/wallUtils";
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
  onCanvasClick?: (x: number, y: number) => void;
  onDoubleClick?: () => void;
  scale?: number;
  wallStartPoint?: Point | null;
  drawingPoints?: Point[];
  wallSegments?: WallSegment[];
  corners?: Corner[];
  onWallValidationError?: (errors: string[]) => void;
  selectedRoomTemplate?: {
    points: Point[];
    width: number;
    height: number;
    wallSegments?: WallSegment[];
    corners?: Corner[];
  } | null;
  setDrawingMode?: (mode: string) => void;
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
  const [resizing, setResizing] = useState<{
    corner: string;
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    if (drawingMode !== "select") return;
    e.stopPropagation();
    setResizing({
      corner,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: element.width,
      initialHeight: element.height
    });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      let newWidth = resizing.initialWidth;
      let newHeight = resizing.initialHeight;
      let newX = element.x;
      let newY = element.y;

      switch (resizing.corner) {
        case 'nw':
          newWidth = resizing.initialWidth - dx;
          newHeight = resizing.initialHeight - dy;
          newX = element.x + dx;
          newY = element.y + dy;
          break;
        case 'ne':
          newWidth = resizing.initialWidth + dx;
          newHeight = resizing.initialHeight - dy;
          newY = element.y + dy;
          break;
        case 'sw':
          newWidth = resizing.initialWidth - dx;
          newHeight = resizing.initialHeight + dy;
          newX = element.x + dx;
          break;
        case 'se':
          newWidth = resizing.initialWidth + dx;
          newHeight = resizing.initialHeight + dy;
          break;
      }

      // Enforce minimum size
      const minSize = 50;
      newWidth = Math.max(newWidth, minSize);
      newHeight = Math.max(newHeight, minSize);

      // Snap to grid
      newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
      newWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE;
      newHeight = Math.round(newHeight / GRID_SIZE) * GRID_SIZE;

      onSelect({
        ...element,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, element, onSelect]);

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
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: element.width || 400,
        height: element.height || 300,
        transform: `rotate(${element.rotation}deg)`,
        cursor: drawingMode === "select" ? "pointer" : "default",
        pointerEvents: drawingMode === "select" ? "all" : "none",
        zIndex: selected ? 20 : 10,
        transformOrigin: "top left",
        willChange: "transform",
        position: "absolute"
      }}
      onClick={handleRoomClick}
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
          {/* Resize handles (only shown when selected) */}
          {selected && drawingMode === "select" && (
            <>
              {/* Northwest handle */}
              <rect
                x={-6}
                y={-6}
                width={12}
                height={12}
                fill="#0066cc"
                stroke="#fff"
                strokeWidth={2}
                style={{ cursor: 'nw-resize' }}
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
              />
              {/* Northeast handle */}
              <rect
                x={element.width - 6}
                y={-6}
                width={12}
                height={12}
                fill="#0066cc"
                stroke="#fff"
                strokeWidth={2}
                style={{ cursor: 'ne-resize' }}
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
              />
              {/* Southwest handle */}
              <rect
                x={-6}
                y={element.height - 6}
                width={12}
                height={12}
                fill="#0066cc"
                stroke="#fff"
                strokeWidth={2}
                style={{ cursor: 'sw-resize' }}
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
              />
              {/* Southeast handle */}
              <rect
                x={element.width - 6}
                y={element.height - 6}
                width={12}
                height={12}
                fill="#0066cc"
                stroke="#fff"
                strokeWidth={2}
                style={{ cursor: 'se-resize' }}
                onMouseDown={(e) => handleResizeStart(e, 'se')}
              />
            </>
          )}
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

const WallElement = memo(({ element, selected, onSelect, drawingMode }: {
  element: Element;
  selected: boolean;
  onSelect: (element: Element) => void;
  drawingMode: string;
}) => {
  const [resizing, setResizing] = useState<{
    endpoint: 'start' | 'end';
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const wall = element.wallSegments?.[0];
  if (!wall) return null;

  const handleEndpointMouseDown = (e: React.MouseEvent, endpoint: 'start' | 'end') => {
    if (drawingMode !== "select") return;
    e.stopPropagation();
    const point = endpoint === 'start' ? wall.start : wall.end;
    setResizing({
      endpoint,
      startX: e.clientX,
      startY: e.clientY,
      initialX: point.x,
      initialY: point.y
    });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      let newX = resizing.initialX + dx;
      let newY = resizing.initialY + dy;

      // Snap to grid
      newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

      // Update the wall with the new endpoint position
      const updatedWall = { ...wall };
      if (resizing.endpoint === 'start') {
        updatedWall.start = { x: newX, y: newY };
      } else {
        updatedWall.end = { x: newX, y: newY };
      }

      onSelect({
        ...element,
        wallSegments: [updatedWall]
      });
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, wall, element, onSelect]);

  return (
    <g>
      <line
        x1={wall.start.x}
        y1={wall.start.y}
        x2={wall.end.x}
        y2={wall.end.y}
        stroke={selected ? "#0066cc" : "#000"}
        strokeWidth={wall.thickness || 4}
        style={{
          cursor: drawingMode === "select" ? "pointer" : "default",
          pointerEvents: drawingMode === "select" ? "all" : "none"
        }}
        onClick={(e) => {
          if (drawingMode === "select") {
            e.stopPropagation();
            onSelect(element);
          }
        }}
      />
      {selected && drawingMode === "select" && (
        <>
          {/* Start endpoint handle */}
          <circle
            cx={wall.start.x}
            cy={wall.start.y}
            r={6}
            fill="#0066cc"
            stroke="#fff"
            strokeWidth={2}
            style={{ cursor: 'grab' }}
            onMouseDown={(e) => handleEndpointMouseDown(e, 'start')}
          />
          {/* End endpoint handle */}
          <circle
            cx={wall.end.x}
            cy={wall.end.y}
            r={6}
            fill="#0066cc"
            stroke="#fff"
            strokeWidth={2}
            style={{ cursor: 'grab' }}
            onMouseDown={(e) => handleEndpointMouseDown(e, 'end')}
          />
        </>
      )}
    </g>
  );
});

function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

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
  onCanvasClick,
  onDoubleClick,
  scale = 1,
  wallStartPoint,
  drawingPoints = [],
  wallSegments = [],
  corners = [],
  onWallValidationError,
  selectedRoomTemplate,
  setDrawingMode,
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
  const [dragState, setDragState] = useState({
    startX: 0,
    startY: 0,
    originalWidth: 0,
    originalHeight: 0,
    aspectRatio: 1
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

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

    // Calculate mouse position in world coordinates
    const worldX = (e.clientX - canvasRect.left - viewport.offsetX) / viewport.scale;
    const worldY = (e.clientY - canvasRect.top - viewport.offsetY) / viewport.scale;

    const point = { x: worldX, y: worldY };
    const snappedPoint = snapToGrid(point);

    // Only log every 100ms to avoid console spam
    if (Date.now() % 100 === 0) {
      console.log('%cMouse Move', 'color: gray', {
        mouse: { x: e.clientX, y: e.clientY },
        world: point,
        snapped: snappedPoint,
        viewport: {
          scale: viewport.scale,
          offset: { x: viewport.offsetX, y: viewport.offsetY }
        }
      });
    }

    setMousePos(snappedPoint);
  }, [viewport, isPanning, lastMousePos.x, lastMousePos.y]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!onCanvasClick) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Calculate click position in world coordinates
    const worldX = (e.clientX - canvasRect.left - viewport.offsetX) / viewport.scale;
    const worldY = (e.clientY - canvasRect.top - viewport.offsetY) / viewport.scale;

    const point = { x: worldX, y: worldY };
    const snappedPoint = snapToGrid(point);

    console.log('%cClick Debug', 'color: blue; font-weight: bold', {
      mouse: { x: e.clientX, y: e.clientY },
      world: point,
      snapped: snappedPoint,
      viewport
    });

    // Pass the click coordinates to the parent component
    onCanvasClick(snappedPoint.x, snappedPoint.y);
  }, [viewport, onCanvasClick]);

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
    // Handle panning
    if (isSpacePressed) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    // Handle selection mode
    if (drawingMode === "select") {
      const target = e.target as HTMLElement;
      const roomElement = target.closest('.room-element');
      
      if (!roomElement) {
        onElementSelect?.(null);
      }
    }
  }, [drawingMode, onElementSelect, isSpacePressed]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = isSpacePressed ? 'grab' : (drawingMode === "select" ? "default" : "crosshair");
      }
    }
  }, [isPanning, isSpacePressed, drawingMode]);

  // Add debug logging for render
  console.log('Canvas Render Debug:', {
    drawingMode,
    selectedRoomTemplate,
    mousePos,
    viewportScale: viewport.scale
  });

  // Add debug effect for state changes
  useEffect(() => {
    console.log('State Change Debug:', {
      drawingMode,
      selectedRoomTemplate,
      mousePos
    });
  }, [drawingMode, selectedRoomTemplate, mousePos]);

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
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 2000 }}
            viewBox="0 0 4000 4000"
          >
            {drawingPoints.length > 0 && (
              <>
                {drawingPoints.map((point, index) => {
                  if (index === 0) return null;
                  const prevPoint = drawingPoints[index - 1];
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
                {mousePos && (
                  <line
                    x1={drawingPoints[drawingPoints.length - 1].x}
                    y1={drawingPoints[drawingPoints.length - 1].y}
                    x2={mousePos.x}
                    y2={mousePos.y}
                    stroke="#000"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}
                {drawingPoints.map((point, index) => (
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
                {mousePos && drawingPoints.length >= 3 && 
                 getDistance(mousePos, drawingPoints[0]) <= SNAP_THRESHOLD && (
                  <circle
                    cx={drawingPoints[0].x}
                    cy={drawingPoints[0].y}
                    r={8}
                    fill="none"
                    stroke="#00ff00"
                    strokeWidth="2"
                  />
                )}
              </>
            )}
          </svg>
        )}

        {/* Room preview when in draw-room mode */}
        {drawingMode === "draw-room" && mousePos && selectedRoomTemplate && (
          <svg
            className="absolute inset-0"
            style={{ 
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 2000,
              overflow: "visible"
            }}
          >
            <g transform={`translate(${mousePos.x}, ${mousePos.y})`}>
              {/* Room outline */}
              <path
                d={`M ${selectedRoomTemplate.points.map(p => `${p.x} ${p.y}`).join(" L ")} Z`}
                fill="rgba(243, 244, 246, 0.7)"
                stroke="#000"
                strokeWidth={2 / viewport.scale}
                strokeDasharray="5,5"
              />
              {/* Corner points */}
              {selectedRoomTemplate.points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={4 / viewport.scale}
                  fill="#000"
                  stroke="#fff"
                  strokeWidth={2 / viewport.scale}
                />
              ))}
            </g>
          </svg>
        )}

        {/* Layers */}
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${viewport.scale})`,
            transformOrigin: "top left",
            left: `${viewport.offsetX}px`,
            top: `${viewport.offsetY}px`
          }}
        >
          {layers.map((layer) =>
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
                  return null;
                })}
              </div>
            )
          )}
        </div>

        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
          {wallSegments.map((wall, index) => {
            const wallElement: Element = {
              id: `wall-${index}`,
              x: wall.start.x,
              y: wall.start.y,
              width: wall.end.x - wall.start.x,
              height: wall.end.y - wall.start.y,
              type: "wall",
              rotation: 0,
              locked: false,
              wallSegments: [wall],
              color: "#000"
            };
            return (
              <WallElement
                key={wallElement.id}
                element={wallElement}
                selected={selectedElement?.id === wallElement.id}
                onSelect={onElementSelect!}
                drawingMode={drawingMode}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default Canvas;
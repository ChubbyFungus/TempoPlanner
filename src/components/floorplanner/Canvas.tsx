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
import { createLogger } from '@/lib/logger';

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

interface LoggedMousePosition {
  x: number;
  y: number;
  timestamp: number;
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

const logger = createLogger('Canvas');

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
        pointerEvents: drawingMode === "select" ? "all" : "none",
        zIndex: selected ? 20 : 10,
        transformOrigin: "top left",
        willChange: "transform",
        position: "absolute"
      }}
      onClick={handleClick}
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

// Throttle helper
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean;
  let lastResult: any;
  return ((...args: Parameters<T>): any => {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  }) as T;
}

// Increase throttle time and add debounce for mouse movement logging
const MOUSE_LOG_THROTTLE = 2000; // Only log every 2 seconds
const MOUSE_MOVE_THRESHOLD = 50; // Only log if mouse has moved more than 50 pixels

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

  // State tracking refs for logging
  const prevStateRef = useRef({
    drawingMode: '',
    pointsLength: 0,
    debugPointsLength: 0
  });

  // Update ref type
  const lastLoggedMousePos = useRef<LoggedMousePosition>({
    x: 0,
    y: 0,
    timestamp: Date.now()
  });

  // Updated throttled logger for mouse movements
  const logMouseMove = throttle((data: any) => {
    const currentPos = data.position;
    const lastPos = lastLoggedMousePos.current;
    
    // Calculate distance moved
    const dx = currentPos.x - lastPos.x;
    const dy = currentPos.y - lastPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Only log if moved significantly
    if (distance > MOUSE_MOVE_THRESHOLD) {
      logger.debug('Mouse Move', {
        ...data,
        distance,
        timeSinceLastLog: Date.now() - lastLoggedMousePos.current.timestamp
      });
      
      // Update last logged position
      lastLoggedMousePos.current = {
        x: currentPos.x,
        y: currentPos.y,
        timestamp: Date.now()
      };
    }
  }, MOUSE_LOG_THROTTLE);

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

    // Log preview position when in draw-room mode
    if (drawingMode === "draw-room" && selectedRoomTemplate) {
      logger.debug('Room Preview Position', JSON.stringify({
        mouseEvent: {
          client: { x: e.clientX, y: e.clientY },
          canvas: { x: worldX, y: worldY },
          snapped: snappedPoint
        },
        viewport: {
          scale: viewport.scale,
          offset: { x: viewport.offsetX, y: viewport.offsetY }
        },
        previewPoints: selectedRoomTemplate.points.map(p => ({
          original: { x: p.x, y: p.y },
          adjusted: { x: p.x + snappedPoint.x, y: p.y + snappedPoint.y }
        }))
      }, null, 2));
    }

    setMousePos(snappedPoint);
  }, [viewport, isPanning, lastMousePos.x, lastMousePos.y, drawingMode, drawingPoints, selectedRoomTemplate]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!onCanvasClick) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Calculate click position in world coordinates
    const worldX = (e.clientX - canvasRect.left - viewport.offsetX) / viewport.scale;
    const worldY = (e.clientY - canvasRect.top - viewport.offsetY) / viewport.scale;

    const point = { x: worldX, y: worldY };
    const snappedPoint = snapToGrid(point);

    logger.info('Room Placement Click', JSON.stringify({
      mouseEvent: {
        client: { x: e.clientX, y: e.clientY },
        canvas: { x: worldX, y: worldY },
        snapped: snappedPoint,
        canvasRect: {
          left: canvasRect.left,
          top: canvasRect.top,
          width: canvasRect.width,
          height: canvasRect.height
        }
      },
      viewport: {
        scale: viewport.scale,
        offset: { x: viewport.offsetX, y: viewport.offsetY }
      },
      mode: drawingMode,
      selectedTemplate: selectedRoomTemplate ? {
        points: selectedRoomTemplate.points,
        dimensions: {
          width: selectedRoomTemplate.width,
          height: selectedRoomTemplate.height
        }
      } : null
    }, null, 2));

    onCanvasClick(snappedPoint.x, snappedPoint.y);
  }, [viewport, onCanvasClick, drawingMode, selectedRoomTemplate]);

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
      const roomElement = target.closest('.room-element') as HTMLElement;
      
      logger.info('Selection Attempt', {
        target: {
          className: target.className,
          id: target.id,
          tagName: target.tagName,
          rect: target.getBoundingClientRect(),
          parentClassName: target.parentElement?.className,
          parentTagName: target.parentElement?.tagName,
        },
        roomElement: roomElement ? {
          id: roomElement.id,
          className: roomElement.className,
          rect: roomElement.getBoundingClientRect(),
          elementId: roomElement.dataset.elementId,
          elementType: roomElement.dataset.elementType
        } : null,
        currentlySelected: selectedElement?.id,
        drawingMode,
        mouseEvent: {
          clientX: e.clientX,
          clientY: e.clientY,
          button: e.button,
          buttons: e.buttons,
          target: e.target instanceof HTMLElement ? {
            offsetX: e.nativeEvent.offsetX,
            offsetY: e.nativeEvent.offsetY,
          } : null
        },
        viewport: {
          scale: viewport.scale,
          offset: { x: viewport.offsetX, y: viewport.offsetY }
        }
      });
      
      if (!roomElement) {
        logger.info('Clearing selection', {
          previousSelection: selectedElement?.id,
          clickLocation: {
            client: { x: e.clientX, y: e.clientY },
            page: { x: e.pageX, y: e.pageY },
            screen: { x: e.screenX, y: e.screenY }
          }
        });
        onElementSelect?.(null);
      }
    }
  }, [drawingMode, onElementSelect, isSpacePressed, selectedElement, viewport]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = isSpacePressed ? 'grab' : (drawingMode === "select" ? "default" : "crosshair");
      }
    }
  }, [isPanning, isSpacePressed, drawingMode]);

  // Instead, use a single useEffect for significant state changes
  useEffect(() => {
    const prevState = prevStateRef.current;
    
    // Only log if there are meaningful changes
    if (prevState.drawingMode !== drawingMode || 
        prevState.pointsLength !== drawingPoints.length ||
        prevState.debugPointsLength !== debugRoomPoints.length) {
      
      // Log at debug level since this is development-only information
      logger.debug('Canvas State Update', {
        mode: {
          previous: prevState.drawingMode,
          current: drawingMode
        },
        points: {
          previous: prevState.pointsLength,
          current: drawingPoints.length
        },
        debugPoints: {
          previous: prevState.debugPointsLength,
          current: debugRoomPoints.length
        },
        viewMode,
        scale: viewport.scale
      });
      
      // Update the ref with current values
      prevStateRef.current = {
        drawingMode,
        pointsLength: drawingPoints.length,
        debugPointsLength: debugRoomPoints.length
      };
    }
  }, [drawingMode, drawingPoints, debugRoomPoints, viewMode, viewport.scale]);

  // Update click handler with simpler event typing
  const handleRoomClick = useCallback((element: Element) => {
    if (drawingMode !== "select") return;
    
    logger.info('Room Element Clicked', {
      element: {
        id: element.id,
        type: element.type,
        position: { x: element.x, y: element.y },
        dimensions: { width: element.width, height: element.height },
        rotation: element.rotation
      },
      previouslySelected: selectedElement?.id === element.id,
      drawingMode,
      viewport: {
        scale: viewport.scale,
        offset: { x: viewport.offsetX, y: viewport.offsetY }
      }
    });
    
    onElementSelect?.(element);
  }, [drawingMode, onElementSelect, selectedElement, viewport]);

  // Add selection state change logging with more context
  useEffect(() => {
    logger.info('Selection State Changed', {
      selectedElement: selectedElement ? {
        id: selectedElement.id,
        type: selectedElement.type,
        position: { x: selectedElement.x, y: selectedElement.y },
        dimensions: { width: selectedElement.width, height: selectedElement.height },
        rotation: selectedElement.rotation
      } : null,
      drawingMode,
      viewport: {
        scale: viewport.scale,
        offset: { x: viewport.offsetX, y: viewport.offsetY }
      },
      timestamp: new Date().toISOString()
    });
  }, [selectedElement, drawingMode, viewport]);

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
        {drawingMode === "draw-room" && selectedRoomTemplate && mousePos && (
          <>
            {/* 2D Preview */}
            {viewMode === "2d" && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  transform: `scale(${viewport.scale})`,
                  transformOrigin: "top left",
                  left: `${viewport.offsetX}px`,
                  top: `${viewport.offsetY}px`,
                  zIndex: 999
                }}
              >
                <svg 
                  width="4000"
                  height="4000"
                  viewBox="0 0 4000 4000"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                >
                  {(() => {
                    // Adjust coordinates for the viewBox
                    const adjustedPoints = selectedRoomTemplate.points.map(p => ({
                      x: p.x + mousePos.x,
                      y: p.y + mousePos.y
                    }));
                    
                    const previewPath = `M ${adjustedPoints.map(p => `${p.x} ${p.y}`).join(" L ")} Z`;
                    
                    return (
                      <>
                        <path
                          d={previewPath}
                          fill="#f3f4f6"
                          stroke="#0066cc"
                          strokeWidth="4"
                          strokeDasharray="10,10"
                          opacity="0.7"
                        />
                        {/* Add debug points to visualize the corners */}
                        {adjustedPoints.map((point, index) => (
                          <circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill="#0066cc"
                            stroke="white"
                            strokeWidth="2"
                            opacity="0.7"
                          />
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            )}
            {/* 3D Preview */}
            {viewMode === "3d" && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  transform: `scale(${viewport.scale})`,
                  transformOrigin: "top left",
                  left: `${viewport.offsetX}px`,
                  top: `${viewport.offsetY}px`,
                  zIndex: 1999
                }}
              >
                <ThreeRoomRenderer
                  points={selectedRoomTemplate.points.map(p => ({
                    x: p.x + mousePos.x,
                    y: p.y + mousePos.y
                  }))}
                  viewMode={viewMode}
                  wallHeight={96}
                  wallThickness={6}
                  isPreview={true}
                />
              </div>
            )}
          </>
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
                        onSelect={handleRoomClick}
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
import React, { useState } from "react";
import Toolbar from "./floorplanner/Toolbar";
import Canvas from "./floorplanner/Canvas";
import PropertiesPanel from "./floorplanner/PropertiesPanel";
import ActionBar from "./floorplanner/ActionBar";
import CatalogDialog from "./floorplanner/CatalogDialog";
import { Button } from "./ui/button";
import { ToolbarItem, CatalogItem, CanvasElement, Point, MaterialPreset, OverlayPreset } from "@/types/shared";

const isCatalogItem = (item: ToolbarItem | CatalogItem): item is CatalogItem => {
  return 'model' in item && 'brand' in item;
};

const Home = () => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [undoStack, setUndoStack] = useState<CanvasElement[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasElement[][]>([]);
  const [drawingMode, setDrawingMode] = useState("");
  const [wallStartPoint, setWallStartPoint] = useState<Point | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [mousePosition, setMousePosition] = useState<Point | null>(null);

  const handleDrawingModeChange = (mode: string) => {
    setDrawingMode(mode);
    setWallStartPoint(null);
    setDrawingPoints([]);
  };

  const handleCanvasClick = (x: number, y: number) => {
    const point = { x, y };

    if (drawingMode === "wall") {
      if (!wallStartPoint) {
        setWallStartPoint(point);
      } else {
        // Create wall element
        const newWall: CanvasElement = {
          id: `wall-${Date.now()}`,
          type: "wall",
          x: wallStartPoint.x,
          y: wallStartPoint.y,
          width: Math.abs(x - wallStartPoint.x),
          height: Math.abs(y - wallStartPoint.y),
          rotation: 0,
          locked: false,
          points: [wallStartPoint, point],
          thickness: 8,
        };

        setUndoStack([...undoStack, elements]);
        setElements([...elements, newWall]);
        setRedoStack([]);
        setWallStartPoint(null);
      }
    } else if (drawingMode === "surface") {
      if (!wallStartPoint) {
        setWallStartPoint(point);
      } else {
        // Create surface element
        const newSurface: CanvasElement = {
          id: `surface-${Date.now()}`,
          type: "surface",
          x: Math.min(wallStartPoint.x, x),
          y: Math.min(wallStartPoint.y, y),
          width: Math.abs(x - wallStartPoint.x),
          height: Math.abs(y - wallStartPoint.y),
          rotation: 0,
          locked: false,
          points: [
            wallStartPoint,
            { x, y: wallStartPoint.y },
            point,
            { x: wallStartPoint.x, y },
          ],
          color: "#e5e7eb",
        };

        setUndoStack([...undoStack, elements]);
        setElements([...elements, newSurface]);
        setRedoStack([]);
        setWallStartPoint(null);
        setDrawingMode("");
      }
    } else if (drawingMode === "room") {
      setDrawingPoints(prev => {
        const newPoints = [...prev, point];
        
        // Only check for closing the shape if we have at least 3 points
        if (newPoints.length >= 3) {
          // Check if clicking near the start point to close the room
          const startPoint = newPoints[0];
          const distance = Math.sqrt(
            Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2)
          );
          
          if (distance < 20) { // Within one grid cell
            return completeRoom(newPoints);
          }
        }
        return newPoints;
      });
    }
  };

  const completeRoom = (points: Point[]) => {
    if (points.length < 3) return points;

    const startPoint = points[0];
    // Replace the last point with the exact start point to close the shape perfectly
    points[points.length - 1] = startPoint;
    
    const newRoom: CanvasElement = {
      id: `room-${Date.now()}`,
      type: "room",
      x: Math.min(...points.map(p => p.x)),
      y: Math.min(...points.map(p => p.y)),
      width: Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)),
      height: Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)),
      rotation: 0,
      locked: false,
      points: points,
      color: "#f3f4f6",
    };

    setUndoStack([...undoStack, elements]);
    setElements([...elements, newRoom]);
    setRedoStack([]);
    setDrawingMode("");
    setDrawingPoints([]);
    return [];
  };

  const handleDrawComplete = () => {
    if (drawingMode === "wall" && wallStartPoint && mousePosition) {
      handleCanvasClick(mousePosition.x, mousePosition.y);
    } else if (drawingMode === "surface" && wallStartPoint && mousePosition) {
      handleCanvasClick(mousePosition.x, mousePosition.y);
    } else if (drawingMode === "room" && drawingPoints.length >= 3) {
      // Create a closed shape by adding the first point to the end
      const closedPoints = [...drawingPoints, drawingPoints[0]];
      
      const newRoom: CanvasElement = {
        id: `room-${Date.now()}`,
        type: "room",
        x: Math.min(...closedPoints.map(p => p.x)),
        y: Math.min(...closedPoints.map(p => p.y)),
        width: Math.max(...closedPoints.map(p => p.x)) - Math.min(...closedPoints.map(p => p.x)),
        height: Math.max(...closedPoints.map(p => p.y)) - Math.min(...closedPoints.map(p => p.y)),
        rotation: 0,
        locked: false,
        points: closedPoints,
        color: "#f3f4f6",
      };

      setUndoStack([...undoStack, elements]);
      setElements([...elements, newRoom]);
      setRedoStack([]);
      setDrawingMode("");
      setDrawingPoints([]);
    }
  };

  const handleItemDragStart = (item: ToolbarItem | CatalogItem) => {
    const newElement: CanvasElement = {
      id: `${item.id}-${Date.now()}`,
      type: isCatalogItem(item) ? `${item.brand.toLowerCase()}-${item.type}` : item.type,
      x: 0,
      y: 0,
      width: item.width || 60,
      height: item.height || 60,
      rotation: 0,
      locked: false,
      materialPreset: isCatalogItem(item) ? item.materialPreset : undefined,
      overlayPreset: isCatalogItem(item) ? item.overlayPreset : undefined,
    };

    setUndoStack([...undoStack, elements]);
    setElements([...elements, newElement]);
    setRedoStack([]);
  };

  const handleElementSelect = (element: CanvasElement | null) => {
    setSelectedElement(element);
  };

  const handleElementMove = (element: CanvasElement, newX: number, newY: number) => {
    if (element.locked) return;

    const updatedElements = elements.map((el) => {
      if (el.id === element.id) {
        if (el.type === "room" && el.points) {
          // Calculate the difference in position
          const dx = newX - el.x;
          const dy = newY - el.y;
          
          // Update all points by the same offset
          const newPoints = el.points.map(point => ({
            x: point.x + dx,
            y: point.y + dy
          }));
          
          return {
            ...el,
            x: newX,
            y: newY,
            points: newPoints
          };
        }
        return { ...el, x: newX, y: newY };
      }
      return el;
    });

    setElements(updatedElements);
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedElement) return;

    if (property === "delete" && value === true) {
      handleDeleteElement();
      return;
    }

    const updatedElements = elements.map((el) =>
      el.id === selectedElement.id ? { ...el, [property]: value } : el,
    );

    setUndoStack([...undoStack, elements]);
    setElements(updatedElements);
    setRedoStack([]);
    setSelectedElement({ ...selectedElement, [property]: value });
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;

    setUndoStack([...undoStack, elements]);
    setElements(elements.filter((el) => el.id !== selectedElement.id));
    setRedoStack([]);
    setSelectedElement(null);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    setRedoStack([...redoStack, elements]);
    setElements(previousState);
    setUndoStack(newUndoStack);
    setSelectedElement(null);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setUndoStack([...undoStack, elements]);
    setElements(nextState);
    setRedoStack(newRedoStack);
    setSelectedElement(null);
  };

  const handleLoadFloorplan = (loadedElements: CanvasElement[]) => {
    setUndoStack([...undoStack, elements]);
    setElements(loadedElements);
    setRedoStack([]);
    setSelectedElement(null);
    setDrawingMode("");
  };

  const handleSave = () => {
    const design = {
      elements,
      timestamp: Date.now(),
    };

    localStorage.setItem("floorplan", JSON.stringify(design));
  };

  const handleLoad = () => {
    const savedDesign = localStorage.getItem("floorplan");
    if (savedDesign) {
      const { elements: savedElements } = JSON.parse(savedDesign);
      setElements(savedElements);
      setSelectedElement(null);
      setUndoStack([]);
      setRedoStack([]);
    }
  };

  const handleAddTestElements = () => {
    const testElements: CanvasElement[] = [
      // Sub-Zero with default stainless
      {
        id: 'test-subzero-1',
        type: 'sub-zero-refrigerator',
        x: 50,
        y: 50,
        width: 100,
        height: 200,
        rotation: 0,
        locked: false,
        materialPreset: {
          category: 'appliances',
          materialId: 'stainlessSteel',
          settings: {
            normalScale: 0.6,
            roughness: 0.25,
            metalness: 0.95,
            displacementScale: 0.015,
            textureScale: { x: 2, y: 2 }
          }
        },
        overlayPreset: {
          type: 'brushed',
          angle: 45,
          opacity: 0.7,
          scale: 20,
          strength: 0.8
        }
      },
      // Sub-Zero with black finish
      {
        id: 'test-subzero-2',
        type: 'sub-zero-refrigerator',
        x: 200,
        y: 50,
        width: 100,
        height: 200,
        rotation: 0,
        locked: false,
        materialPreset: {
          category: 'appliances',
          materialId: 'blackSteel',
          settings: {
            normalScale: 0.4,
            roughness: 0.2,
            metalness: 0.9,
            displacementScale: 0.01,
            textureScale: { x: 2, y: 2 }
          }
        },
        overlayPreset: {
          type: 'matte',
          angle: 0,
          opacity: 0.9,
          scale: 1,
          strength: 0.9
        }
      },
      // Thermador Professional
      {
        id: 'test-thermador-1',
        type: 'thermador-refrigerator',
        x: 350,
        y: 50,
        width: 100,
        height: 200,
        rotation: 0,
        locked: false,
        materialPreset: {
          category: 'appliances',
          materialId: 'brushedSteel',
          settings: {
            normalScale: 0.7,
            roughness: 0.35,
            metalness: 0.9,
            displacementScale: 0.02,
            textureScale: { x: 2, y: 2 }
          }
        },
        overlayPreset: {
          type: 'brushed',
          angle: 90,
          opacity: 0.6,
          scale: 15,
          strength: 0.7
        }
      },
      // Liebherr with glass finish
      {
        id: 'test-liebherr-1',
        type: 'liebherr-refrigerator',
        x: 500,
        y: 50,
        width: 100,
        height: 200,
        rotation: 0,
        locked: false,
        materialPreset: {
          category: 'appliances',
          materialId: 'glass',
          settings: {
            normalScale: 0.2,
            roughness: 0.1,
            metalness: 0.9,
            displacementScale: 0.005,
            textureScale: { x: 2, y: 2 }
          }
        },
        overlayPreset: {
          type: 'gloss',
          angle: 0,
          opacity: 0.3,
          scale: 1,
          strength: 0.95
        }
      }
    ];
    setElements([...elements, ...testElements]);
  };

  const handleAddElements = (newElements: CanvasElement[]) => {
    setElements([...elements, ...newElements]);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="flex h-screen bg-[#1C1C1C]">
      <Toolbar
        onItemDragStart={handleItemDragStart}
        onDrawingModeChange={handleDrawingModeChange}
        activeDrawingMode={drawingMode}
      />
      <div className="flex-1 flex flex-col">
        <ActionBar
          onUndo={handleUndo}
          onRedo={handleRedo}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onLoad={handleLoadFloorplan}
          onDelete={handleDeleteElement}
          onCatalogOpen={() => setCatalogOpen(true)}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          elements={elements}
        />
        <div className="flex-1 relative overflow-hidden">
          <Button
            onClick={handleAddTestElements}
            className="absolute top-4 right-4 z-10"
          >
            Test Materials
          </Button>
          <Canvas
            elements={elements}
            drawingMode={drawingMode}
            onElementSelect={handleElementSelect}
            onElementMove={handleElementMove}
            selectedElement={selectedElement}
            onCanvasClick={handleCanvasClick}
            onDoubleClick={handleDrawComplete}
            scale={scale}
            wallStartPoint={wallStartPoint}
            drawingPoints={drawingPoints}
          />
        </div>
      </div>
      {selectedElement && (
        <PropertiesPanel
          element={selectedElement}
          onPropertyChange={handlePropertyChange}
          onDelete={handleDeleteElement}
        />
      )}
      <CatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        onItemSelect={handleItemDragStart}
      />
    </div>
  );
};

export default Home;

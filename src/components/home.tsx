import React, { useState } from "react";
import Toolbar from "./floorplanner/Toolbar";
import Canvas from "./floorplanner/Canvas";
import PropertiesPanel from "./floorplanner/PropertiesPanel";
import ActionBar from "./floorplanner/ActionBar";
import CatalogDialog from "./floorplanner/CatalogDialog";

interface Point {
  x: number;
  y: number;
}

interface Element {
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
  thickness?: number;
  color?: string;
  label?: string;
}

import type { CatalogItem } from "./floorplanner/CatalogDialog";

interface ToolbarItem {
  id: string;
  type?: string;
  width?: number;
  height?: number;
  name: string;
  color?: string;
  label?: string;
}

const Home = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [undoStack, setUndoStack] = useState<Element[][]>([]);
  const [redoStack, setRedoStack] = useState<Element[][]>([]);
  const [drawingMode, setDrawingMode] = useState("");
  const [wallStartPoint, setWallStartPoint] = useState<Point | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const handleDrawingModeChange = (mode: string) => {
    // If we're switching drawing modes and have an active drawing, save the current state
    if (mode !== drawingMode && wallStartPoint) {
      setUndoStack([...undoStack, elements]);
      setRedoStack([]);
    }
    setDrawingMode(mode);
    setWallStartPoint(null);
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (drawingMode === "wall") {
      if (!wallStartPoint) {
        // Save state before starting wall drawing
        setUndoStack([...undoStack, elements]);
        setRedoStack([]);
        setWallStartPoint({ x, y });
      } else {
        // Create wall element
        const newWall: Element = {
          id: `wall-${Date.now()}`,
          type: "wall",
          x: wallStartPoint.x,
          y: wallStartPoint.y,
          width: Math.abs(x - wallStartPoint.x),
          height: Math.abs(y - wallStartPoint.y),
          rotation: 0,
          locked: false,
          points: [wallStartPoint, { x, y }],
          thickness: 8,
        };

        setElements([...elements, newWall]);
        setWallStartPoint(null);
      }
    } else if (drawingMode === "surface") {
      if (!wallStartPoint) {
        // Save state before starting surface drawing
        setUndoStack([...undoStack, elements]);
        setRedoStack([]);
        setWallStartPoint({ x, y });
      } else {
        // Create surface element
        const newSurface: Element = {
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
            { x: x, y: wallStartPoint.y },
            { x, y },
            { x: wallStartPoint.x, y },
          ],
          color: "#e5e7eb",
        };

        setElements([...elements, newSurface]);
        setWallStartPoint(null);
        setDrawingMode("");
      }
    }
  };

  const handleDrawComplete = (points: Point[]) => {
    if (drawingMode === "room") {
      // Save state before completing room drawing
      setUndoStack([...undoStack, elements]);
      setRedoStack([]);

      const newRoom: Element = {
        id: `room-${Date.now()}`,
        type: "room",
        x: Math.min(...points.map((p) => p.x)),
        y: Math.min(...points.map((p) => p.y)),
        width:
          Math.max(...points.map((p) => p.x)) -
          Math.min(...points.map((p) => p.x)),
        height:
          Math.max(...points.map((p) => p.y)) -
          Math.min(...points.map((p) => p.y)),
        rotation: 0,
        locked: false,
        points,
        color: "#f3f4f6",
      };

      setElements([...elements, newRoom]);
      setDrawingMode("");
    }
  };

  const handleItemDragStart = (item: ToolbarItem | CatalogItem) => {
    const newElement: Element = {
      id: `${item.id}-${Date.now()}`,
      type: "type" in item ? item.type || item.id : item.id,
      x: 0,
      y: 0,
      width: item.width || 60,
      height: item.height || 60,
      depth: "depth" in item ? item.depth : item.width,
      rotation: 0,
      locked: false,
      color: "color" in item ? item.color : "#ffffff",
      label: "label" in item ? item.label : item.name,
    };

    setUndoStack([...undoStack, elements]);
    setElements([...elements, newElement]);
    setRedoStack([]);
  };

  const handleElementSelect = (element: Element | null) => {
    setSelectedElement(element);
  };

  const handleElementMove = (element: Element, newX: number, newY: number) => {
    if (element.locked) return;

    const updatedElements = elements.map((el) =>
      el.id === element.id ? { ...el, x: newX, y: newY } : el,
    );

    setElements(updatedElements);
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedElement) return;

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

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col">
      <ActionBar
        onSave={handleSave}
        onLoad={handleLoad}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />
      <CatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        onItemSelect={handleItemDragStart}
      />
      <div className="flex-1 flex overflow-hidden">
        <Toolbar
          onItemDragStart={handleItemDragStart}
          onDrawingModeChange={handleDrawingModeChange}
          activeDrawingMode={drawingMode}
        />
        <div className="flex-1 overflow-auto">
          <Canvas
            elements={elements}
            onElementSelect={handleElementSelect}
            onElementMove={handleElementMove}
            drawingMode={drawingMode}
            onCanvasClick={handleCanvasClick}
            onDrawComplete={handleDrawComplete}
          />
        </div>
        <PropertiesPanel
          selectedElement={selectedElement}
          onPropertyChange={handlePropertyChange}
          onDeleteElement={handleDeleteElement}
        />
      </div>
    </div>
  );
};

export default Home;

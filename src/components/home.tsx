import React, { useState } from "react";
import Toolbar from "./floorplanner/Toolbar";
import Canvas from "./floorplanner/Canvas";
import PropertiesPanel from "./floorplanner/PropertiesPanel";
import ActionBar from "./floorplanner/ActionBar";
import CatalogDialog from "./floorplanner/CatalogDialog";
import { Button } from "./ui/button";
import { ToolbarItem, CatalogItem } from "@/types/shared";

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
  rotation: number;
  locked: boolean;
  points?: Point[];
  thickness?: number;
  color?: string;
  materialId?: string;
  overlayId?: string;
}

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

  const handleDrawingModeChange = (mode: string) => {
    setDrawingMode(mode);
    setWallStartPoint(null);
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (drawingMode === "wall") {
      if (!wallStartPoint) {
        setWallStartPoint({ x, y });
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
          points: [wallStartPoint, { x, y }],
          thickness: 8,
        };

        setUndoStack([...undoStack, elements]);
        setElements([...elements, newWall]);
        setRedoStack([]);
        setWallStartPoint(null);
      }
    } else if (drawingMode === "surface") {
      if (!wallStartPoint) {
        setWallStartPoint({ x, y });
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
            { x: x, y: wallStartPoint.y },
            { x, y },
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
    }
  };

  const handleDrawComplete = (points: Point[]) => {
    if (drawingMode === "room") {
      const newRoom: CanvasElement = {
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

      setUndoStack([...undoStack, elements]);
      setElements([...elements, newRoom]);
      setRedoStack([]);
      setDrawingMode("");
    }
  };

  const handleItemDragStart = (item: ToolbarItem | CatalogItem) => {
    const newElement: CanvasElement = {
      id: `${item.id}-${Date.now()}`,
      type: isCatalogItem(item) ? item.model : item.type,
      x: 0,
      y: 0,
      width: item.width || 60,
      height: item.height || 60,
      rotation: 0,
      locked: false,
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

    const updatedElements = elements.map((el) =>
      el.id === element.id ? { ...el, x: newX, y: newY } : el,
    );

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
        materialId: 'subZeroStainless',
        overlayId: 'professionalBrushed'
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
        materialId: 'subZeroBlack',
        overlayId: 'obsidianMatte'
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
        materialId: 'thermadorProfessional',
        overlayId: 'verticalBrushed'
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
        materialId: 'liebherrBlueGlass',
        overlayId: 'glassReflective'
      }
    ];
    setElements([...elements, ...testElements]);
  };

  const handleAddElements = (newElements: CanvasElement[]) => {
    setElements([...elements, ...newElements]);
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
          onDelete={handleDeleteElement}
          onCatalogOpen={() => setCatalogOpen(true)}
        />
        <div className="flex-1 relative">
          <Button
            onClick={handleAddTestElements}
            className="absolute top-4 right-4 z-10"
          >
            Test Materials
          </Button>
          <Canvas
            elements={elements}
            drawingMode={drawingMode}
            onDrawComplete={handleDrawComplete}
            onElementSelect={handleElementSelect}
            onElementMove={handleElementMove}
            selectedElement={selectedElement}
          />
        </div>
      </div>
      {selectedElement && (
        <PropertiesPanel
          element={selectedElement}
          onPropertyChange={handlePropertyChange}
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

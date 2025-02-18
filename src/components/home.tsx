import React, { useState } from "react";
import Toolbar from "./floorplanner/Toolbar";
import Canvas from "./floorplanner/Canvas";
import PropertiesPanel from "./floorplanner/PropertiesPanel";
import ActionBar from "./floorplanner/ActionBar";
import CatalogDialog from "./floorplanner/CatalogDialog";
import { ToolbarItem, CatalogItem, CanvasElement, Point } from "@/types/shared";

const isCatalogItem = (
  item: ToolbarItem | CatalogItem,
): item is CatalogItem => {
  return "model" in item && "brand" in item;
};

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  allowedTools?: string[];
  elements: CanvasElement[];
  locked?: boolean;
}

const defaultLayers: Layer[] = [
  {
    id: "layer-0",
    name: "Canvas",
    visible: true,
    allowedTools: [],
    elements: [],
    locked: true,
  },
  {
    id: "layer-1",
    name: "Floor & Surfaces",
    visible: true,
    allowedTools: ["draw-room", "draw-surface"],
    elements: [],
    locked: true,
  },
  {
    id: "layer-2",
    name: "Walls & Base",
    visible: true,
    allowedTools: ["draw-wall", "base-cabinet", "island"],
    elements: [],
    locked: true,
  },
  {
    id: "layer-3",
    name: "Countertops",
    visible: true,
    allowedTools: ["countertop"],
    elements: [],
    locked: true,
  },
  {
    id: "layer-4",
    name: "Upper & Lighting",
    visible: true,
    allowedTools: ["upper-cabinet", "lighting"],
    elements: [],
    locked: true,
  },
];

const Home = () => {
  const [layers, setLayers] = useState<Layer[]>(defaultLayers);
  const [activeLayer, setActiveLayer] = useState<string>("layer-1");
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(
    null,
  );
  const [drawingMode, setDrawingMode] = useState("");
  const [wallStartPoint, setWallStartPoint] = useState<Point | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  const handleDrawingModeChange = (mode: string) => {
    // Find the appropriate layer for this tool
    const targetLayer = layers.find((layer) =>
      layer.allowedTools?.includes(mode),
    );
    if (targetLayer) {
      setActiveLayer(targetLayer.id);
      setDrawingMode(mode);
      setWallStartPoint(null);
      setDrawingPoints([]);
    }

    // Open catalog dialog for appliances
    if (mode === "add-appliance") {
      setCatalogOpen(true);
    }
  };

  const handleCanvasClick = (x: number, y: number) => {
    const point = { x, y };

    if (drawingMode === "draw-room" || drawingMode === "draw-surface") {
      // Add new point for room or surface drawing
      setDrawingPoints((prev) => [...prev, point]);
    } else if (drawingMode === "draw-wall") {
      if (!wallStartPoint) {
        setWallStartPoint(point);
      } else {
        // Create a wall element from start to current point
        const wallElement = {
          id: `wall-${Date.now()}`,
          type: "wall",
          x: Math.min(wallStartPoint.x, point.x),
          y: Math.min(wallStartPoint.y, point.y),
          width: Math.abs(point.x - wallStartPoint.x),
          height: Math.abs(point.y - wallStartPoint.y),
          color: "#000",
          rotation: 0,
          locked: false,
        };
        handleElementAdd(wallElement);
        setWallStartPoint(null);
      }
    }
  };

  const handleDoubleClick = () => {
    if (drawingMode === "draw-room" && drawingPoints.length >= 3) {
      // Create room element from drawingPoints
      const roomElement: CanvasElement = {
        id: `room-${Date.now()}`,
        type: "room",
        x: Math.min(...drawingPoints.map((p) => p.x)),
        y: Math.min(...drawingPoints.map((p) => p.y)),
        width: Math.max(...drawingPoints.map((p) => p.x)) - Math.min(...drawingPoints.map((p) => p.x)),
        height: Math.max(...drawingPoints.map((p) => p.y)) - Math.min(...drawingPoints.map((p) => p.y)),
        points: [...drawingPoints],
        color: "#f3f4f6",
        rotation: 0,
        locked: false,
      };
      handleElementAdd(roomElement);
      setDrawingPoints([]);
    } else if (drawingMode === "draw-surface" && drawingPoints.length >= 3) {
      // Create surface element from drawingPoints
      const surfaceElement: CanvasElement = {
        id: `surface-${Date.now()}`,
        type: "surface",
        x: Math.min(...drawingPoints.map((p) => p.x)),
        y: Math.min(...drawingPoints.map((p) => p.y)),
        width: Math.max(...drawingPoints.map((p) => p.x)) - Math.min(...drawingPoints.map((p) => p.x)),
        height: Math.max(...drawingPoints.map((p) => p.y)) - Math.min(...drawingPoints.map((p) => p.y)),
        points: [...drawingPoints],
        color: "#f3f4f6",
        rotation: 0,
        locked: false,
      };
      handleElementAdd(surfaceElement);
      setDrawingPoints([]);
    }
  };

  const handleElementAdd = (element: CanvasElement) => {
    // Add to the appropriate layer
    setLayers((prevLayers) => {
      return prevLayers.map((layer) => {
        if (layer.id === activeLayer) {
          return {
            ...layer,
            elements: [...layer.elements, element],
          };
        }
        return layer;
      });
    });
    // Also add to the global elements array
    setElements((prev) => [...prev, element]);
  };

  const handleElementSelect = (element: CanvasElement | null) => {
    setSelectedElement(element);
  };

  const handlePropertyChange = (updates: Partial<CanvasElement>) => {
    if (!selectedElement) return;

    const updatedElement = { ...selectedElement, ...updates };

    // Update in layers
    setLayers((prevLayers) => {
      return prevLayers.map((layer) => ({
        ...layer,
        elements: layer.elements.map((el) =>
          el.id === selectedElement.id ? updatedElement : el,
        ),
      }));
    });

    // Update in global elements
    setElements((prev) =>
      prev.map((el) => (el.id === selectedElement.id ? updatedElement : el)),
    );

    setSelectedElement(updatedElement);
  };

  const handleLayerAdd = () => {
    const newLayer = {
      id: `layer-${layers.length + 1}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      elements: [],
    };
    setLayers([...layers, newLayer]);
  };

  const handleLayerDelete = (id: string) => {
    setLayers(layers.filter((layer) => layer.id !== id));
  };

  const handleLayerVisibilityToggle = (id: string) => {
    setLayers(
      layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer,
      ),
    );
  };

  const handleLayerSelect = (id: string) => {
    setActiveLayer(id);
  };

  return (
    <div className="flex h-screen bg-[#1C1C1C]">
      <Toolbar
        onDrawingModeChange={handleDrawingModeChange}
        activeDrawingMode={drawingMode}
        layers={layers}
        activeLayer={activeLayer}
        onLayerAdd={handleLayerAdd}
        onLayerDelete={handleLayerDelete}
        onLayerVisibilityToggle={handleLayerVisibilityToggle}
        onLayerSelect={handleLayerSelect}
      />
      <div className="flex-1 flex flex-col">
        <ActionBar viewMode={viewMode} onViewModeChange={setViewMode} />
        <div className="flex-1 relative overflow-hidden">
          <Canvas
            layers={layers}
            activeLayer={activeLayer}
            onLayerAdd={handleLayerAdd}
            onLayerDelete={handleLayerDelete}
            onLayerVisibilityToggle={handleLayerVisibilityToggle}
            onLayerSelect={handleLayerSelect}
            selectedElement={selectedElement}
            onElementSelect={handleElementSelect}
            onElementUpdate={handlePropertyChange}
            drawingMode={drawingMode}
            onCanvasClick={handleCanvasClick}
            onDoubleClick={handleDoubleClick}
            scale={scale}
            viewMode={viewMode}
            wallStartPoint={wallStartPoint}
            drawingPoints={drawingPoints}
          />
        </div>
      </div>
      {selectedElement && (
        <PropertiesPanel
          selectedElement={selectedElement}
          onUpdateElement={handlePropertyChange}
        />
      )}
      <CatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        onItemSelect={() => {}}
      />
    </div>
  );
};

export default Home;

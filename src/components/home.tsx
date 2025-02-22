import React, { useState, useEffect } from "react";
import Toolbar from "./floorplanner/Toolbar";
import Canvas from "./floorplanner/Canvas";
import PropertiesPanel from "./floorplanner/PropertiesPanel";
import ActionBar from "./floorplanner/ActionBar";
import CatalogDialog from "./floorplanner/CatalogDialog";
import { ToolbarItem, CatalogItem, CanvasElement, Point, RoomLayout } from "@/types/shared";
import { defaultLayers } from "../lib/defaultLayers";
import { createWallsAndCorners } from "../lib/roomLayouts";

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

interface WallSegment {
  start: Point;
  end: Point;
  thickness: number;
}

interface Corner {
  x: number;
  y: number;
  wallSegments: WallSegment[];
}

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
  const [roomCatalogOpen, setRoomCatalogOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [selectedRoomTemplate, setSelectedRoomTemplate] = useState<{
    points: Point[];
    width: number;
    height: number;
    wallSegments: WallSegment[];
    corners: Corner[];
  } | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawingMode("");
        setWallStartPoint(null);
        setDrawingPoints([]);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleDrawingModeChange = (mode: string) => {
    // Always clear the drawing state when selecting any drawing tool
    setWallStartPoint(null);
    setDrawingPoints([]);

    if (mode === "draw-room") {
      // Instead of free drawing, open the room shapes catalog
      setRoomCatalogOpen(true);
      setDrawingMode(mode);
      // Set active layer to Floor & Surfaces
      const floorLayer = layers.find(layer => layer.name === "Floor & Surfaces");
      if (floorLayer) {
        setActiveLayer(floorLayer.id);
      }
      return;
    } else if (mode === "select") {
      // Select tool can work on any layer except canvas
      setDrawingMode(mode);
      return;
    } else if (mode === "add-appliance") {
      // Set active layer to Appliances
      const applianceLayer = layers.find(layer => layer.name === "Appliances");
      if (applianceLayer) {
        setActiveLayer(applianceLayer.id);
      }
      setCatalogOpen(true);
      setDrawingMode(mode);
      return;
    } else {
      const targetLayer = layers.find((layer) => layer.allowedTools?.includes(mode));
      if (targetLayer) {
        setActiveLayer(targetLayer.id);
        setDrawingMode(mode);
      }
    }
  };

  const handleCanvasClick = (x: number, y: number) => {
    const point = { x, y };

    if (drawingMode === "draw-room" && selectedRoomTemplate) {
      console.log('Creating room at:', point);
      
      // Create room element at clicked position
      const roomElement: CanvasElement = {
        id: `room-${Date.now()}`,
        type: "room",
        x: point.x,
        y: point.y,
        width: selectedRoomTemplate.width,
        height: selectedRoomTemplate.height,
        points: selectedRoomTemplate.points.map(p => ({
          x: point.x + p.x,
          y: point.y + p.y
        })),
        wallSegments: selectedRoomTemplate.wallSegments?.map(w => ({
          start: { x: point.x + w.start.x, y: point.y + w.start.y },
          end: { x: point.x + w.end.x, y: point.y + w.end.y },
          thickness: w.thickness
        })) || [],
        corners: selectedRoomTemplate.corners?.map(c => ({
          x: point.x + c.x,
          y: point.y + c.y,
          wallSegments: []
        })) || [],
        color: "#f3f4f6",
        rotation: 0,
        locked: false,
        depth: 0,
        materialPreset: null,
        overlayPreset: null
      };

      // Add the room element
      handleElementAdd(roomElement);

      // Reset the drawing state
      setSelectedRoomTemplate(null);
      setDrawingMode("select");
      return;
    }

    // Handle other drawing modes
    if (drawingMode === "draw-surface" || drawingMode === "draw-wall") {
      setDrawingPoints((prev) => [...prev, point]);
    }
  };

  const handleDoubleClick = () => {
    if (drawingMode === "draw-wall" && drawingPoints.length >= 3) {
      const first = drawingPoints[0];
      const last = drawingPoints[drawingPoints.length - 1];
      const dx = last.x - first.x;
      const dy = last.y - first.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const threshold = 50; // threshold for closing the wall
      if (distance < threshold) {
        const x = Math.min(...drawingPoints.map(p => p.x));
        const y = Math.min(...drawingPoints.map(p => p.y));
        const width = Math.max(...drawingPoints.map(p => p.x)) - x;
        const height = Math.max(...drawingPoints.map(p => p.y)) - y;
        const wallElement: CanvasElement = {
          id: `wall-${Date.now()}`,
          type: "wall",
          x,
          y,
          width,
          height,
          points: [...drawingPoints],
          color: "#000",
          rotation: 0,
          locked: false,
        };
        handleElementAdd(wallElement);
        setDrawingPoints([]);
      }
    } else if (drawingMode === "draw-surface" && drawingPoints.length >= 3) {
      const x = Math.min(...drawingPoints.map(p => p.x));
      const y = Math.min(...drawingPoints.map(p => p.y));
      const width = Math.max(...drawingPoints.map(p => p.x)) - x;
      const height = Math.max(...drawingPoints.map(p => p.y)) - y;
      const surfaceElement: CanvasElement = {
        id: `surface-${Date.now()}`,
        type: "surface",
        x,
        y,
        width,
        height,
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
    console.log('%cElement Add Start', 'color: orange; font-weight: bold', {
      element,
      activeLayer,
      currentLayers: layers
    });
    
    // Add to the appropriate layer
    setLayers((prevLayers) => {
      const newLayers = prevLayers.map((layer) => {
        if (layer.id === activeLayer) {
          console.log('%cUpdating Layer', 'color: orange', {
            layerId: layer.id,
            currentElements: layer.elements.length,
            newElement: element
          });
          return {
            ...layer,
            elements: [...layer.elements, element]
          };
        }
        return layer;
      });
      return newLayers;
    });

    // Also add to the global elements array
    setElements((prev) => {
      const newElements = [...prev, element];
      console.log('%cGlobal Elements Updated', 'color: orange', {
        previousCount: prev.length,
        newCount: newElements.length,
        addedElement: element
      });
      return newElements;
    });

    // Select the newly added element
    setSelectedElement(element);

    // Switch to select mode
    setDrawingMode("select");
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

  const handleRoomCatalogSelect = (item: RoomLayout) => {
    console.log('Room Catalog Item Selected:', item);
    
    // Set the selected room template
    setSelectedRoomTemplate({
      points: item.points,
      width: item.width,
      height: item.height,
      wallSegments: item.wallSegments,
      corners: item.corners
    });

    // Keep drawing mode as draw-room
    setDrawingMode("draw-room");
    
    // Close the catalog dialog
    setRoomCatalogOpen(false);
  };

  const handleApplianceCatalogSelect = (item: CatalogItem) => {
    console.log("Adding appliance:", item);
    console.log("Appliance dimensions:", {
      width: item.width,
      height: item.height,
      depth: item.depth
    });
    
    const applianceElement: CanvasElement = {
      id: `${item.type}-${Date.now()}`,
      type: item.type,
      x: 1000,
      y: 1000,
      width: item.width * 2, // Convert from inches to pixels
      height: item.height * 2, // Convert from inches to pixels
      depth: item.depth,
      rotation: 0,
      locked: false,
      color: "#ffffff",
      materialPreset: item.materialPreset,
      overlayPreset: item.overlayPreset,
      points: [],
      wallSegments: [],
      corners: []
    };
    console.log("Created element with dimensions:", {
      width: applianceElement.width,
      height: applianceElement.height,
      depth: applianceElement.depth
    });
    handleElementAdd(applianceElement);
    setCatalogOpen(false);
    setDrawingMode("select"); // Switch to select mode after adding
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
            wallSegments={selectedElement?.wallSegments || []}
            corners={selectedElement?.corners || []}
            selectedRoomTemplate={selectedRoomTemplate}
            setDrawingMode={handleDrawingModeChange}
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
        onItemSelect={handleApplianceCatalogSelect}
      />
      {roomCatalogOpen && (
        <CatalogDialog
          open={roomCatalogOpen}
          onOpenChange={setRoomCatalogOpen}
          onItemSelect={handleRoomCatalogSelect}
          catalogType="room"
        />
      )}
    </div>
  );
};

export default Home;

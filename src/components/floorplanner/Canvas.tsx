import React from "react";
import LayersPanel from "./LayersPanel";
import ThreeMaterialRenderer from "../ThreeMaterialRenderer";
import ThreeRoomRenderer from "./ThreeRoomRenderer";
import { getMaterialPreset } from "@/lib/materialPresets";

interface Element {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  elements: Element[];
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
  wallStartPoint?: { x: number; y: number } | null;
  drawingPoints?: { x: number; y: number }[];
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
}: Props) => {
  const [mousePos, setMousePos] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = e.currentTarget.parentElement?.scrollLeft || 0;
    const scrollTop = e.currentTarget.parentElement?.scrollTop || 0;

    const x = (e.clientX + scrollLeft - rect.left) / scale + 1000;
    const y = (e.clientY + scrollTop - rect.top) / scale + 1000;

    setMousePos({ x, y });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!onCanvasClick) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = e.currentTarget.parentElement?.scrollLeft || 0;
    const scrollTop = e.currentTarget.parentElement?.scrollTop || 0;

    const x = (e.clientX + scrollLeft - rect.left) / scale + 1000;
    const y = (e.clientY + scrollTop - rect.top) / scale + 1000;

    onCanvasClick(x, y);
  };

  const handleDoubleClick = () => {
    onDoubleClick?.();
  };

  return (
    <div className="relative w-full h-full bg-background flex overflow-auto">
      <div
        className="absolute cursor-crosshair bg-white"
        style={{
          width: "4000px",
          height: "4000px",
          left: "-1000px",
          top: "-1000px",
          transform: `scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
        onMouseMove={handleMouseMove}
      >
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.2,
          }}
        />

        {/* Drawing Preview */}
        {drawingMode === "wall" && wallStartPoint && (
          <div
            className="absolute border-2 border-primary"
            style={{
              left: wallStartPoint.x - 1000,
              top: wallStartPoint.y - 1000,
              width: "4px",
              height: "4px",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}

        {/* Room Drawing Preview */}
        {drawingMode === "draw-room" && (
          <>
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 999 }}
            >
              {drawingPoints.length > 0 && (
                <>
                  {/* Lines between points */}
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
                        stroke="#000"
                        strokeWidth="2"
                      />
                    );
                  })}
                  {/* Preview line to cursor */}
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
                  {/* Points */}
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
              {/* Current point preview */}
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
            {drawingPoints.length > 2 && (
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
        {layers.map(
          (layer) =>
            layer.visible && (
              <div
                key={layer.id}
                className="absolute inset-0"
                style={{ zIndex: layer.id === "layer-0" ? 0 : 1 }}
              >
                {layer.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute cursor-pointer ${selectedElement?.id === element.id ? "ring-2 ring-primary" : ""}`}
                    style={{
                      left: element.x - 1000,
                      top: element.y - 1000,
                      width: element.width,
                      height: element.height,
                    }}
                    onClick={() => onElementSelect?.(element)}
                  >
                    <ThreeMaterialRenderer
                      elementId={element.id}
                      materialPreset={getMaterialPreset(element.type)}
                      width={element.width}
                      height={element.height}
                      type={element.type}
                    />
                  </div>
                ))}
              </div>
            ),
        )}
      </div>
    </div>
  );
};

export default Canvas;

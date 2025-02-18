import React, { useEffect } from "react";
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

  useEffect(() => {
    console.log(`Canvas Debug - drawingMode: ${drawingMode}, drawingPoints count: ${drawingPoints.length}`);
  }, [drawingMode, drawingPoints]);

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

  const debugRoomPoints = (drawingMode === "draw-room" && drawingPoints.length === 0) ? [
    { x: 1500, y: 1500 },
    { x: 2500, y: 1500 },
    { x: 2000, y: 2500 }
  ] : drawingPoints;

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

        {/* Surface Drawing Preview */}
        {drawingMode === "draw-surface" && (
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
                        stroke="#666"
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

        {/* Room Drawing Preview */}
        {drawingMode === "draw-room" && (
          <>
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 2000, border: "2px solid red" }}
              viewBox="0 0 4000 4000"
            >
              {/* Full area overlay for debugging */}
              <rect x="0" y="0" width="4000" height="4000" fill="rgba(255,0,0,0.1)" />
              {debugRoomPoints.length === 0 && (
                <text x="10" y="20" fill="red" fontSize="16">No Points Yet</text>
              )}
              {/* Debug info: drawing mode and points count */}
              <text x="10" y="40" fill="red" fontSize="16">{`Mode: ${drawingMode}, Points: ${debugRoomPoints.length}`}</text>
              {debugRoomPoints.length > 0 && (
                <>
                  {/* Lines between points */}
                  {debugRoomPoints.map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = debugRoomPoints[index - 1];
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
                  {mousePos && debugRoomPoints.length > 0 && (
                    <line
                      x1={debugRoomPoints[debugRoomPoints.length - 1].x - 1000}
                      y1={debugRoomPoints[debugRoomPoints.length - 1].y - 1000}
                      x2={mousePos.x - 1000}
                      y2={mousePos.y - 1000}
                      stroke="#000"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  )}
                  {/* Points */}
                  {debugRoomPoints.map((point, index) => (
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
            </svg>
            {debugRoomPoints.length > 2 && viewMode === "3d" && (
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 1999,
                  pointerEvents: "none",
                }}
              >
                <ThreeRoomRenderer
                  points={debugRoomPoints.map((p) => ({ x: p.x - 1000, y: p.y - 1000 }))}
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

        {/* Adding debug overlay at the end of the canvas inner div */}
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
        </div>
      </div>
    </div>
  );
};

export default Canvas;

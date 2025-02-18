import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import LayersPanel from "./LayersPanel";
import {
  Ruler,
  Square,
  Grid2X2,
  Box,
  Lightbulb,
  Home,
  Layers,
  MousePointer,
} from "lucide-react";

interface ToolbarItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const toolbarItems: ToolbarItem[] = [
  { id: "select", name: "Select", icon: <MousePointer className="w-4 h-4" /> },
  { id: "draw-room", name: "Draw Room", icon: <Home className="w-4 h-4" /> },
  {
    id: "draw-surface",
    name: "Draw Surface",
    icon: <Square className="w-4 h-4" />,
  },
  { id: "draw-wall", name: "Draw Wall", icon: <Ruler className="w-4 h-4" /> },
  {
    id: "base-cabinet",
    name: "Base Cabinet",
    icon: <Box className="w-4 h-4" />,
  },
  { id: "island", name: "Island", icon: <Grid2X2 className="w-4 h-4" /> },
  {
    id: "upper-cabinet",
    name: "Upper Cabinet",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "lighting",
    name: "Lighting",
    icon: <Lightbulb className="w-4 h-4" />,
  },
  {
    id: "add-appliance",
    name: "Add Appliance",
    icon: <Box className="w-4 h-4" />,
  },
];

interface Props {
  onDrawingModeChange: (mode: string) => void;
  activeDrawingMode: string;
  layers: any[];
  activeLayer?: string;
  onLayerAdd?: () => void;
  onLayerDelete?: (id: string) => void;
  onLayerVisibilityToggle?: (id: string) => void;
  onLayerSelect?: (id: string) => void;
}

const Toolbar = ({
  onDrawingModeChange,
  activeDrawingMode,
  layers,
  activeLayer,
  onLayerAdd,
  onLayerDelete,
  onLayerVisibilityToggle,
  onLayerSelect,
}: Props) => {
  return (
    <Card className="w-[240px] h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          <span>Tools</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="font-medium">Tools</div>
              {toolbarItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${activeDrawingMode === item.id ? "bg-primary text-primary-foreground ring-2 ring-primary" : "hover:bg-accent"}`}
                  onClick={() => onDrawingModeChange(item.id)}
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="font-medium">Layers</div>
              <LayersPanel
                layers={layers}
                activeLayer={activeLayer}
                onLayerAdd={onLayerAdd}
                onLayerDelete={onLayerDelete}
                onLayerVisibilityToggle={onLayerVisibilityToggle}
                onLayerSelect={onLayerSelect}
              />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Toolbar;

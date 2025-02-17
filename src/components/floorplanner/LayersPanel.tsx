import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Layers, Eye, EyeOff, Trash2 } from "lucide-react";

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  elements: any[];
}

interface Props {
  layers: Layer[];
  activeLayer?: string;
  onLayerAdd?: () => void;
  onLayerDelete?: (id: string) => void;
  onLayerVisibilityToggle?: (id: string) => void;
  onLayerSelect?: (id: string) => void;
}

const LayersPanel = ({
  layers,
  activeLayer,
  onLayerAdd,
  onLayerDelete,
  onLayerVisibilityToggle,
  onLayerSelect,
}: Props) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={onLayerAdd}
        >
          +
        </Button>
      </div>
      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center justify-between p-2 rounded ${activeLayer === layer.id ? "bg-accent" : "hover:bg-accent/50"} cursor-pointer`}
            onClick={() => onLayerSelect?.(layer.id)}
          >
            <span className="text-sm">{layer.name}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onLayerVisibilityToggle?.(layer.id);
                }}
              >
                {layer.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;

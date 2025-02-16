import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Trash2, Move, Rotate3D } from "lucide-react";

interface CanvasElement {
  id: string;
  type: string;
  width: number;
  height: number;
  rotation: number;
  x: number;
  y: number;
  locked: boolean;
  materialId?: string;
  overlayId?: string;
}

interface PropertiesPanelProps {
  element: CanvasElement;
  onPropertyChange: (property: string, value: any) => void;
  onDelete: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  element,
  onPropertyChange,
  onDelete,
}) => {
  return (
    <Card className="w-80 h-full bg-white border-l border-gray-200">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Properties</h3>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Separator />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="x">X</Label>
                  <Input
                    id="x"
                    type="number"
                    value={element.x}
                    onChange={(e) =>
                      onPropertyChange("x", parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="y">Y</Label>
                  <Input
                    id="y"
                    type="number"
                    value={element.y}
                    onChange={(e) =>
                      onPropertyChange("y", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={element.width}
                    onChange={(e) =>
                      onPropertyChange("width", parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={element.height}
                    onChange={(e) =>
                      onPropertyChange("height", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rotation">Rotation</Label>
              <Slider
                id="rotation"
                min={0}
                max={360}
                step={1}
                value={[element.rotation]}
                onValueChange={([value]) => onPropertyChange("rotation", value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="locked"
                checked={element.locked}
                onCheckedChange={(checked) =>
                  onPropertyChange("locked", checked)
                }
              />
              <Label htmlFor="locked">Locked</Label>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PropertiesPanel;

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

interface ElementProperties {
  id: string;
  type: string;
  width: number;
  height: number;
  depth?: number;
  rotation: number;
  x: number;
  y: number;
  locked: boolean;
  color?: string;
  label?: string;
  points?: { x: number; y: number }[];
  thickness?: number;
}

interface PropertiesPanelProps {
  selectedElement?: ElementProperties;
  onPropertyChange?: (property: string, value: any) => void;
  onDeleteElement?: () => void;
}

const PropertiesPanel = ({
  selectedElement = {
    id: "default",
    type: "cabinet",
    width: 60,
    height: 30,
    rotation: 0,
    x: 100,
    y: 100,
    locked: false,
  },
  onPropertyChange = () => {},
  onDeleteElement = () => {},
}: PropertiesPanelProps) => {
  return (
    <Card className="w-[300px] h-full bg-white border-l">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Properties</h3>
            <p className="text-sm text-muted-foreground">
              {selectedElement
                ? `${selectedElement.type} properties`
                : "No element selected"}
            </p>
          </div>

          {selectedElement && (
            <>
              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dimensions</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (in)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={Math.round((selectedElement.width * 12) / 20)}
                        onChange={(e) =>
                          onPropertyChange(
                            "width",
                            Math.round((Number(e.target.value) * 20) / 12),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depth">Depth (in)</Label>
                      <Input
                        id="depth"
                        type="number"
                        value={Math.round(
                          ((selectedElement.depth || selectedElement.width) *
                            12) /
                            20,
                        )}
                        onChange={(e) =>
                          onPropertyChange(
                            "depth",
                            Math.round((Number(e.target.value) * 20) / 12),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (in)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={Math.round((selectedElement.height * 12) / 20)}
                        onChange={(e) =>
                          onPropertyChange(
                            "height",
                            Math.round((Number(e.target.value) * 20) / 12),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="x">X Position</Label>
                      <Input
                        id="x"
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) =>
                          onPropertyChange("x", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="y">Y Position</Label>
                      <Input
                        id="y"
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) =>
                          onPropertyChange("y", Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rotation</Label>
                  <div className="flex items-center gap-2">
                    <Rotate3D className="h-4 w-4" />
                    <Slider
                      value={[selectedElement.rotation]}
                      max={360}
                      step={1}
                      onValueChange={(value) =>
                        onPropertyChange("rotation", value[0])
                      }
                    />
                    <span className="min-w-[3ch]">
                      {selectedElement.rotation}°
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Move className="h-4 w-4" />
                    <Label>Lock Position</Label>
                  </div>
                  <Switch
                    checked={selectedElement.locked}
                    onCheckedChange={(checked) =>
                      onPropertyChange("locked", checked)
                    }
                  />
                </div>

                <Separator />

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={onDeleteElement}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Element
                </Button>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PropertiesPanel;

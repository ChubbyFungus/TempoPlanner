import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Props {
  selectedElement?: {
    x: number;
    y: number;
    width: number;
    height: number;
    type?: string;
  };
  onUpdateElement?: (updates: Partial<Props["selectedElement"]>) => void;
}

const PropertiesPanel = ({ selectedElement, onUpdateElement }: Props) => {
  if (!selectedElement) {
    return (
      <Card className="w-[240px] h-full">
        <CardHeader>Properties</CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select an element to edit its properties
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (
    field: keyof Props["selectedElement"],
    value: string,
  ) => {
    onUpdateElement?.({ [field]: parseFloat(value) || 0 });
  };

  return (
    <Card className="w-[240px] h-full">
      <CardHeader>Properties</CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Position X</Label>
          <Input
            type="number"
            value={selectedElement.x}
            onChange={(e) => handleInputChange("x", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Position Y</Label>
          <Input
            type="number"
            value={selectedElement.y}
            onChange={(e) => handleInputChange("y", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Width</Label>
          <Input
            type="number"
            value={selectedElement.width}
            onChange={(e) => handleInputChange("width", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Height</Label>
          <Input
            type="number"
            value={selectedElement.height}
            onChange={(e) => handleInputChange("height", e.target.value)}
          />
        </div>
        {selectedElement.type && (
          <div className="space-y-2">
            <Label>Type</Label>
            <Input type="text" value={selectedElement.type} disabled />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertiesPanel;

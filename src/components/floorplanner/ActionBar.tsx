import React from "react";
import { Button } from "../ui/button";
import { View, Box } from "lucide-react";

interface Props {
  viewMode?: "2d" | "3d";
  onViewModeChange?: (mode: "2d" | "3d") => void;
}

const ActionBar = ({ viewMode = "2d", onViewModeChange }: Props) => {
  return (
    <div className="h-[60px] border-b flex items-center px-4 justify-between bg-background">
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "2d" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange?.("2d")}
        >
          <View className="w-4 h-4 mr-2" />
          2D
        </Button>
        <Button
          variant={viewMode === "3d" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange?.("3d")}
        >
          <Box className="w-4 h-4 mr-2" />
          3D
        </Button>
      </div>
    </div>
  );
};

export default ActionBar;

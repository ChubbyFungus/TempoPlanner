import React from "react";
import { Button } from "@/components/ui/button";
import { Save, FolderOpen, Undo, Redo } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionBarProps {
  onSave?: () => void;
  onLoad?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onAddAppliance?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const ActionBar = ({
  onSave = () => console.log("Save clicked"),
  onLoad = () => console.log("Load clicked"),
  onUndo = () => console.log("Undo clicked"),
  onRedo = () => console.log("Redo clicked"),
  onAddAppliance = () => console.log("Add appliance clicked"),
  canUndo = false,
  canRedo = false,
}: ActionBarProps) => {
  return (
    <div className="w-full h-[60px] bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={onLoad}
                className="flex items-center gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Load
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Load Design</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                onClick={onSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save Design</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ActionBar;

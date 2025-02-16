import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, FolderOpen, Undo, Redo } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SaveLoadDialog } from "./SaveLoadDialog";
import { CanvasElement } from "@/types/shared";

interface ActionBarProps {
  onSave?: () => void;
  onLoad?: (elements: CanvasElement[]) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onAddAppliance?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onDelete: () => void;
  onCatalogOpen: () => void;
  elements: CanvasElement[];
}

const ActionBar = ({
  onSave = () => console.log("Save clicked"),
  onLoad = () => console.log("Load clicked"),
  onUndo = () => console.log("Undo clicked"),
  onRedo = () => console.log("Redo clicked"),
  onAddAppliance = () => console.log("Add appliance clicked"),
  canUndo = false,
  canRedo = false,
  onDelete,
  onCatalogOpen,
  elements,
}: ActionBarProps) => {
  const [saveLoadOpen, setSaveLoadOpen] = useState(false);

  return (
    <>
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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSaveLoadOpen(true)}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save/Load Floorplan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <SaveLoadDialog
        open={saveLoadOpen}
        onOpenChange={setSaveLoadOpen}
        onLoad={onLoad}
        currentElements={elements}
      />
    </>
  );
};

export default ActionBar;

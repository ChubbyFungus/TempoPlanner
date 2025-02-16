import React, { useState } from "react";
import CatalogDialog, { CatalogItem } from "./CatalogDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Square,
  Pencil,
  Grid3X3,
  DoorOpen,
  GalleryVerticalEnd,
  Box,
  ArrowUpDown,
  Grid,
  Plus,
} from "lucide-react";

interface BaseToolbarItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  onClick?: () => void;
}

interface DrawingTool extends BaseToolbarItem {
  category: "tools";
  id: "select" | "room" | "wall" | "surface";
}

interface Opening extends BaseToolbarItem {
  category: "openings";
  id: "door" | "window";
  width: number;
  height: number;
}

interface StructuralElement extends BaseToolbarItem {
  category: "structural";
  id: "structural";
  width: number;
  height: number;
}

interface Cabinet extends BaseToolbarItem {
  category: "cabinets";
  id: "base-cabinet" | "upper-cabinet" | "island" | "countertop";
  width: number;
  height: number;
  depth: number;
}

interface Appliance extends BaseToolbarItem {
  category: "appliances";
  id: "add-appliance";
}

type ToolbarItem =
  | DrawingTool
  | Opening
  | StructuralElement
  | Cabinet
  | Appliance;

const defaultDimensions = {
  door: { width: 36, height: 80 },
  window: { width: 36, height: 48 },
  structural: { width: 48, height: 96 },
  "base-cabinet": { width: 24, height: 34.5, depth: 24 },
  "upper-cabinet": { width: 24, height: 30, depth: 12 },
  island: { width: 60, height: 34.5, depth: 24 },
  countertop: { width: 24, height: 1.5, depth: 25.5 },
} as const;

interface ToolbarProps {
  onItemDragStart?: (item: ToolbarItem | CatalogItem) => void;
  onItemDragEnd?: () => void;
  onDrawingModeChange?: (mode: string) => void;
  activeDrawingMode?: string;
}

const Toolbar = ({
  onItemDragStart = () => {},
  onItemDragEnd = () => {},
  onDrawingModeChange = () => {},
  activeDrawingMode = "",
}: ToolbarProps) => {
  const [showCatalog, setShowCatalog] = useState(false);

  const handleCatalogItemSelect = (item: CatalogItem) => {
    onItemDragStart(item);
  };

  const categories = [
    {
      title: "Drawing Tools",
      items: [
        {
          id: "select",
          name: "Select",
          icon: <Square size={24} />,
          category: "tools",
        },
        {
          id: "room",
          name: "Draw Room",
          icon: <Square size={24} />,
          category: "tools",
        },
        {
          id: "wall",
          name: "Draw Wall",
          icon: <Pencil size={24} />,
          category: "tools",
        },
        {
          id: "surface",
          name: "Draw Surface",
          icon: <Grid3X3 size={24} />,
          category: "tools",
        },
      ],
    },
    {
      title: "Openings",
      items: [
        {
          id: "door",
          name: "Place Doors",
          icon: <DoorOpen size={24} />,
          category: "openings",
          width: defaultDimensions.door.width,
          height: defaultDimensions.door.height,
        },
        {
          id: "window",
          name: "Place Windows",
          icon: <GalleryVerticalEnd size={24} />,
          category: "openings",
          width: defaultDimensions.window.width,
          height: defaultDimensions.window.height,
        },
      ],
    },
    {
      title: "Structural",
      items: [
        {
          id: "structural",
          name: "Place Structurals",
          icon: <Box size={24} />,
          category: "structural",
          width: defaultDimensions.structural.width,
          height: defaultDimensions.structural.height,
        },
      ],
    },
    {
      title: "Cabinets & Countertops",
      items: [
        {
          id: "base-cabinet",
          name: "Base Cabinet",
          icon: <Box size={24} />,
          category: "cabinets",
          width: defaultDimensions["base-cabinet"].width,
          height: defaultDimensions["base-cabinet"].height,
          depth: defaultDimensions["base-cabinet"].depth,
        },
        {
          id: "upper-cabinet",
          name: "Upper Cabinet",
          icon: <ArrowUpDown size={24} />,
          category: "cabinets",
          width: defaultDimensions["upper-cabinet"].width,
          height: defaultDimensions["upper-cabinet"].height,
          depth: defaultDimensions["upper-cabinet"].depth,
        },
        {
          id: "island",
          name: "Island",
          icon: <Grid size={24} />,
          category: "cabinets",
          width: defaultDimensions.island.width,
          height: defaultDimensions.island.height,
          depth: defaultDimensions.island.depth,
        },
        {
          id: "countertop",
          name: "Countertop",
          icon: <Grid3X3 size={24} />,
          category: "cabinets",
          width: defaultDimensions.countertop.width,
          height: defaultDimensions.countertop.height,
          depth: defaultDimensions.countertop.depth,
        },
      ],
    },
    {
      title: "Appliances & Fixtures",
      items: [
        {
          id: "add-appliance",
          name: "Add Appliance",
          icon: <Plus size={24} />,
          category: "appliances",
          onClick: () => setShowCatalog(true),
        },
      ],
    },
  ];

  return (
    <>
      <CatalogDialog
        open={showCatalog}
        onOpenChange={setShowCatalog}
        onItemSelect={handleCatalogItemSelect}
      />
      <Card className="w-[280px] h-full bg-[#1C1C1C] text-white">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {categories.map((category) => (
              <div key={category.title} className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-6 text-sm font-medium text-gray-400 hover:text-white hover:bg-transparent"
                  onClick={() => {}}
                >
                  {category.title}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  {category.items.map((item) => (
                    <TooltipProvider key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={
                              activeDrawingMode === item.id
                                ? "default"
                                : "outline"
                            }
                            className="w-full h-[60px] flex flex-col items-center justify-center gap-2 bg-transparent hover:bg-gray-800 border-gray-700"
                            onClick={() => {
                              if (item.category === "appliances") {
                                setShowCatalog(true);
                              } else if (
                                ["wall", "room", "surface"].includes(item.id)
                              ) {
                                onDrawingModeChange(
                                  activeDrawingMode === item.id ? "" : item.id,
                                );
                              }
                              if (item.onClick) {
                                item.onClick();
                              }
                            }}
                            draggable={
                              ![
                                "wall",
                                "room",
                                "surface",
                                "select",
                                "add-appliance",
                              ].includes(item.id)
                            }
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move";
                              onItemDragStart(item);
                            }}
                            onDragEnd={onItemDragEnd}
                          >
                            {item.icon}
                            <span className="text-xs">{item.name}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {["wall", "room", "surface"].includes(item.id)
                              ? `Click to ${item.name}`
                              : `Drag to add ${item.name}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </>
  );
};

export default Toolbar;

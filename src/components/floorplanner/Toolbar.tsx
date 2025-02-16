import React, { useState } from "react";
import CatalogDialog from "./CatalogDialog";
import CabinetDialog from "./CabinetDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolbarItem, CatalogItem } from "@/types/shared";
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
  ChefHat,
} from "lucide-react";

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
  const [showCabinetDialog, setShowCabinetDialog] = useState(false);

  const handleCatalogItemSelect = (item: any) => {
    onItemDragStart(item);
  };

  const categories = [
    {
      title: "Drawing Tools",
      items: [
        {
          id: "select",
          name: "Select",
          type: "select",
          icon: <ChefHat size={24} />,
          category: "tools",
        },
        {
          id: "room",
          name: "Draw Room",
          type: "room",
          icon: <Square size={24} />,
          category: "tools",
        },
        {
          id: "wall",
          name: "Draw Wall",
          type: "wall",
          icon: <Pencil size={24} />,
          category: "tools",
        },
        {
          id: "surface",
          name: "Draw Surface",
          type: "surface",
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
          type: "door",
          icon: <DoorOpen size={24} />,
          category: "openings",
        },
        {
          id: "window",
          name: "Place Windows",
          type: "window",
          icon: <GalleryVerticalEnd size={24} />,
          category: "openings",
        },
      ],
    },
    {
      title: "Structural",
      items: [
        {
          id: "structural",
          name: "Place Structurals",
          type: "structural",
          icon: <Box size={24} />,
          category: "structural",
        },
      ],
    },
    {
      title: "Cabinets & Countertops",
      items: [
        {
          id: "base-cabinet",
          name: "Base Cabinet",
          type: "base-cabinet",
          icon: <Box size={24} />,
          category: "cabinets",
        },
        {
          id: "upper-cabinet",
          name: "Upper Cabinet",
          type: "upper-cabinet",
          icon: <ArrowUpDown size={24} />,
          category: "cabinets",
        },
        {
          id: "island",
          name: "Island",
          type: "island",
          icon: <Grid size={24} />,
          category: "cabinets",
        },
        {
          id: "countertop",
          name: "Countertop",
          type: "countertop",
          icon: <Grid3X3 size={24} />,
          category: "cabinets",
        },
      ],
    },
    {
      title: "Appliances & Fixtures",
      items: [
        {
          id: "appliances",
          name: "Add Appliance",
          type: "appliance",
          icon: <ChefHat size={24} />,
          category: "appliances",
        },
      ],
    },
  ];

  return (
    <>
      <CabinetDialog
        open={showCabinetDialog}
        onOpenChange={setShowCabinetDialog}
        onCabinetSelect={(cabinet) => {
          onItemDragStart({
            ...cabinet,
            category: "cabinets",
            icon:
              cabinet.type === "upper" ? (
                <ArrowUpDown size={24} />
              ) : (
                <Box size={24} />
              ),
          });
        }}
      />
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
                              if (item.id === "appliances") {
                                setShowCatalog(true);
                              } else if (item.category === "cabinets") {
                                setShowCabinetDialog(true);
                              } else if (
                                ["wall", "room", "surface"].includes(item.id)
                              ) {
                                onDrawingModeChange(
                                  activeDrawingMode === item.id ? "" : item.id,
                                );
                              }
                            }}
                            draggable={
                              !["wall", "room", "surface"].includes(item.id)
                            }
                            onDragStart={() => onItemDragStart(item)}
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

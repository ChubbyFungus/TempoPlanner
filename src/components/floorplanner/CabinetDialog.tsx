import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, ArrowUpDown } from "lucide-react";

interface CabinetType {
  id: string;
  name: string;
  type: "base" | "upper" | "tall";
  width: number;
  height: number;
  depth: number;
  description: string;
}

interface CabinetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCabinetSelect: (cabinet: CabinetType) => void;
}

const standardCabinets: CabinetType[] = [
  // Base Cabinets (34.5" height standard)
  {
    id: "base-12",
    name: '12" Base Cabinet',
    type: "base",
    width: 12,
    height: 34.5,
    depth: 24,
    description: "Standard 12-inch base cabinet",
  },
  {
    id: "base-15",
    name: '15" Base Cabinet',
    type: "base",
    width: 15,
    height: 34.5,
    depth: 24,
    description: "Standard 15-inch base cabinet",
  },
  {
    id: "base-18",
    name: '18" Base Cabinet',
    type: "base",
    width: 18,
    height: 34.5,
    depth: 24,
    description: "Standard 18-inch base cabinet",
  },
  {
    id: "base-24",
    name: '24" Base Cabinet',
    type: "base",
    width: 24,
    height: 34.5,
    depth: 24,
    description: "Standard 24-inch base cabinet",
  },
  {
    id: "base-30",
    name: '30" Base Cabinet',
    type: "base",
    width: 30,
    height: 34.5,
    depth: 24,
    description: "Standard 30-inch base cabinet",
  },
  {
    id: "base-36",
    name: '36" Base Cabinet',
    type: "base",
    width: 36,
    height: 34.5,
    depth: 24,
    description: "Standard 36-inch base cabinet",
  },
  // Upper Cabinets (30" height standard)
  {
    id: "upper-12",
    name: '12" Upper Cabinet',
    type: "upper",
    width: 12,
    height: 30,
    depth: 12,
    description: "Standard 12-inch upper cabinet",
  },
  {
    id: "upper-15",
    name: '15" Upper Cabinet',
    type: "upper",
    width: 15,
    height: 30,
    depth: 12,
    description: "Standard 15-inch upper cabinet",
  },
  {
    id: "upper-18",
    name: '18" Upper Cabinet',
    type: "upper",
    width: 18,
    height: 30,
    depth: 12,
    description: "Standard 18-inch upper cabinet",
  },
  {
    id: "upper-24",
    name: '24" Upper Cabinet',
    type: "upper",
    width: 24,
    height: 30,
    depth: 12,
    description: "Standard 24-inch upper cabinet",
  },
  {
    id: "upper-30",
    name: '30" Upper Cabinet',
    type: "upper",
    width: 30,
    height: 30,
    depth: 12,
    description: "Standard 30-inch upper cabinet",
  },
  {
    id: "upper-36",
    name: '36" Upper Cabinet',
    type: "upper",
    width: 36,
    height: 30,
    depth: 12,
    description: "Standard 36-inch upper cabinet",
  },
  // Tall Cabinets (84" height standard)
  {
    id: "tall-24",
    name: '24" Tall Cabinet',
    type: "tall",
    width: 24,
    height: 84,
    depth: 24,
    description: "Standard 24-inch tall cabinet",
  },
  {
    id: "tall-30",
    name: '30" Tall Cabinet',
    type: "tall",
    width: 30,
    height: 84,
    depth: 24,
    description: "Standard 30-inch tall cabinet",
  },
  {
    id: "tall-36",
    name: '36" Tall Cabinet',
    type: "tall",
    width: 36,
    height: 84,
    depth: 24,
    description: "Standard 36-inch tall cabinet",
  },
];

const CabinetDialog = ({
  open,
  onOpenChange,
  onCabinetSelect,
}: CabinetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Cabinet</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="base">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="base" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Base Cabinets
            </TabsTrigger>
            <TabsTrigger value="upper" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Upper Cabinets
            </TabsTrigger>
            <TabsTrigger value="tall" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Tall Cabinets
            </TabsTrigger>
          </TabsList>

          {["base", "upper", "tall"].map((type) => (
            <TabsContent key={type} value={type}>
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-3 gap-4 p-4">
                  {standardCabinets
                    .filter((cabinet) => cabinet.type === type)
                    .map((cabinet) => (
                      <Card
                        key={cabinet.id}
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          onCabinetSelect(cabinet);
                          onOpenChange(false);
                        }}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                            <Box className="h-12 w-12 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">{cabinet.name}</h3>
                            <p className="text-sm text-gray-500">
                              {cabinet.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">
                              {cabinet.width}"W × {cabinet.height}"H ×{" "}
                              {cabinet.depth}"D
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CabinetDialog;

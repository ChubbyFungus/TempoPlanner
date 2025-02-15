import React, { useState } from "react";
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
import {
  Bath,
  Refrigerator,
  Waves,
  Utensils,
  ChefHat,
  Droplets,
  Fan,
} from "lucide-react";

interface CatalogItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  image: string;
  category: string;
  width: number;
  height: number;
  depth: number;
  description: string;
  price?: string;
}

interface CatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemSelect: (item: CatalogItem) => void;
}

const CatalogDialog = ({
  open,
  onOpenChange,
  onItemSelect,
}: CatalogDialogProps) => {
  const [activeCategory, setActiveCategory] = useState("refrigerators");

  const categories = [
    {
      id: "refrigerators",
      name: "Refrigerators",
      icon: <Refrigerator className="h-4 w-4" />,
      items: [
        {
          id: "sub-zero-pro-48",
          name: "Pro 48",
          brand: "Sub-Zero",
          model: "PRO48",
          image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30",
          category: "refrigerators",
          width: 48,
          height: 84,
          depth: 24,
          description:
            "Built-in side-by-side refrigerator with professional handles",
          price: "$19,500",
        },
        {
          id: "wolf-dual-fuel-48",
          name: "Dual Fuel Range",
          brand: "Wolf",
          model: "DF48650SP",
          image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1",
          category: "ranges",
          width: 48,
          height: 36,
          depth: 29,
          description:
            '48" dual-fuel range with 6 burners and infrared griddle',
          price: "$15,750",
        },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Appliance Catalog</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full justify-start">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-3 gap-4 p-4">
                  {category.items.map((item) => (
                    <Card
                      key={item.id}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        onItemSelect(item);
                        onOpenChange(false);
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.brand}</h3>
                          <p className="text-sm text-gray-500">{item.model}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">
                            {item.width}"W × {item.height}"H × {item.depth}"D
                          </span>
                          <span className="font-medium">{item.price}</span>
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

export default CatalogDialog;

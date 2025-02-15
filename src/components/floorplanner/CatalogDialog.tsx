import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Search,
  Refrigerator,
  ChefHat,
  Waves,
  Bath,
  Box,
} from "lucide-react";

export interface CatalogItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  image: string;
  type?: string;
  category?: string;
  width: number;
  height: number;
  depth: number;
  description: string;
  price?: string;
  label?: string;
}

interface Brand {
  name: string;
  models: CatalogItem[];
}

interface Subcategory {
  name: string;
  brands: Brand[];
}

interface Category {
  name: string;
  subcategories: Subcategory[];
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
  const [activeTab, setActiveTab] = useState<"categories" | "brands">(
    "categories",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("Kitchen");
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<string>("Kitchen bins");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      name: "Kitchen",
      subcategories: [
        {
          name: "Basic units",
          brands: [
            {
              name: "IKEA",
              models: [
                {
                  id: "sektion-base",
                  name: "SEKTION Base Cabinet",
                  brand: "IKEA",
                  model: "SEKTION",
                  image:
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
                  width: 30,
                  height: 30,
                  depth: 24,
                  description: "Base cabinet frame, white",
                  price: "$89",
                },
              ],
            },
          ],
        },
        {
          name: "Baking & Bakeware",
          brands: [
            {
              name: "KitchenAid",
              models: [
                {
                  id: "stand-mixer",
                  name: "Professional Stand Mixer",
                  brand: "KitchenAid",
                  model: "KP26M1XER",
                  image:
                    "https://images.unsplash.com/photo-1594222082006-57166bb68d75",
                  width: 14,
                  height: 17,
                  depth: 11,
                  description: "6-quart bowl-lift stand mixer",
                  price: "$499.99",
                },
              ],
            },
          ],
        },
        {
          name: "Built-in kitchen & Kitchen storage",
          brands: [
            {
              name: "IKEA",
              models: [
                {
                  id: "pax-wardrobe",
                  name: "PAX Kitchen Storage Unit",
                  brand: "IKEA",
                  model: "PAX",
                  image:
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
                  width: 39.25,
                  height: 93.125,
                  depth: 23.625,
                  description: "Customizable storage solution",
                  price: "$499",
                },
              ],
            },
          ],
        },
        {
          name: "Cleaning accessories",
          brands: [
            {
              name: "Simplehuman",
              models: [
                {
                  id: "trash-can",
                  name: "Rectangular Step Can",
                  brand: "Simplehuman",
                  model: "CW2054",
                  image:
                    "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce",
                  width: 19.8,
                  height: 25.7,
                  depth: 12.8,
                  description: "45L stainless steel step trash can",
                  price: "$130",
                },
              ],
            },
          ],
        },
        {
          name: "Coffee & Tea",
          brands: [
            {
              name: "Breville",
              models: [
                {
                  id: "espresso-machine",
                  name: "Barista Express",
                  brand: "Breville",
                  model: "BES870XL",
                  image:
                    "https://images.unsplash.com/photo-1612887726773-e64e20cf08fe",
                  width: 13.25,
                  height: 15.75,
                  depth: 12.5,
                  description: "Espresso machine with grinder",
                  price: "$699.95",
                },
              ],
            },
          ],
        },
        {
          name: "Cook's tools",
          brands: [
            {
              name: "Global",
              models: [
                {
                  id: "knife-set",
                  name: "7-Piece Knife Block Set",
                  brand: "Global",
                  model: "G-835/KB",
                  image:
                    "https://images.unsplash.com/photo-1593618998160-e34014e67546",
                  width: 10,
                  height: 12,
                  depth: 6,
                  description: "Professional knife set with block",
                  price: "$599.95",
                },
              ],
            },
          ],
        },
        {
          name: "Kitchen bins",
          brands: [
            {
              name: "Simplehuman",
              models: [
                {
                  id: "dual-trash",
                  name: "Dual Compartment Step Can",
                  brand: "Simplehuman",
                  model: "CW2025",
                  image:
                    "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce",
                  width: 24.8,
                  height: 25.7,
                  depth: 14.8,
                  description: "58L recycling step trash can",
                  price: "$199.99",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Appliances",
      subcategories: [
        {
          name: "Refrigerators",
          brands: [
            {
              name: "Samsung",
              models: [
                {
                  id: "rf28r7551sr",
                  name: "28 cu. ft. 4-Door French Door Refrigerator",
                  brand: "Samsung",
                  model: "RF28R7551SR",
                  image:
                    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30",
                  width: 36,
                  height: 70,
                  depth: 34,
                  description:
                    "Large capacity French door refrigerator with FlexZone drawer",
                  price: "$2,699",
                },
                {
                  id: "rf23m8570sr",
                  name: "23 cu. ft. Counter Depth 4-Door French Door",
                  brand: "Samsung",
                  model: "RF23M8570SR",
                  image:
                    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30",
                  width: 36,
                  height: 70,
                  depth: 28.5,
                  description: "Counter-depth design with Twin Cooling Plus",
                  price: "$3,399",
                },
              ],
            },
            {
              name: "LG",
              models: [
                {
                  id: "lfxs26973s",
                  name: "26 cu. ft. Side-by-Side Refrigerator",
                  brand: "LG",
                  model: "LFXS26973S",
                  image:
                    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30",
                  width: 36,
                  height: 70,
                  depth: 33,
                  description: "Side-by-side design with Door-in-Door",
                  price: "$1,799",
                },
              ],
            },
          ],
        },
        {
          name: "Ranges",
          brands: [
            {
              name: "GE",
              models: [
                {
                  id: "jgb735spss",
                  name: '30" Free-Standing Gas Range',
                  brand: "GE",
                  model: "JGB735SPSS",
                  image:
                    "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1",
                  width: 30,
                  height: 47,
                  depth: 28,
                  description:
                    "5.0 cu. ft. gas range with edge-to-edge cooktop",
                  price: "$999",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Cabinets",
      subcategories: [
        {
          name: "Base Cabinets",
          brands: [
            {
              name: "KraftMaid",
              models: [
                {
                  id: "b30",
                  name: '30" Base Cabinet',
                  brand: "KraftMaid",
                  model: "B30",
                  image:
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
                  width: 30,
                  height: 34.5,
                  depth: 24,
                  description:
                    "Standard base cabinet with one drawer and two doors",
                  price: "$399",
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-6">
        <DialogHeader className="pb-4">
          <DialogTitle>Objects</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <Button
              variant={activeTab === "categories" ? "default" : "ghost"}
              className="flex-1 rounded-none"
              onClick={() => setActiveTab("categories")}
            >
              Categories
            </Button>
            <Button
              variant={activeTab === "brands" ? "default" : "ghost"}
              className="flex-1 rounded-none"
              onClick={() => setActiveTab("brands")}
            >
              Brands
            </Button>
          </div>

          {/* Search and Favorites */}
          <div className="flex gap-2 p-4 border-b">
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search Kitchen bins"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Categories and Subcategories */}
            <div className="w-48 border-r">
              <ScrollArea className="h-full">
                {categories.map((category) => (
                  <div key={category.name}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start rounded-none font-semibold ${selectedCategory === category.name ? "bg-gray-100" : ""}`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name}
                    </Button>
                    {selectedCategory === category.name && (
                      <div className="pl-4">
                        {category.subcategories.map((subcategory) => (
                          <Button
                            key={subcategory.name}
                            variant="ghost"
                            className={`w-full justify-start rounded-none text-sm ${selectedSubCategory === subcategory.name ? "bg-gray-50" : ""}`}
                            onClick={() =>
                              setSelectedSubCategory(subcategory.name)
                            }
                          >
                            {subcategory.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Brands and Models Grid */}
            <div className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {categories
                    .find((c) => c.name === selectedCategory)
                    ?.subcategories.find((s) => s.name === selectedSubCategory)
                    ?.brands.map((brand) => (
                      <div key={brand.name} className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">
                          {brand.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {brand.models.map((model) => (
                            <Button
                              key={model.id}
                              variant="outline"
                              className="h-40 p-4 flex flex-col items-start justify-between text-left"
                              onClick={() => onItemSelect(model)}
                            >
                              <div>
                                <h4 className="font-medium">{model.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {model.model}
                                </p>
                              </div>
                              <div className="w-full flex justify-between items-end">
                                <span className="text-xs text-gray-500">
                                  {model.width}"W × {model.height}"H ×{" "}
                                  {model.depth}"D
                                </span>
                                <span className="text-sm font-medium">
                                  {model.price}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogDialog;

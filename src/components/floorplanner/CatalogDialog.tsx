import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export interface CatalogItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  image?: string;
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
  isExpanded?: boolean;
}

interface CatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemSelect: (item: CatalogItem) => void;
}

const parseDimensions = (
  dimensionsStr: string | null,
): { width: number; height: number; depth: number } => {
  const defaultDimensions = { width: 36, height: 70, depth: 32 };

  if (!dimensionsStr) return defaultDimensions;

  try {
    console.log("Raw dimensions string:", dimensionsStr);

    // Handle format like "24"×84"×24"
    if (dimensionsStr.includes("×")) {
      const dimensions = dimensionsStr.split("×").map((d) => {
        // Remove the inch symbol and any whitespace
        const cleanStr = d.replace(/"/g, "").trim();
        return parseFloat(cleanStr);
      });

      if (dimensions.length >= 2) {
        const result = {
          width: dimensions[0] || defaultDimensions.width,
          height: dimensions[1] || defaultDimensions.height,
          depth: dimensions[2] || defaultDimensions.depth,
        };
        console.log("Parsed dimensions:", result);
        return result;
      }
    }

    // Handle JSON format
    if (dimensionsStr.startsWith("{") && dimensionsStr.endsWith("}")) {
      try {
        const parsed = JSON.parse(dimensionsStr);
        return {
          width: Number(parsed.width) || defaultDimensions.width,
          height: Number(parsed.height) || defaultDimensions.height,
          depth: Number(parsed.depth) || defaultDimensions.depth,
        };
      } catch (e) {
        console.error("Failed to parse JSON dimensions:", e);
      }
    }

    // Handle comma-separated format
    const pairs = dimensionsStr.split(",");
    const dimensions = { ...defaultDimensions };

    for (const pair of pairs) {
      const [key, value] = pair.split(":").map((s) => s.trim().toLowerCase());
      const numValue = parseFloat(value);

      if (!isNaN(numValue)) {
        if (key === "w" || key === "width") dimensions.width = numValue;
        else if (key === "h" || key === "height") dimensions.height = numValue;
        else if (key === "d" || key === "depth") dimensions.depth = numValue;
      }
    }

    // Validate dimensions
    if (
      dimensions.width <= 0 ||
      dimensions.height <= 0 ||
      dimensions.depth <= 0
    ) {
      console.warn("Invalid dimensions, using defaults:", dimensions);
      return defaultDimensions;
    }

    return dimensions;
  } catch (error) {
    console.error("Error parsing dimensions:", error);
    return defaultDimensions;
  }
};

// Convert inches to grid units (20px = 1ft = 12in)
const inchesToGridUnits = (inches: number) => {
  // Each foot is 20px, so each inch is 20/12 pixels
  const PIXELS_PER_INCH = 20 / 12;
  return Math.round(inches * PIXELS_PER_INCH);
};

// Convert grid units back to inches for display
const gridUnitsToInches = (gridUnits: number) => {
  const GRID_UNIT = 20; // 20px = 1ft
  const INCHES_PER_FOOT = 12;
  return Math.round((gridUnits * INCHES_PER_FOOT) / GRID_UNIT);
};

const CatalogDialog = ({
  open,
  onOpenChange,
  onItemSelect,
}: CatalogDialogProps) => {
  const [catalogData, setCatalogData] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCatalogData = async () => {
      const { data, error } = await supabase
        .from("catalog objects")
        .select("*");

      if (error) {
        console.error("Error fetching catalog data:", error);
        return;
      }

      // Transform the data into our category structure
      const categoriesMap = new Map<
        string,
        Map<string, Map<string, CatalogItem[]>>
      >();

      data.forEach((item) => {
        console.log(
          "Processing item:",
          item.Name,
          "Raw dimensions string:",
          item.Dimensions,
        );
        const dimensions = parseDimensions(item.Dimensions);
        console.log("Parsed dimensions for", item.Name, ":", dimensions);

        // Convert inches to grid units
        const gridWidth = inchesToGridUnits(dimensions.width);
        const gridHeight = inchesToGridUnits(dimensions.height);
        const gridDepth = inchesToGridUnits(dimensions.depth);

        console.log("Grid units for", item.Name, ":", {
          width: gridWidth,
          height: gridHeight,
          depth: gridDepth,
          "original inches": dimensions,
        });

        const catalogItem: CatalogItem = {
          id: item.ItemID.toString(),
          name: item.Name,
          brand: item.Brand,
          model: item.Model,
          width: gridWidth,
          height: gridHeight,
          depth: gridDepth,
          description: `${item.Name} by ${item.Brand}`,
          type: item.Category.toLowerCase().replace(" ", "-"),
        };

        if (!categoriesMap.has(item.Category)) {
          categoriesMap.set(item.Category, new Map());
        }
        const category = categoriesMap.get(item.Category)!;

        if (!category.has(item.Brand)) {
          category.set(item.Brand, new Map());
        }
        const brand = category.get(item.Brand)!;

        if (!brand.has(item.Model)) {
          brand.set(item.Model, []);
        }
        brand.get(item.Model)!.push(catalogItem);
      });

      // Convert the maps to our category structure
      const categories: Category[] = Array.from(categoriesMap.entries()).map(
        ([categoryName, brands]) => ({
          name: categoryName,
          subcategories: [
            {
              name: categoryName,
              brands: Array.from(brands.entries()).map(
                ([brandName, models]) => ({
                  name: brandName,
                  models: Array.from(models.values()).flat(),
                }),
              ),
            },
          ],
        }),
      );

      setCatalogData(categories);
      if (categories.length > 0) {
        setSelectedCategory(categories[0].name);
      }
    };

    fetchCatalogData();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle>Objects</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[85vh]">
          {/* Search and Favorites */}
          <div className="flex items-center p-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search objects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden h-full">
            {/* Categories and Subcategories */}
            <div className="w-64 border-r h-full overflow-hidden">
              <ScrollArea className="h-full">
                {catalogData.map((category) => (
                  <div key={category.name} className="py-1">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start rounded-none px-4 py-2 font-semibold ${selectedCategory === category.name ? "bg-gray-100" : ""}`}
                      onClick={() => {
                        const newExpanded = new Set(expandedCategories);
                        if (expandedCategories.has(category.name)) {
                          newExpanded.delete(category.name);
                        } else {
                          newExpanded.add(category.name);
                        }
                        setExpandedCategories(newExpanded);
                        setSelectedCategory(category.name);
                      }}
                    >
                      <div className="flex items-center w-full">
                        <span>{category.name}</span>
                        <span className="ml-auto">
                          {expandedCategories.has(category.name) ? "−" : "+"}
                        </span>
                      </div>
                    </Button>
                    {expandedCategories.has(category.name) && (
                      <div className="pl-4 border-l border-gray-200 ml-2 mt-1">
                        {category.subcategories.map((subcategory) => (
                          <Button
                            key={subcategory.name}
                            variant="ghost"
                            className={`w-full justify-start rounded-none px-4 py-2 text-sm ${selectedCategory === subcategory.name ? "bg-gray-50" : ""}`}
                            onClick={() =>
                              setSelectedCategory(subcategory.name)
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
            <div className="flex-1 h-full overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-8">
                  {catalogData
                    .find((c) => c.name === selectedCategory)
                    ?.subcategories.find((s) => s.name === selectedCategory)
                    ?.brands.map((brand) => (
                      <div key={brand.name}>
                        <h3 className="text-lg font-semibold mb-4">
                          {brand.name}
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          {brand.models
                            .filter((model) =>
                              searchQuery
                                ? model.name
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()) ||
                                  model.model
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()) ||
                                  model.brand
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())
                                : true,
                            )
                            .map((model) => (
                              <Button
                                key={model.id}
                                variant="outline"
                                className="h-[100px] p-4 flex flex-col items-start justify-between text-left hover:border-primary"
                                onClick={() => onItemSelect(model)}
                              >
                                <div className="w-full">
                                  <h4 className="font-medium truncate">
                                    {model.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {gridUnitsToInches(model.width)}"W ×{" "}
                                    {gridUnitsToInches(model.height)}"H ×{" "}
                                    {gridUnitsToInches(model.depth)}"D
                                  </p>
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

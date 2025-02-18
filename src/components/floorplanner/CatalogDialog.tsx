import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CatalogItem, RoomLayout, Category } from "@/types/shared";
import { KITCHEN_LAYOUTS, BATHROOM_LAYOUTS } from "@/lib/roomLayouts";
import {
  Bath,
  Refrigerator,
  ChefHat,
  Fan,
  LayoutTemplate,
  Square,
} from "lucide-react";

interface CatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemSelect: (item: RoomLayout | CatalogItem) => void;
  catalogType?: "room" | "appliance";
}

const LayoutPreview = ({ points, type }: { points: { x: number; y: number }[], type: string }) => {
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  const width = maxX - minX;
  const height = maxY - minY;
  const padding = 20;
  const viewBox = `${minX - padding} ${minY - padding} ${width + 2 * padding} ${height + 2 * padding}`;

  return (
    <svg viewBox={viewBox} className="w-full h-full">
      <path
        d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`}
        fill="#f3f4f6"
        stroke="#666"
        strokeWidth="2"
      />
      {type === "kitchen" && (
        <>
          {/* Add counter symbols */}
          <rect x={minX + 10} y={minY + 10} width={20} height={4} fill="#666" />
          <rect x={maxX - 30} y={minY + 10} width={20} height={4} fill="#666" />
        </>
      )}
      {type === "bathroom" && (
        <>
          {/* Add bathroom fixture symbols */}
          <circle cx={minX + 20} cy={minY + 20} r={8} fill="#666" />
          <rect x={maxX - 30} y={minY + 10} width={20} height={10} fill="#666" />
        </>
      )}
    </svg>
  );
};

const CatalogDialog = ({
  open,
  onOpenChange,
  onItemSelect,
  catalogType = "appliance",
}: CatalogDialogProps) => {
  const [activeCategory, setActiveCategory] = useState(catalogType === "room" ? "kitchens" : "refrigerators");
  const [scale, setScale] = useState(1);

  const categories: Category[] = catalogType === "room" ? [
    {
      id: "kitchens",
      name: "Kitchens",
      icon: <LayoutTemplate className="h-4 w-4" />,
      items: KITCHEN_LAYOUTS
    },
    {
      id: "bathrooms",
      name: "Bathrooms",
      icon: <Square className="h-4 w-4" />,
      items: BATHROOM_LAYOUTS
    }
  ] : [
    {
      id: "refrigerators",
      name: "Refrigerators",
      icon: <Refrigerator className="h-4 w-4" />,
      items: [
        {
          id: "sub-zero-pro-48",
          name: "Sub-Zero PRO 48",
          type: "refrigerator",
          category: "appliances",
          brand: "sub-zero",
          model: "PRO 48",
          width: 48,
          height: 84,
          depth: 24,
          price: "$17,995",
          image: "/images/appliances/sub-zero-pro-48.jpg",
          description: "Professional 48-inch built-in side-by-side refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          },
          overlayPreset: {
            type: "brushed",
            angle: 0,
            opacity: 0.5,
            scale: 1,
            strength: 0.5
          }
        },
        {
          id: "thermador-t36",
          name: "Thermador T36",
          type: "refrigerator",
          category: "appliances",
          brand: "thermador",
          model: "T36",
          width: 36,
          height: 84,
          depth: 24,
          price: "$11,495",
          image: "/images/appliances/thermador-t36.jpg",
          description: "36-inch built-in french door refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          },
          overlayPreset: {
            type: "brushed",
            angle: 0,
            opacity: 0.5,
            scale: 1,
            strength: 0.5
          }
        },
        {
          id: "viking-vbi7360",
          name: "Viking VBI7360",
          type: "refrigerator",
          category: "appliances",
          brand: "viking",
          model: "VBI7360",
          width: 36,
          height: 84,
          depth: 24,
          price: "$12,995",
          image: "/images/appliances/viking-vbi7360.jpg",
          description: "36-inch built-in bottom-mount refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          },
          overlayPreset: {
            type: "brushed",
            angle: 0,
            opacity: 0.5,
            scale: 1,
            strength: 0.5
          }
        },
        {
          id: "miele-kf2982vi",
          name: "Miele KF2982Vi",
          type: "refrigerator",
          category: "appliances",
          brand: "miele",
          model: "KF2982Vi",
          width: 36,
          height: 84,
          depth: 24,
          price: "$10,995",
          image: "/images/appliances/miele-kf2982vi.jpg",
          description: "36-inch built-in bottom-mount refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          },
          overlayPreset: {
            type: "brushed",
            angle: 0,
            opacity: 0.5,
            scale: 1,
            strength: 0.5
          }
        },
        {
          id: "liebherr-monolith",
          name: "Liebherr Monolith",
          type: "refrigerator",
          category: "appliances",
          brand: "liebherr",
          model: "Monolith",
          width: 36,
          height: 84,
          depth: 24,
          price: "$11,495",
          image: "/images/appliances/liebherr-monolith.jpg",
          description: "36-inch built-in bottom-mount refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          },
          overlayPreset: {
            type: "brushed",
            angle: 0,
            opacity: 0.5,
            scale: 1,
            strength: 0.5
          }
        }
      ]
    },
    {
      id: "cove",
      name: "Cove",
      icon: <ChefHat className="h-4 w-4" />,
      items: [
        {
          id: "cove-uc-24r",
          name: "Cove UC-24R",
          type: "refrigerator-undercounter",
          category: "appliances",
          brand: "cove",
          model: "UC-24R",
          width: 24,
          height: 34,
          depth: 24,
          price: "$4,420",
          image: "/images/appliances/cove-uc-24r.jpg",
          description: "24-inch Undercounter Refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "cove-uc-24ro",
          name: "Cove UC-24RO",
          type: "refrigerator-undercounter-outdoor",
          category: "appliances",
          brand: "cove",
          model: "UC-24RO",
          width: 24,
          height: 34,
          depth: 24,
          price: "$4,850",
          image: "/images/appliances/cove-uc-24ro.jpg",
          description: "24-inch Outdoor Undercounter Refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "cove-uc-24bg-s",
          name: "Cove UC-24BG-S",
          type: "beverage-center",
          category: "appliances",
          brand: "cove",
          model: "UC-24BG-S",
          width: 24,
          height: 34,
          depth: 24,
          price: "$4,200",
          image: "/images/appliances/cove-uc-24bg-s.jpg",
          description: "24-inch Beverage Center",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "cove-uc-24bg-o",
          name: "Cove UC-24BG-O",
          type: "beverage-center-outdoor",
          category: "appliances",
          brand: "cove",
          model: "UC-24BG-O",
          width: 24,
          height: 34,
          depth: 24,
          price: "$4,420",
          image: "/images/appliances/cove-uc-24bg-o.jpg",
          description: "24-inch Outdoor Beverage Center",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "cove-uc-24c",
          name: "Cove UC-24C",
          type: "ice-maker",
          category: "appliances",
          brand: "cove",
          model: "UC-24C",
          width: 24,
          height: 34,
          depth: 24,
          price: "$4,730",
          image: "/images/appliances/cove-uc-24c.jpg",
          description: "24-inch Clear Ice Maker",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "cove-uc-24ci",
          name: "Cove UC-24CI",
          type: "ice-maker",
          category: "appliances",
          brand: "cove",
          model: "UC-24CI",
          width: 24,
          height: 34,
          depth: 24,
          price: "$4,850",
          image: "/images/appliances/cove-uc-24ci.jpg",
          description: "24-inch Ice Maker",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "cove-uc-15i",
          name: "Cove UC-15I",
          type: "ice-maker",
          category: "appliances",
          brand: "cove",
          model: "UC-15I",
          width: 15,
          height: 34,
          depth: 24,
          price: "$4,200",
          image: "/images/appliances/cove-uc-15i.jpg",
          description: "15-inch Ice Maker",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "cove-uc-15ip",
          name: "Cove UC-15IP",
          type: "ice-maker",
          category: "appliances",
          brand: "cove",
          model: "UC-15IP",
          width: 15,
          height: 34,
          depth: 24,
          price: "$4,420",
          image: "/images/appliances/cove-uc-15ip.jpg",
          description: "15-inch Ice Maker with Pump",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "cove-uc-15ipo",
          name: "Cove UC-15IPO",
          type: "ice-maker-outdoor",
          category: "appliances",
          brand: "cove",
          model: "UC-15IPO",
          width: 15,
          height: 34,
          depth: 24,
          price: "$4,630",
          image: "/images/appliances/cove-uc-15ipo.jpg",
          description: "15-inch Outdoor Ice Maker with Pump",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "cove-uc-15io",
          name: "Cove UC-15IO",
          type: "ice-maker-outdoor",
          category: "appliances",
          brand: "cove",
          model: "UC-15IO",
          width: 15,
          height: 34,
          depth: 24,
          price: "$4,420",
          image: "/images/appliances/cove-uc-15io.jpg",
          description: "15-inch Outdoor Ice Maker",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    },
    {
      id: "wall-ovens",
      name: "Wall Ovens",
      icon: <ChefHat className="h-4 w-4" />,
      items: [
        {
          id: "wolf-wwd30",
          name: "Wolf WWD30",
          type: "warming-drawer",
          category: "appliances",
          brand: "wolf",
          model: "WWD30",
          width: 30,
          height: 10.5,
          depth: 24,
          price: "$2,120",
          image: "/images/appliances/wolf-wwd30.jpg",
          description: "30-inch Warming Drawer",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-wwd30o",
          name: "Wolf WWD30O",
          type: "warming-drawer-outdoor",
          category: "appliances",
          brand: "wolf",
          model: "WWD30O",
          width: 30,
          height: 10.5,
          depth: 24,
          price: "$2,320",
          image: "/images/appliances/wolf-wwd30o.jpg",
          description: "30-inch Outdoor Warming Drawer",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-ws-30-s",
          name: "Wolf WS-30-S",
          type: "wall-oven",
          category: "appliances",
          brand: "wolf",
          model: "WS-30-S",
          width: 30,
          height: 29,
          depth: 24,
          price: "$8,420",
          image: "/images/appliances/wolf-ws-30-s.jpg",
          description: "30-inch Wall Oven",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-ws-30-o",
          name: "Wolf WS-30-O",
          type: "wall-oven-outdoor",
          category: "appliances",
          brand: "wolf",
          model: "WS-30-O",
          width: 30,
          height: 29,
          depth: 24,
          price: "$9,120",
          image: "/images/appliances/wolf-ws-30-o.jpg",
          description: "30-inch Outdoor Wall Oven",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    },
    {
      id: "ventilation",
      name: "Ventilation",
      icon: <Fan className="h-4 w-4" />,
      items: [
        {
          id: "wolf-vw45g",
          name: "Wolf VW45G",
          type: "wall-hood",
          category: "appliances",
          brand: "wolf",
          model: "VW45G",
          width: 45,
          height: 18,
          depth: 24,
          price: "$3,920",
          image: "/images/appliances/wolf-vw45g.jpg",
          description: "45-inch Wall Hood - Glass",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-vw45b",
          name: "Wolf VW45B",
          type: "wall-hood",
          category: "appliances",
          brand: "wolf",
          model: "VW45B",
          width: 45,
          height: 18,
          depth: 24,
          price: "$3,920",
          image: "/images/appliances/wolf-vw45b.jpg",
          description: "45-inch Wall Hood - Black",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-vw36s",
          name: "Wolf VW36S",
          type: "wall-hood",
          category: "appliances",
          brand: "wolf",
          model: "VW36S",
          width: 36,
          height: 18,
          depth: 24,
          price: "$3,620",
          image: "/images/appliances/wolf-vw36s.jpg",
          description: "36-inch Wall Hood - Stainless",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-vi45g",
          name: "Wolf VI45G",
          type: "island-hood",
          category: "appliances",
          brand: "wolf",
          model: "VI45G",
          width: 45,
          height: 18,
          depth: 24,
          price: "$4,220",
          image: "/images/appliances/wolf-vi45g.jpg",
          description: "45-inch Island Hood - Glass",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    },
    {
      id: "ranges",
      name: "Ranges",
      icon: <ChefHat className="h-4 w-4" />,
      items: [
        {
          id: "wolf-srt486g",
          name: "Wolf SRT486G",
          type: "range",
          category: "appliances",
          brand: "wolf",
          model: "SRT486G",
          width: 48,
          height: 36,
          depth: 29,
          price: "$14,920",
          image: "/images/appliances/wolf-srt486g.jpg",
          description: "48-inch Gas Range - 6 Burners",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-srt366",
          name: "Wolf SRT366",
          type: "range",
          category: "appliances",
          brand: "wolf",
          model: "SRT366",
          width: 36,
          height: 36,
          depth: 29,
          price: "$11,920",
          image: "/images/appliances/wolf-srt366.jpg",
          description: "36-inch Gas Range - 6 Burners",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-srt304",
          name: "Wolf SRT304",
          type: "range",
          category: "appliances",
          brand: "wolf",
          model: "SRT304",
          width: 30,
          height: 36,
          depth: 29,
          price: "$9,920",
          image: "/images/appliances/wolf-srt304.jpg",
          description: "30-inch Gas Range - 4 Burners",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    },
    {
      id: "specialty-ovens",
      name: "Specialty Ovens",
      icon: <ChefHat className="h-4 w-4" />,
      items: [
        {
          id: "wolf-so36u-s",
          name: "Wolf SO36U-S",
          type: "convection-steam-oven",
          category: "appliances",
          brand: "wolf",
          model: "SO36U-S",
          width: 36,
          height: 18,
          depth: 22,
          price: "$8,920",
          image: "/images/appliances/wolf-so36u-s.jpg",
          description: "36-inch Convection Steam Oven",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-so30u-s",
          name: "Wolf SO30U-S",
          type: "convection-steam-oven",
          category: "appliances",
          brand: "wolf",
          model: "SO30U-S",
          width: 30,
          height: 18,
          depth: 22,
          price: "$8,420",
          image: "/images/appliances/wolf-so30u-s.jpg",
          description: "30-inch Convection Steam Oven",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-so30tm-s-th",
          name: "Wolf SO30TM-S-TH",
          type: "transitional-oven",
          category: "appliances",
          brand: "wolf",
          model: "SO30TM-S-TH",
          width: 30,
          height: 18,
          depth: 22,
          price: "$7,920",
          image: "/images/appliances/wolf-so30tm-s-th.jpg",
          description: "30-inch Transitional M Series Oven",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    },
    {
      id: "microwaves",
      name: "Microwaves",
      icon: <ChefHat className="h-4 w-4" />,
      items: [
        {
          id: "wolf-mdd30tm-s-th",
          name: "Wolf MDD30TM-S-TH",
          type: "microwave",
          category: "appliances",
          brand: "wolf",
          model: "MDD30TM-S-TH",
          width: 30,
          height: 18,
          depth: 22,
          price: "$2,920",
          image: "/images/appliances/wolf-mdd30tm-s-th.jpg",
          description: "30-inch Transitional Microwave",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-md30te-s",
          name: "Wolf MD30TE-S",
          type: "microwave-drawer",
          category: "appliances",
          brand: "wolf",
          model: "MD30TE-S",
          width: 30,
          height: 16,
          depth: 23,
          price: "$2,420",
          image: "/images/appliances/wolf-md30te-s.jpg",
          description: "30-inch E Series Microwave Drawer",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-md24te-s",
          name: "Wolf MD24TE-S",
          type: "microwave-drawer",
          category: "appliances",
          brand: "wolf",
          model: "MD24TE-S",
          width: 24,
          height: 16,
          depth: 23,
          price: "$2,220",
          image: "/images/appliances/wolf-md24te-s.jpg",
          description: "24-inch E Series Microwave Drawer",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    },
    {
      id: "outdoor-grills",
      name: "Outdoor Grills",
      icon: <ChefHat className="h-4 w-4" />,
      items: [
        {
          id: "wolf-og54",
          name: "Wolf OG54",
          type: "outdoor-grill",
          category: "appliances",
          brand: "wolf",
          model: "OG54",
          width: 54,
          height: 27,
          depth: 31,
          price: "$11,920",
          image: "/images/appliances/wolf-og54.jpg",
          description: "54-inch Outdoor Grill",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-og42",
          name: "Wolf OG42",
          type: "outdoor-grill",
          category: "appliances",
          brand: "wolf",
          model: "OG42",
          width: 42,
          height: 27,
          depth: 31,
          price: "$9,920",
          image: "/images/appliances/wolf-og42.jpg",
          description: "42-inch Outdoor Grill",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-og36",
          name: "Wolf OG36",
          type: "outdoor-grill",
          category: "appliances",
          brand: "wolf",
          model: "OG36",
          width: 36,
          height: 27,
          depth: 31,
          price: "$8,920",
          image: "/images/appliances/wolf-og36.jpg",
          description: "36-inch Outdoor Grill",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-og30",
          name: "Wolf OG30",
          type: "outdoor-grill",
          category: "appliances",
          brand: "wolf",
          model: "OG30",
          width: 30,
          height: 27,
          depth: 31,
          price: "$7,920",
          image: "/images/appliances/wolf-og30.jpg",
          description: "30-inch Outdoor Grill",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    },
    {
      id: "wine-storage",
      name: "Wine Storage",
      icon: <ChefHat className="h-4 w-4" />,
      items: [
        {
          id: "wolf-iw-30",
          name: "Wolf IW-30",
          type: "wine-storage",
          category: "appliances",
          brand: "wolf",
          model: "IW-30",
          width: 30,
          height: 84,
          depth: 24,
          price: "$8,920",
          image: "/images/appliances/wolf-iw-30.jpg",
          description: "30-inch Wine Storage",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-iw-24",
          name: "Wolf IW-24",
          type: "wine-storage",
          category: "appliances",
          brand: "wolf",
          model: "IW-24",
          width: 24,
          height: 84,
          depth: 24,
          price: "$7,920",
          image: "/images/appliances/wolf-iw-24.jpg",
          description: "24-inch Wine Storage",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "wolf-iw-18",
          name: "Wolf IW-18",
          type: "wine-storage",
          category: "appliances",
          brand: "wolf",
          model: "IW-18",
          width: 18,
          height: 84,
          depth: 24,
          price: "$6,920",
          image: "/images/appliances/wolf-iw-18.jpg",
          description: "18-inch Wine Storage",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    },
    {
      id: "panel-ready",
      name: "Panel Ready",
      icon: <Refrigerator className="h-4 w-4" />,
      items: [
        // Column Refrigerators
        {
          id: "subzero-pwc542418",
          name: "Sub-Zero PWC542418",
          type: "panel-ready-column",
          category: "appliances",
          brand: "subzero",
          model: "PWC542418",
          width: 54,
          height: 84,
          depth: 24,
          price: "$11,845",
          image: "/images/appliances/subzero-pwc542418.jpg",
          description: "54-inch Panel Ready Column Refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "subzero-pwc482418",
          name: "Sub-Zero PWC482418",
          type: "panel-ready-column",
          category: "appliances",
          brand: "subzero",
          model: "PWC482418",
          width: 48,
          height: 84,
          depth: 24,
          price: "$11,420",
          image: "/images/appliances/subzero-pwc482418.jpg",
          description: "48-inch Panel Ready Column Refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        // Full Size Panel Ready
        {
          id: "subzero-pw662718",
          name: "Sub-Zero PW662718",
          type: "panel-ready-full",
          category: "appliances",
          brand: "subzero",
          model: "PW662718",
          width: 66,
          height: 84,
          depth: 27,
          price: "$16,920",
          image: "/images/appliances/subzero-pw662718.jpg",
          description: "66-inch Panel Ready Refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "subzero-pw602718",
          name: "Sub-Zero PW602718",
          type: "panel-ready-full",
          category: "appliances",
          brand: "subzero",
          model: "PW602718",
          width: 60,
          height: 84,
          depth: 27,
          price: "$15,920",
          image: "/images/appliances/subzero-pw602718.jpg",
          description: "60-inch Panel Ready Refrigerator",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    },
    {
      id: "panel-ready-columns",
      name: "Panel Ready Columns",
      icon: <Refrigerator className="h-4 w-4" />,
      items: [
        {
          id: "subzero-pl582212",
          name: "Sub-Zero PL582212",
          type: "panel-ready-column",
          category: "appliances",
          brand: "subzero",
          model: "PL582212",
          width: 58,
          height: 84,
          depth: 24,
          price: "$12,920",
          image: "/images/appliances/subzero-pl582212.jpg",
          description: "58-inch Panel Ready Column",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "subzero-pl522212",
          name: "Sub-Zero PL522212",
          type: "panel-ready-column",
          category: "appliances",
          brand: "subzero",
          model: "PL522212",
          width: 52,
          height: 84,
          depth: 24,
          price: "$11,920",
          image: "/images/appliances/subzero-pl522212.jpg",
          description: "52-inch Panel Ready Column",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "subzero-pi663418",
          name: "Sub-Zero PI663418",
          type: "panel-ready-column-ice",
          category: "appliances",
          brand: "subzero",
          model: "PI663418",
          width: 66,
          height: 84,
          depth: 24,
          price: "$13,920",
          image: "/images/appliances/subzero-pi663418.jpg",
          description: "66-inch Panel Ready Column with Ice",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        },
        {
          id: "subzero-pi543418",
          name: "Sub-Zero PI543418",
          type: "panel-ready-column-ice",
          category: "appliances",
          brand: "subzero",
          model: "PI543418",
          width: 54,
          height: 84,
          depth: 24,
          price: "$12,920",
          image: "/images/appliances/subzero-pi543418.jpg",
          description: "54-inch Panel Ready Column with Ice",
          materialPreset: {
            category: "appliances",
            materialId: "stainlessSteel",
            settings: {
              normalScale: 0.45,
              roughness: 0.2,
              metalness: 0.95,
              displacementScale: 0.01,
              textureScale: { x: 2, y: 2 }
            }
          }
        }
      ]
    }
  ];

  const selectedCategory = categories.find(c => c.id === activeCategory);

  const handleItemSelect = (item: RoomLayout | CatalogItem) => {
    console.log('CatalogDialog - Item Selected:', item);
    if (catalogType === "room") {
      const roomItem = item as RoomLayout;
      // Apply scale to room dimensions
      const scaledItem: RoomLayout = {
        ...roomItem,
        width: roomItem.width * scale,
        height: roomItem.height * scale,
        points: roomItem.points.map(p => ({
          x: p.x * scale,
          y: p.y * scale
        })),
        wallSegments: roomItem.wallSegments.map(w => ({
          ...w,
          start: { x: w.start.x * scale, y: w.start.y * scale },
          end: { x: w.end.x * scale, y: w.end.y * scale }
        })),
        corners: roomItem.corners.map(c => ({
          ...c,
          x: c.x * scale,
          y: c.y * scale,
          wallSegments: c.wallSegments.map(w => ({
            ...w,
            start: { x: w.start.x * scale, y: w.start.y * scale },
            end: { x: w.end.x * scale, y: w.end.y * scale }
          }))
        }))
      };
      console.log('CatalogDialog - Scaled Room Item:', scaledItem);
      onItemSelect(scaledItem);
    } else {
      onItemSelect(item);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {catalogType === "room" ? "Room Layouts" : "Appliance Catalog"}
          </DialogTitle>
          <DialogDescription>
            {catalogType === "room" 
              ? "Choose from empty layouts or pre-built room designs for your space."
              : "Browse and select from our collection of high-end appliances for your kitchen design."
            }
          </DialogDescription>
        </DialogHeader>
        {catalogType === "room" && (
          <div className="flex items-center gap-4 px-4 py-2 border-b">
            <label htmlFor="sqft" className="text-sm font-medium">
              Scale: {scale.toFixed(2)}x
            </label>
            <input
              type="range"
              id="sqft"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              className="w-48"
              onChange={(e) => setScale(parseFloat(e.target.value))}
            />
          </div>
        )}
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
          <div className="grid grid-cols-2 gap-4 p-4">
            {selectedCategory?.items.map((item) => {
              const isRoom = catalogType === "room";
              const roomItem = isRoom ? item as RoomLayout : null;
              const catalogItem = !isRoom ? item as CatalogItem : null;

              return (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-2">
                    {isRoom ? (
                      <svg
                        viewBox="0 0 500 300"
                        className="w-full h-full"
                      >
                        <path
                          d={`M ${roomItem!.points.map(p => `${p.x} ${p.y}`).join(" L ")} Z`}
                          fill="none"
                          stroke="black"
                          strokeWidth="2"
                        />
                      </svg>
                    ) : (
                      <img
                        src={catalogItem!.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <h3 className="font-medium">{item.name}</h3>
                  {isRoom ? (
                    <>
                      <p className="text-sm text-gray-500">
                        {Math.round(roomItem!.sqft * scale * scale)} sq ft
                      </p>
                      <p className="text-xs text-gray-400">{roomItem!.description}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">Depth: {catalogItem!.depth}in</p>
                      <p className="text-xs text-gray-400">${catalogItem!.price}</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogDialog;

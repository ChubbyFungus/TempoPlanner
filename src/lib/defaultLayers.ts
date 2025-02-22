import { Layer } from "@/types/shared";

export const defaultLayers: Layer[] = [
  {
    id: "layer-0",
    name: "Canvas",
    visible: true,
    allowedTools: [],
    elements: [],
    locked: true,
  },
  {
    id: "layer-1",
    name: "Floor & Surfaces",
    visible: true,
    allowedTools: ["select", "draw-room", "draw-surface"],
    elements: [],
    locked: true,
  },
  {
    id: "layer-2",
    name: "Walls & Base",
    visible: true,
    allowedTools: ["select", "draw-wall", "base-cabinet", "island"],
    elements: [],
    locked: true,
  },
  {
    id: "layer-3",
    name: "Countertops",
    visible: true,
    allowedTools: ["select", "countertop"],
    elements: [],
    locked: true,
  },
  {
    id: "layer-4",
    name: "Upper & Lighting",
    visible: true,
    allowedTools: ["select", "upper-cabinet", "lighting"],
    elements: [],
    locked: true,
  },
  {
    id: "layer-5",
    name: "Appliances",
    visible: true,
    allowedTools: ["select", "add-appliance"],
    elements: [],
    locked: false,
  }
]; 
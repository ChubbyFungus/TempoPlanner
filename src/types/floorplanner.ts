export interface Point {
  x: number;
  y: number;
}

export interface Element {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  points?: Point[];
  thickness?: number;
  color?: string;
}

export interface ToolbarItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  width?: number;
  height?: number;
}

export interface CatalogItem extends ToolbarItem {
  brand: string;
  model: string;
  image: string;
  depth: number;
  description: string;
  price?: string;
}

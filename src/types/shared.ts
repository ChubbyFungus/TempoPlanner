import { MaterialCategory, MaterialId } from './materials';
import { ReactNode } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface WallSegment {
  start: Point;
  end: Point;
  thickness: number;
}

export interface Corner {
  x: number;
  y: number;
  wallSegments: WallSegment[];
}

export interface MaterialPreset {
  category: string;
  materialId: string;
  settings?: {
    normalScale?: number;
    roughness?: number;
    metalness?: number;
    displacementScale?: number;
    textureScale?: {
      x: number;
      y: number;
    };
  };
}

export interface OverlayPreset {
  type: string;
  angle: number;
  opacity: number;
  scale: number;
  strength: number;
}

export interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth?: number;
  rotation: number;
  locked: boolean;
  points?: Point[];
  thickness?: number;
  color?: string;
  materialPreset?: MaterialPreset;
  overlayPreset?: OverlayPreset;
  wallSegments?: WallSegment[];
  corners?: Corner[];
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  allowedTools: string[];
  elements: CanvasElement[];
  locked: boolean;
}

export interface ToolbarItem {
  id: string;
  name: string;
  type: string;
  icon?: ReactNode;
  category: string;
  width?: number;
  height?: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  type: string;
  category: string;
  brand: string;
  model: string;
  width: number;
  height: number;
  depth: number;
  price: string;
  image: string;
  description: string;
  materialPreset: MaterialPreset;
  overlayPreset?: OverlayPreset;
}

export interface RoomLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  points: Point[];
  wallSegments: WallSegment[];
  corners: Corner[];
  sqft: number;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: JSX.Element;
  items: RoomLayout[] | CatalogItem[];
} 
import { MaterialCategory, MaterialId } from './materials';
import { ReactNode } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface MaterialPreset {
  category: MaterialCategory;
  materialId: MaterialId;
  settings: {
    normalScale: number;
    roughness: number;
    metalness: number;
    displacementScale: number;
    textureScale: {
      x: number;
      y: number;
    };
  };
}

export interface OverlayPreset {
  type: "brushed" | "matte" | "gloss" | "textured";
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

export interface CatalogItem extends ToolbarItem {
  brand: string;
  model: string;
  image: string;
  width: number;
  height: number;
  depth: number;
  description: string;
  price: string;
  materialPreset: {
    category: MaterialCategory;
    materialId: MaterialId;
    settings: {
      normalScale: number;
      roughness: number;
      metalness: number;
      displacementScale: number;
      textureScale: {
        x: number;
        y: number;
      };
    };
  };
  overlayPreset: {
    type: 'brushed' | 'matte' | 'gloss' | 'textured';
    angle: number;
    opacity: number;
    scale: number;
    strength: number;
  };
} 
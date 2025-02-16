import { Vector2 } from 'three';

// Material Categories
export type MaterialCategory = 
  | 'appliances'
  | 'countertops'
  | 'flooring'
  | 'walls';

// Material IDs
export type MaterialId = 
  | 'stainlessSteel'
  | 'blackSteel'
  | 'glass'
  | 'brushedSteel'
  | 'granite'
  | 'marble'
  | 'quartz'
  | 'hardwood'
  | 'tile'
  | 'concrete'
  | 'paint'
  | 'stone';

// Material Settings Interface
export interface MaterialSettings {
  normalScale: number;
  roughness: number;
  metalness: number;
  displacementScale: number;
  textureScale: Vector2;
}

// PBR Material Interface
export interface PBRMaterial {
  category: MaterialCategory;
  materialId: MaterialId;
  settings: MaterialSettings;
}

// Material Textures Interface
export interface MaterialTextures {
  baseColorMap?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  displacementMap?: string;
}

// Material IDs constant
export const MATERIAL_IDS = [
  'stainlessSteel',
  'blackSteel',
  'glass',
  'brushedSteel',
  'granite',
  'marble',
  'quartz',
  'hardwood',
  'tile',
  'concrete',
  'paint',
  'stone'
] as const;

export interface MaterialDefinition {
  id: string;
  name: string;
  baseColor?: string;
  textureUrl?: string;
  normalMapUrl?: string;
  roughness: number;
  metalness: number;
  opacity?: number;
  reflectivity?: number;
}

export interface MaterialOverlay {
  gradientColors: string[];
  gradientStops: number[];
  blendMode: 'overlay' | 'multiply' | 'screen' | 'soft-light' | 'hard-light';
  opacity: number;
  angle?: number;
}

// Predefined materials library
export const MATERIAL_PRESETS: Record<string, MaterialDefinition> = {
  // Sub-Zero Materials
  subZeroStainless: {
    id: 'subZeroStainless',
    name: 'Sub-Zero Classic Stainless',
    baseColor: '#D8D8D8',
    roughness: 0.3,
    metalness: 0.9,
    reflectivity: 0.8,
  },
  subZeroBlack: {
    id: 'subZeroBlack',
    name: 'Sub-Zero Obsidian',
    baseColor: '#1A1A1A',
    roughness: 0.7,
    metalness: 0.3,
    reflectivity: 0.2,
  },

  // Thermador Materials
  thermadorProfessional: {
    id: 'thermadorProfessional',
    name: 'Thermador Professional',
    baseColor: '#E8E8E8',
    roughness: 0.4,
    metalness: 0.8,
    reflectivity: 0.7,
  },
  thermadorMasterpiece: {
    id: 'thermadorMasterpiece',
    name: 'Thermador Masterpiece',
    baseColor: '#E5E5E5',
    roughness: 0.35,
    metalness: 0.9,
    reflectivity: 0.85,
  },

  // Liebherr Materials
  liebherrMonolith: {
    id: 'liebherrMonolith',
    name: 'Liebherr Monolith',
    baseColor: '#F5F5F5',
    roughness: 0.25,
    metalness: 0.95,
    reflectivity: 0.9,
  },
  liebherrBlueGlass: {
    id: 'liebherrBlueGlass',
    name: 'Liebherr Blue Glass',
    baseColor: '#B8D8F0',
    roughness: 0.1,
    metalness: 0.2,
    opacity: 0.85,
    reflectivity: 0.9,
  }
};

// Predefined material overlays
export const MATERIAL_OVERLAYS: Record<string, MaterialOverlay> = {
  // Professional Grade Finishes
  professionalBrushed: {
    gradientColors: [
      'rgba(255,255,255,0.4)',
      'rgba(180,180,180,0.1)',
      'rgba(255,255,255,0.4)'
    ],
    gradientStops: [0, 0.5, 1],
    blendMode: 'overlay',
    opacity: 1,
    angle: 45
  },
  verticalBrushed: {
    gradientColors: [
      'rgba(255,255,255,0.3)',
      'rgba(200,200,200,0.1)',
      'rgba(255,255,255,0.3)'
    ],
    gradientStops: [0, 0.5, 1],
    blendMode: 'overlay',
    opacity: 1,
    angle: 90
  },
  circularBrushed: {
    gradientColors: [
      'rgba(255,255,255,0.25)',
      'rgba(255,255,255,0.4)',
      'rgba(255,255,255,0.25)',
      'rgba(255,255,255,0.4)'
    ],
    gradientStops: [0, 0.25, 0.5, 1],
    blendMode: 'soft-light',
    opacity: 0.7,
    angle: 30
  },

  // Glass and Premium Finishes
  glassReflective: {
    gradientColors: [
      'rgba(255,255,255,0.8)',
      'rgba(255,255,255,0.2)',
      'rgba(255,255,255,0.6)'
    ],
    gradientStops: [0, 0.5, 1],
    blendMode: 'screen',
    opacity: 0.9,
    angle: 135
  },
  obsidianMatte: {
    gradientColors: [
      'rgba(0,0,0,0.3)',
      'rgba(40,40,40,0.1)',
      'rgba(0,0,0,0.3)'
    ],
    gradientStops: [0, 0.5, 1],
    blendMode: 'multiply',
    opacity: 1,
    angle: 0
  },
  diamondPatterned: {
    gradientColors: [
      'rgba(255,255,255,0.3)',
      'rgba(255,255,255,0.15)',
      'rgba(255,255,255,0.3)',
      'rgba(255,255,255,0.15)'
    ],
    gradientStops: [0, 0.3, 0.6, 1],
    blendMode: 'overlay',
    opacity: 0.7,
    angle: 45
  }
}; 
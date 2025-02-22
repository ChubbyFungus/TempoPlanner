import { THREE } from '@/lib/three';
const { Color } = THREE;

export interface MaterialDefinition {
  name: string;
  baseColor: string | number;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  anisotropy?: number;
  ior?: number;
  reflectivity?: number;
  transmission?: number;
  transparent?: boolean;
  side?: number;
}

export interface MaterialOverlay {
  name: string;
  type: 'brushed' | 'matte' | 'gloss' | 'textured';
  angle?: number;
  opacity?: number;
  scale?: number;
  strength?: number;
}

// Material presets for different surfaces
export const MATERIAL_PRESETS: Record<string, MaterialDefinition> = {
  // Appliance Materials
  subZeroStainless: {
    name: 'Sub-Zero Stainless Steel',
    baseColor: '#EFEFEF',
    metalness: 0.9,
    roughness: 0.3,
    clearcoat: 0.5,
    anisotropy: 1.0,
    ior: 2.0,
    reflectivity: 0.8,
  },
  thermadorProfessional: {
    name: 'Thermador Professional',
    baseColor: '#E8E8E8',
    metalness: 0.85,
    roughness: 0.4,
    clearcoat: 0.3,
    anisotropy: 0.8,
  },
  liebherrMonolith: {
    name: 'Liebherr Monolith',
    baseColor: '#F5F5F5',
    metalness: 0.95,
    roughness: 0.2,
    clearcoat: 0.8,
  },
  // Wall Materials
  drywall: {
    name: 'Drywall',
    baseColor: '#FFFFFF',
    metalness: 0.0,
    roughness: 0.9,
  },
  tile: {
    name: 'Ceramic Tile',
    baseColor: '#F0F0F0',
    metalness: 0.1,
    roughness: 0.4,
    clearcoat: 0.5,
  },
  // Floor Materials
  hardwood: {
    name: 'Hardwood',
    baseColor: '#8B4513',
    metalness: 0.0,
    roughness: 0.7,
    clearcoat: 0.3,
  },
  marble: {
    name: 'Marble',
    baseColor: '#F5F5F5',
    metalness: 0.1,
    roughness: 0.3,
    clearcoat: 0.8,
  },
  // Counter Materials
  granite: {
    name: 'Granite',
    baseColor: '#2F4F4F',
    metalness: 0.2,
    roughness: 0.4,
    clearcoat: 0.6,
  },
  quartz: {
    name: 'Quartz',
    baseColor: '#E0E0E0',
    metalness: 0.15,
    roughness: 0.3,
    clearcoat: 0.7,
  },
};

// Material overlay presets
export const MATERIAL_OVERLAYS: Record<string, MaterialOverlay> = {
  professionalBrushed: {
    name: 'Professional Brushed',
    type: 'brushed',
    angle: 0,
    opacity: 0.7,
    scale: 20,
    strength: 0.8,
  },
  verticalBrushed: {
    name: 'Vertical Brushed',
    type: 'brushed',
    angle: 90,
    opacity: 0.6,
    scale: 15,
    strength: 0.7,
  },
  circularBrushed: {
    name: 'Circular Brushed',
    type: 'brushed',
    angle: 45,
    opacity: 0.5,
    scale: 25,
    strength: 0.6,
  },
  obsidianMatte: {
    name: 'Obsidian Matte',
    type: 'matte',
    opacity: 0.9,
    strength: 0.9,
  },
  glassReflective: {
    name: 'Glass Reflective',
    type: 'gloss',
    opacity: 0.3,
    strength: 0.95,
  },
  marbleTextured: {
    name: 'Marble Textured',
    type: 'textured',
    opacity: 0.8,
    scale: 30,
    strength: 0.7,
  },
  woodGrain: {
    name: 'Wood Grain',
    type: 'textured',
    angle: 0,
    opacity: 0.85,
    scale: 40,
    strength: 0.8,
  },
}; 
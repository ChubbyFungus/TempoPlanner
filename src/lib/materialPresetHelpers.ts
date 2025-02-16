import { MaterialCategory, MaterialId } from '@/types/materials';

interface MaterialPreset {
  category: MaterialCategory;
  materialId: MaterialId;
  settings: {
    normalScale: number;
    roughness: number;
    metalness: number;
    displacementScale: number;
  };
}

interface OverlayPreset {
  type: 'brushed' | 'matte' | 'gloss' | 'textured';
  angle: number;
  opacity: number;
  scale: number;
  strength: number;
}

export function createAppliancePreset(
  brand: string,
  finish: 'stainless' | 'black' | 'glass' | 'brushed' = 'stainless'
): { materialPreset: MaterialPreset; overlayPreset: OverlayPreset } {
  const presets = {
    'Sub-Zero': {
      stainless: {
        materialPreset: {
          category: 'appliances' as MaterialCategory,
          materialId: 'stainlessSteel' as MaterialId,
          settings: {
            normalScale: 0.6,
            roughness: 0.25,
            metalness: 0.95,
            displacementScale: 0.015
          }
        },
        overlayPreset: {
          type: 'brushed' as const,
          angle: 45,
          opacity: 0.7,
          scale: 20,
          strength: 0.8
        }
      },
      black: {
        materialPreset: {
          category: 'appliances' as MaterialCategory,
          materialId: 'blackSteel' as MaterialId,
          settings: {
            normalScale: 0.4,
            roughness: 0.2,
            metalness: 0.9,
            displacementScale: 0.01
          }
        },
        overlayPreset: {
          type: 'matte' as const,
          angle: 0,
          opacity: 0.9,
          scale: 1,
          strength: 0.9
        }
      }
    },
    'Thermador': {
      stainless: {
        materialPreset: {
          category: 'appliances' as MaterialCategory,
          materialId: 'brushedSteel' as MaterialId,
          settings: {
            normalScale: 0.7,
            roughness: 0.35,
            metalness: 0.9,
            displacementScale: 0.02
          }
        },
        overlayPreset: {
          type: 'brushed' as const,
          angle: 90,
          opacity: 0.6,
          scale: 15,
          strength: 0.7
        }
      }
    },
    'Liebherr': {
      stainless: {
        materialPreset: {
          category: 'appliances' as MaterialCategory,
          materialId: 'stainlessSteel' as MaterialId,
          settings: {
            normalScale: 0.45,
            roughness: 0.2,
            metalness: 0.95,
            displacementScale: 0.01
          }
        },
        overlayPreset: {
          type: 'brushed' as const,
          angle: 30,
          opacity: 0.7,
          scale: 25,
          strength: 0.6
        }
      }
    },
    'Miele': {
      stainless: {
        materialPreset: {
          category: 'appliances' as MaterialCategory,
          materialId: 'stainlessSteel' as MaterialId,
          settings: {
            normalScale: 0.5,
            roughness: 0.2,
            metalness: 0.95,
            displacementScale: 0.01
          }
        },
        overlayPreset: {
          type: 'brushed' as const,
          angle: 45,
          opacity: 0.8,
          scale: 18,
          strength: 0.75
        }
      }
    },
    'Viking': {
      stainless: {
        materialPreset: {
          category: 'appliances' as MaterialCategory,
          materialId: 'stainlessSteel' as MaterialId,
          settings: {
            normalScale: 0.65,
            roughness: 0.3,
            metalness: 0.92,
            displacementScale: 0.018
          }
        },
        overlayPreset: {
          type: 'brushed' as const,
          angle: 60,
          opacity: 0.75,
          scale: 22,
          strength: 0.85
        }
      }
    }
  };

  const brandPresets = presets[brand] || presets['Sub-Zero'];
  const finishPresets = brandPresets[finish] || brandPresets['stainless'];

  return finishPresets;
} 
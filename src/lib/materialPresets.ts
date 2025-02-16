import { Vector2 } from 'three';

// Material preset definitions
export const MATERIAL_PRESETS = {
  // Appliance Materials - Sub-Zero
  'sub-zero-refrigerator-classic': {
    category: 'appliances',
    materialId: 'stainlessSteel',
    settings: {
      normalScale: 0.6,
      roughness: 0.25,
      metalness: 0.95,
      displacementScale: 0.015,
      textureScale: new Vector2(2, 2)
    }
  },
  'sub-zero-refrigerator-black': {
    category: 'appliances',
    materialId: 'blackSteel',
    settings: {
      normalScale: 0.4,
      roughness: 0.2,
      metalness: 0.9,
      displacementScale: 0.01,
      textureScale: new Vector2(2, 2)
    }
  },
  'sub-zero-refrigerator-glass': {
    category: 'appliances',
    materialId: 'glass',
    settings: {
      normalScale: 0.2,
      roughness: 0.05,
      metalness: 0.95,
      displacementScale: 0.005,
      textureScale: new Vector2(1, 1)
    }
  },

  // Appliance Materials - Thermador
  'thermador-refrigerator-professional': {
    category: 'appliances',
    materialId: 'brushedSteel',
    settings: {
      normalScale: 0.7,
      roughness: 0.35,
      metalness: 0.9,
      displacementScale: 0.02,
      textureScale: new Vector2(2, 2)
    }
  },
  'thermador-refrigerator-masterpiece': {
    category: 'appliances',
    materialId: 'stainlessSteel',
    settings: {
      normalScale: 0.5,
      roughness: 0.3,
      metalness: 0.95,
      displacementScale: 0.015,
      textureScale: new Vector2(2, 2)
    }
  },

  // Appliance Materials - Liebherr
  'liebherr-refrigerator-monolith': {
    category: 'appliances',
    materialId: 'stainlessSteel',
    settings: {
      normalScale: 0.45,
      roughness: 0.2,
      metalness: 0.95,
      displacementScale: 0.01,
      textureScale: new Vector2(2, 2)
    }
  },
  'liebherr-refrigerator-blueglass': {
    category: 'appliances',
    materialId: 'glass',
    settings: {
      normalScale: 0.2,
      roughness: 0.1,
      metalness: 0.9,
      displacementScale: 0.005,
      textureScale: new Vector2(1, 1)
    }
  },

  // Appliance Materials - Viking
  'viking-refrigerator-professional': {
    category: 'appliances',
    materialId: 'stainlessSteel',
    settings: {
      normalScale: 0.65,
      roughness: 0.3,
      metalness: 0.92,
      displacementScale: 0.018,
      textureScale: new Vector2(2, 2)
    }
  },
  'viking-refrigerator-tuscany': {
    category: 'appliances',
    materialId: 'brushedSteel',
    settings: {
      normalScale: 0.55,
      roughness: 0.35,
      metalness: 0.88,
      displacementScale: 0.015,
      textureScale: new Vector2(2, 2)
    }
  },
  'viking-refrigerator-graphite': {
    category: 'appliances',
    materialId: 'blackSteel',
    settings: {
      normalScale: 0.45,
      roughness: 0.25,
      metalness: 0.85,
      displacementScale: 0.012,
      textureScale: new Vector2(2, 2)
    }
  },

  // Appliance Materials - Miele
  'miele-refrigerator-mastercool': {
    category: 'appliances',
    materialId: 'stainlessSteel',
    settings: {
      normalScale: 0.5,
      roughness: 0.2,
      metalness: 0.95,
      displacementScale: 0.01,
      textureScale: new Vector2(2, 2)
    }
  },
  'miele-refrigerator-artline': {
    category: 'appliances',
    materialId: 'glass',
    settings: {
      normalScale: 0.15,
      roughness: 0.08,
      metalness: 0.92,
      displacementScale: 0.005,
      textureScale: new Vector2(1, 1)
    }
  },
  'miele-refrigerator-blackedition': {
    category: 'appliances',
    materialId: 'blackSteel',
    settings: {
      normalScale: 0.35,
      roughness: 0.15,
      metalness: 0.9,
      displacementScale: 0.008,
      textureScale: new Vector2(2, 2)
    }
  },

  // Appliance Materials - Wolf
  'wolf-refrigerator-professional': {
    category: 'appliances',
    materialId: 'stainlessSteel',
    settings: {
      normalScale: 0.58,
      roughness: 0.28,
      metalness: 0.93,
      displacementScale: 0.014,
      textureScale: new Vector2(2, 2)
    }
  },
  'wolf-refrigerator-contemporary': {
    category: 'appliances',
    materialId: 'glass',
    settings: {
      normalScale: 0.18,
      roughness: 0.07,
      metalness: 0.94,
      displacementScale: 0.004,
      textureScale: new Vector2(1, 1)
    }
  },

  // Surface Materials - Countertops
  'countertop-granite-dark': {
    category: 'countertops',
    materialId: 'granite',
    settings: {
      normalScale: 1.2,
      roughness: 0.65,
      metalness: 0.05,
      displacementScale: 0.08,
      textureScale: new Vector2(4, 4)
    }
  },
  'countertop-marble-white': {
    category: 'countertops',
    materialId: 'marble',
    settings: {
      normalScale: 1.0,
      roughness: 0.4,
      metalness: 0.1,
      displacementScale: 0.06,
      textureScale: new Vector2(4, 4)
    }
  },
  'countertop-quartz': {
    category: 'countertops',
    materialId: 'quartz',
    settings: {
      normalScale: 0.8,
      roughness: 0.3,
      metalness: 0.15,
      displacementScale: 0.04,
      textureScale: new Vector2(4, 4)
    }
  },

  // Surface Materials - Islands
  'island-marble-waterfall': {
    category: 'countertops',
    materialId: 'marble',
    settings: {
      normalScale: 1.1,
      roughness: 0.35,
      metalness: 0.12,
      displacementScale: 0.07,
      textureScale: new Vector2(6, 6)
    }
  },
  'island-quartz-modern': {
    category: 'countertops',
    materialId: 'quartz',
    settings: {
      normalScale: 0.9,
      roughness: 0.25,
      metalness: 0.18,
      displacementScale: 0.05,
      textureScale: new Vector2(6, 6)
    }
  },

  // Floor Materials
  'floor-hardwood-oak': {
    category: 'flooring',
    materialId: 'hardwood',
    settings: {
      normalScale: 0.9,
      roughness: 0.75,
      metalness: 0.0,
      displacementScale: 0.04,
      textureScale: new Vector2(8, 8)
    }
  },
  'floor-tile-porcelain': {
    category: 'flooring',
    materialId: 'tile',
    settings: {
      normalScale: 0.7,
      roughness: 0.6,
      metalness: 0.1,
      displacementScale: 0.03,
      textureScale: new Vector2(6, 6)
    }
  },
  'floor-concrete-polished': {
    category: 'flooring',
    materialId: 'concrete',
    settings: {
      normalScale: 0.5,
      roughness: 0.4,
      metalness: 0.1,
      displacementScale: 0.02,
      textureScale: new Vector2(10, 10)
    }
  },

  // Wall Materials
  'wall-paint-matte': {
    category: 'walls',
    materialId: 'paint',
    settings: {
      normalScale: 0.2,
      roughness: 0.95,
      metalness: 0.0,
      displacementScale: 0.005,
      textureScale: new Vector2(4, 4)
    }
  },
  'wall-paint-eggshell': {
    category: 'walls',
    materialId: 'paint',
    settings: {
      normalScale: 0.25,
      roughness: 0.85,
      metalness: 0.05,
      displacementScale: 0.008,
      textureScale: new Vector2(4, 4)
    }
  },
  'backsplash-tile-ceramic': {
    category: 'walls',
    materialId: 'tile',
    settings: {
      normalScale: 0.8,
      roughness: 0.5,
      metalness: 0.15,
      displacementScale: 0.04,
      textureScale: new Vector2(8, 8)
    }
  },
  'backsplash-tile-glass': {
    category: 'walls',
    materialId: 'tile',
    settings: {
      normalScale: 0.6,
      roughness: 0.2,
      metalness: 0.3,
      displacementScale: 0.03,
      textureScale: new Vector2(8, 8)
    }
  },

  // Additional Surface Materials - Premium Countertops
  'countertop-quartzite': {
    category: 'countertops',
    materialId: 'quartz',
    settings: {
      normalScale: 1.1,
      roughness: 0.35,
      metalness: 0.12,
      displacementScale: 0.06,
      textureScale: new Vector2(4, 4)
    }
  },
  'countertop-soapstone': {
    category: 'countertops',
    materialId: 'stone',
    settings: {
      normalScale: 0.9,
      roughness: 0.8,
      metalness: 0.05,
      displacementScale: 0.04,
      textureScale: new Vector2(4, 4)
    }
  },
  'countertop-butcherblock': {
    category: 'countertops',
    materialId: 'hardwood',
    settings: {
      normalScale: 0.85,
      roughness: 0.7,
      metalness: 0.0,
      displacementScale: 0.035,
      textureScale: new Vector2(3, 3)
    }
  },

  // Additional Surface Materials - Specialty Backsplash
  'backsplash-marble-slab': {
    category: 'walls',
    materialId: 'marble',
    settings: {
      normalScale: 0.9,
      roughness: 0.3,
      metalness: 0.15,
      displacementScale: 0.05,
      textureScale: new Vector2(6, 6)
    }
  },
  'backsplash-metallic-mosaic': {
    category: 'walls',
    materialId: 'brushedSteel',
    settings: {
      normalScale: 0.7,
      roughness: 0.4,
      metalness: 0.8,
      displacementScale: 0.03,
      textureScale: new Vector2(10, 10)
    }
  },
  'backsplash-mirror': {
    category: 'walls',
    materialId: 'glass',
    settings: {
      normalScale: 0.1,
      roughness: 0.05,
      metalness: 0.95,
      displacementScale: 0.002,
      textureScale: new Vector2(1, 1)
    }
  },

  // Additional Floor Materials - Premium Options
  'floor-marble-large': {
    category: 'flooring',
    materialId: 'marble',
    settings: {
      normalScale: 0.8,
      roughness: 0.4,
      metalness: 0.1,
      displacementScale: 0.04,
      textureScale: new Vector2(12, 12)
    }
  },
  'floor-herringbone-wood': {
    category: 'flooring',
    materialId: 'hardwood',
    settings: {
      normalScale: 0.85,
      roughness: 0.7,
      metalness: 0.0,
      displacementScale: 0.035,
      textureScale: new Vector2(6, 6)
    }
  },
  'floor-terrazzo': {
    category: 'flooring',
    materialId: 'concrete',
    settings: {
      normalScale: 0.6,
      roughness: 0.5,
      metalness: 0.15,
      displacementScale: 0.025,
      textureScale: new Vector2(8, 8)
    }
  }
} as const;

// Updated helper function to handle new brands and materials
export function getMaterialPreset(elementType: string) {
  // Handle appliance variants
  if (elementType.includes('refrigerator')) {
    if (elementType.includes('sub-zero')) {
      if (elementType.includes('black')) {
        return MATERIAL_PRESETS['sub-zero-refrigerator-black'];
      } else if (elementType.includes('glass')) {
        return MATERIAL_PRESETS['sub-zero-refrigerator-glass'];
      }
      return MATERIAL_PRESETS['sub-zero-refrigerator-classic'];
    } else if (elementType.includes('thermador')) {
      if (elementType.includes('masterpiece')) {
        return MATERIAL_PRESETS['thermador-refrigerator-masterpiece'];
      }
      return MATERIAL_PRESETS['thermador-refrigerator-professional'];
    } else if (elementType.includes('liebherr')) {
      if (elementType.includes('blueglass')) {
        return MATERIAL_PRESETS['liebherr-refrigerator-blueglass'];
      }
      return MATERIAL_PRESETS['liebherr-refrigerator-monolith'];
    } else if (elementType.includes('viking')) {
      if (elementType.includes('tuscany')) {
        return MATERIAL_PRESETS['viking-refrigerator-tuscany'];
      } else if (elementType.includes('graphite')) {
        return MATERIAL_PRESETS['viking-refrigerator-graphite'];
      }
      return MATERIAL_PRESETS['viking-refrigerator-professional'];
    } else if (elementType.includes('miele')) {
      if (elementType.includes('artline')) {
        return MATERIAL_PRESETS['miele-refrigerator-artline'];
      } else if (elementType.includes('blackedition')) {
        return MATERIAL_PRESETS['miele-refrigerator-blackedition'];
      }
      return MATERIAL_PRESETS['miele-refrigerator-mastercool'];
    } else if (elementType.includes('wolf')) {
      if (elementType.includes('contemporary')) {
        return MATERIAL_PRESETS['wolf-refrigerator-contemporary'];
      }
      return MATERIAL_PRESETS['wolf-refrigerator-professional'];
    }
  }

  // Handle surfaces
  if (elementType === 'surface') {
    return MATERIAL_PRESETS['countertop-granite-dark'];
  }

  if (elementType === 'island') {
    return MATERIAL_PRESETS['island-marble-waterfall'];
  }

  // Handle floors
  if (elementType === 'floor') {
    return MATERIAL_PRESETS['floor-hardwood-oak'];
  }

  // Handle walls and backsplash
  if (elementType === 'wall') {
    return MATERIAL_PRESETS['wall-paint-eggshell'];
  }

  if (elementType === 'backsplash') {
    return MATERIAL_PRESETS['backsplash-tile-ceramic'];
  }

  // Handle specialized surfaces
  if (elementType.includes('countertop')) {
    if (elementType.includes('quartzite')) {
      return MATERIAL_PRESETS['countertop-quartzite'];
    } else if (elementType.includes('soapstone')) {
      return MATERIAL_PRESETS['countertop-soapstone'];
    } else if (elementType.includes('butcherblock')) {
      return MATERIAL_PRESETS['countertop-butcherblock'];
    }
  }

  if (elementType.includes('backsplash')) {
    if (elementType.includes('marble-slab')) {
      return MATERIAL_PRESETS['backsplash-marble-slab'];
    } else if (elementType.includes('metallic')) {
      return MATERIAL_PRESETS['backsplash-metallic-mosaic'];
    } else if (elementType.includes('mirror')) {
      return MATERIAL_PRESETS['backsplash-mirror'];
    }
  }

  if (elementType.includes('floor')) {
    if (elementType.includes('marble')) {
      return MATERIAL_PRESETS['floor-marble-large'];
    } else if (elementType.includes('herringbone')) {
      return MATERIAL_PRESETS['floor-herringbone-wood'];
    } else if (elementType.includes('terrazzo')) {
      return MATERIAL_PRESETS['floor-terrazzo'];
    }
  }

  // Default to wall material if no match
  return MATERIAL_PRESETS['wall-paint-matte'];
} 
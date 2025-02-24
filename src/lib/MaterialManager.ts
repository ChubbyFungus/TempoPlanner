import * as THREE from 'three';
import { createPBRMaterial } from './pbrMaterialManager';
import { createMaterial as createStandardMaterial } from '@/utils/materialUtils';
import type { MaterialPreset } from '@/types/shared';
import type { MaterialCategory, MaterialId, MaterialSettings } from '@/types/materials';

export type MaterialQuality = 'high' | 'medium' | 'low';

function adjustSettingsForQuality(settings: MaterialSettings, quality: MaterialQuality): MaterialSettings {
  const adjusted = { ...settings };
  switch (quality) {
    case 'medium':
      adjusted.roughness += 0.1;
      adjusted.metalness = Math.max(0, adjusted.metalness - 0.05);
      break;
    case 'low':
      adjusted.roughness += 0.2;
      adjusted.metalness = Math.max(0, adjusted.metalness - 0.1);
      break;
    default:
      break;
  }
  return adjusted;
}

class MaterialManager {
  async createMaterial(options: {
    preset?: MaterialPreset;
    category?: MaterialCategory;
    materialId?: MaterialId;
    settings?: Partial<MaterialSettings>;
    quality?: MaterialQuality;
  }): Promise<THREE.MeshStandardMaterial> {
    const qualityLevel = options.quality || 'high';

    if (options.preset) {
      // Merge the preset settings with any overriding settings
      const mergedSettings: MaterialSettings = {
        normalScale: options.preset.settings?.normalScale || 0.45,
        roughness: options.preset.settings?.roughness || 0.2,
        metalness: options.preset.settings?.metalness || 0.95,
        displacementScale: options.preset.settings?.displacementScale || 0.01,
        textureScale: options.preset.settings?.textureScale || { x: 2, y: 2 },
        ...options.settings,
      };
      const adjustedSettings = adjustSettingsForQuality(mergedSettings, qualityLevel);
      const material = await createPBRMaterial(options.preset.category as MaterialCategory, options.preset.materialId as MaterialId, adjustedSettings);
      return material;
    } else {
      // Use sensible defaults if no preset is provided
      const defaultCategory: MaterialCategory = options.category || 'appliances';
      const defaultMaterialId: MaterialId = options.materialId || 'stainlessSteel';
      const defaultSettings: MaterialSettings = {
        normalScale: 0.45,
        roughness: 0.2,
        metalness: 0.95,
        displacementScale: 0.01,
        textureScale: { x: 2, y: 2 },
      };
      const mergedSettings = { ...defaultSettings, ...options.settings };
      const adjustedSettings = adjustSettingsForQuality(mergedSettings, qualityLevel);
      const material = createStandardMaterial(defaultCategory, defaultMaterialId, adjustedSettings);
      return material;
    }
  }

  applyMaterialToModel(
    model: THREE.Object3D,
    options: {
      preset?: MaterialPreset;
      category?: MaterialCategory;
      materialId?: MaterialId;
      settings?: Partial<MaterialSettings>;
      quality?: MaterialQuality;
    }
  ): void {
    this.createMaterial(options)
      .then((material) => {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material.clone();
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      })
      .catch((err) => {
        console.error('Error applying material:', err);
      });
  }
}

const materialManager = new MaterialManager();
export default materialManager; 
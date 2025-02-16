import { Group, Mesh, MeshStandardMaterial } from 'three';
import { MaterialPreset, OverlayPreset } from '../types/shared';

export function applyMaterialPreset(model: Group, preset: MaterialPreset) {
  model.traverse((child) => {
    if (child instanceof Mesh) {
      const material = child.material as MeshStandardMaterial;
      if (material && material.isMeshStandardMaterial) {
        // Apply basic material properties
        material.roughness = preset.settings?.roughness ?? 0.5;
        material.metalness = preset.settings?.metalness ?? 0;
        
        // Apply normal map scale if it exists
        if (material.normalScale && preset.settings?.normalScale) {
          material.normalScale.setX(preset.settings.normalScale);
          material.normalScale.setY(preset.settings.normalScale);
        }

        // Apply displacement scale if it exists
        if (preset.settings?.displacementScale) {
          material.displacementScale = preset.settings.displacementScale;
        }
      }
    }
  });
}

export function applyOverlayPreset(model: Group, preset: OverlayPreset) {
  model.traverse((child) => {
    if (child instanceof Mesh) {
      const material = child.material as MeshStandardMaterial;
      if (material && material.isMeshStandardMaterial) {
        // For now, we'll just adjust opacity based on the overlay preset
        material.opacity = preset.opacity ?? 1;
        material.transparent = preset.opacity !== undefined && preset.opacity < 1;
      }
    }
  });
} 
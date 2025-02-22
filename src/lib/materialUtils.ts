import { THREE } from '@/lib/three';
import { MaterialPreset, OverlayPreset } from '../types/shared';

interface MaterialSettings {
  roughness?: number;
  metalness?: number;
  color?: string;
}

export function applyMaterialPreset(model: THREE.Group, preset: MaterialPreset) {
  if (!model) return;

  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      if (!material) return;

      switch (preset) {
        case 'matte':
          material.roughness = 0.9;
          material.metalness = 0.1;
          break;
        case 'gloss':
          material.roughness = 0.1;
          material.metalness = 0.8;
          break;
        case 'brushed':
          material.roughness = 0.5;
          material.metalness = 0.7;
          break;
      }
    }
  });
}

export function applyOverlayPreset(model: THREE.Group, preset: OverlayPreset) {
  if (!model) return;

  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      if (!material) return;

      switch (preset) {
        case 'highlight':
          material.emissive.setHex(0x666666);
          break;
        case 'selected':
          material.emissive.setHex(0x444444);
          break;
        case 'none':
          material.emissive.setHex(0x000000);
          break;
      }
    }
  });
}
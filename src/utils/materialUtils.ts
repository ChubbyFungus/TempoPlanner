import * as THREE from 'three';
import { MaterialCategory, MaterialId } from '@/types/materials';

interface MaterialSettings {
  normalScale: number;
  roughness: number;
  metalness: number;
  displacementScale: number;
}

interface OverlaySettings {
  angle: number;
  opacity: number;
  scale: number;
  strength: number;
}

export const createMaterial = (
  category: MaterialCategory,
  materialId: MaterialId,
  settings: MaterialSettings
) => {
  const material = new THREE.MeshStandardMaterial({
    roughness: settings.roughness,
    metalness: settings.metalness,
  });

  // Load textures based on category and materialId
  const textureLoader = new THREE.TextureLoader();
  const baseTexturePath = `/materials/${category}/${materialId}`;

  // Load normal map
  const normalMap = textureLoader.load(`${baseTexturePath}_normal.jpg`);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  material.normalMap = normalMap;
  material.normalScale.set(settings.normalScale, settings.normalScale);

  // Load displacement map if needed
  if (settings.displacementScale > 0) {
    const dispMap = textureLoader.load(`${baseTexturePath}_height.jpg`);
    dispMap.wrapS = dispMap.wrapT = THREE.RepeatWrapping;
    material.displacementMap = dispMap;
    material.displacementScale = settings.displacementScale;
  }

  return material;
};

export const applyOverlay = (
  mesh: THREE.Mesh,
  type: "brushed" | "matte" | "gloss" | "textured",
  settings: OverlaySettings
) => {
  const material = mesh.material as THREE.MeshStandardMaterial;
  
  // Load overlay texture
  const textureLoader = new THREE.TextureLoader();
  const overlayMap = textureLoader.load(`/overlays/${type}.jpg`);
  overlayMap.wrapS = overlayMap.wrapT = THREE.RepeatWrapping;
  
  // Apply settings
  overlayMap.rotation = settings.angle * (Math.PI / 180);
  overlayMap.repeat.set(settings.scale, settings.scale);
  
  // Apply overlay based on type
  switch (type) {
    case "brushed":
      material.roughnessMap = overlayMap;
      material.roughnessMap.rotation = settings.angle * (Math.PI / 180);
      break;
    case "matte":
      material.roughness = Math.min(material.roughness + settings.strength, 1);
      break;
    case "gloss":
      material.roughness = Math.max(material.roughness - settings.strength, 0);
      break;
    case "textured":
      material.normalMap = overlayMap;
      material.normalScale.set(settings.strength, settings.strength);
      break;
  }
  
  material.needsUpdate = true;
}; 
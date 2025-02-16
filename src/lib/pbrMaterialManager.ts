import * as THREE from 'three';
import { TextureLoader } from 'three';
import { MaterialCategory, MaterialId, PBRMaterial, MaterialTextures, MATERIAL_IDS } from '@/types/materials';

// Singleton texture loader
const textureLoader = new TextureLoader();

// Material cache
const materialCache = new Map<string, THREE.MeshStandardMaterial>();
const textureCache = new Map<string, THREE.Texture>();

// Default material settings
const DEFAULT_SETTINGS = {
  normalScale: 1.0,
  roughness: 0.5,
  metalness: 0.5,
  displacementScale: 0.1,
  textureScale: new THREE.Vector2(1, 1),
};

// Helper to get texture path
function getTexturePath(category: MaterialCategory, materialId: MaterialId, textureType: keyof MaterialTextures): string {
  return `/materials/${category}/${materialId}/${String(textureType)}.jpg`;
}

// Load and cache a texture
async function loadTexture(path: string): Promise<THREE.Texture> {
  if (textureCache.has(path)) {
    return textureCache.get(path)!;
  }

  return new Promise((resolve, reject) => {
    textureLoader.load(
      path,
      (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        textureCache.set(path, texture);
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}

// Load all textures for a material
async function loadMaterialTextures(
  category: MaterialCategory,
  materialId: MaterialId
): Promise<Record<keyof MaterialTextures, THREE.Texture>> {
  const textureTypes: (keyof MaterialTextures)[] = [
    'baseColorMap',
    'displacementMap',
    'normalMap',
    'roughnessMap',
    'metalnessMap'
  ];

  const textures = await Promise.all(
    textureTypes.map(async (type) => {
      const path = getTexturePath(category, materialId, type);
      return loadTexture(path);
    })
  );

  return Object.fromEntries(
    textureTypes.map((type, index) => [type, textures[index]])
  ) as Record<keyof MaterialTextures, THREE.Texture>;
}

// Create a PBR material
export async function createPBRMaterial(
  category: MaterialCategory,
  materialId: MaterialId,
  options: Partial<typeof DEFAULT_SETTINGS> = {}
): Promise<THREE.MeshStandardMaterial> {
  const cacheKey = `${category}-${materialId}-${JSON.stringify(options)}`;
  
  if (materialCache.has(cacheKey)) {
    return materialCache.get(cacheKey)!;
  }

  const settings = { ...DEFAULT_SETTINGS, ...options };
  const textures = await loadMaterialTextures(category, materialId);

  // Apply texture scaling
  Object.values(textures).forEach((texture: THREE.Texture) => {
    texture.repeat.copy(settings.textureScale);
  });

  const material = new THREE.MeshStandardMaterial({
    map: textures.baseColorMap,
    normalMap: textures.normalMap,
    normalScale: new THREE.Vector2(settings.normalScale, settings.normalScale),
    roughnessMap: textures.roughnessMap,
    roughness: settings.roughness,
    metalnessMap: textures.metalnessMap,
    metalness: settings.metalness,
    displacementMap: textures.displacementMap,
    displacementScale: settings.displacementScale,
  });

  materialCache.set(cacheKey, material);
  return material;
}

// Clear material and texture caches
export function clearMaterialCache() {
  materialCache.forEach((material) => {
    material.dispose();
  });
  materialCache.clear();

  textureCache.forEach((texture) => {
    texture.dispose();
  });
  textureCache.clear();
}

// Get all available materials for a category
export function getAvailableMaterials(category: MaterialCategory): MaterialId[] {
  return MATERIAL_IDS.filter(id => 
    // You might want to add a mapping of which materials belong to which category
    true // For now, return all materials
  );
}

// Preload commonly used materials
export async function preloadCommonMaterials() {
  const commonMaterials = [
    { category: 'appliances' as const, id: 'stainlessSteel' as MaterialId },
    { category: 'countertops' as const, id: 'granite' as MaterialId },
    { category: 'flooring' as const, id: 'hardwood' as MaterialId },
  ];

  await Promise.all(
    commonMaterials.map(({ category, id }) => createPBRMaterial(category, id))
  );
} 
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

  console.log('Attempting to load texture from:', path);

  return new Promise((resolve, reject) => {
    textureLoader.load(
      path,
      (texture) => {
        console.log('Successfully loaded texture from:', path);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        textureCache.set(path, texture);
        resolve(texture);
      },
      (progress) => {
        console.log('Loading texture progress:', path, Math.round((progress.loaded / progress.total) * 100) + '%');
      },
      (error) => {
        console.error('Failed to load texture:', path, error);
        reject(error);
      }
    );
  });
}

// Load all textures for a material
async function loadMaterialTextures(
  category: MaterialCategory,
  materialId: MaterialId
): Promise<Record<keyof MaterialTextures, THREE.Texture>> {
  console.log('Loading textures for material:', { category, materialId });
  
  const textureTypes: (keyof MaterialTextures)[] = [
    'baseColorMap',
    'displacementMap',
    'normalMap',
    'roughnessMap',
    'metalnessMap'
  ];

  try {
    const textures = await Promise.all(
      textureTypes.map(async (type) => {
        const path = getTexturePath(category, materialId, type);
        return loadTexture(path);
      })
    );

    console.log('Successfully loaded all textures for:', { category, materialId });

    return Object.fromEntries(
      textureTypes.map((type, index) => [type, textures[index]])
    ) as Record<keyof MaterialTextures, THREE.Texture>;
  } catch (error) {
    console.error('Failed to load textures for material:', { category, materialId, error });
    throw error;
  }
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
  
  // Create a basic material with appropriate settings for the material type
  const material = new THREE.MeshStandardMaterial({
    color: getMaterialColor(category, materialId),
    roughness: settings.roughness,
    metalness: settings.metalness,
  });

  materialCache.set(cacheKey, material);
  return material;
}

// Helper function to get appropriate colors for different materials
function getMaterialColor(category: MaterialCategory, materialId: MaterialId): THREE.Color {
  const materialColors = {
    appliances: {
      stainlessSteel: new THREE.Color(0xCCCCCC), // Light gray for stainless steel
    },
    countertops: {
      granite: new THREE.Color(0x666666), // Dark gray for granite
    },
    flooring: {
      hardwood: new THREE.Color(0x8B4513), // Saddle brown for hardwood
    },
  };

  return materialColors[category]?.[materialId] || new THREE.Color(0xCCCCCC);
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
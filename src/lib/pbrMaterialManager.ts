import * as THREE from "three";
import { TextureLoader } from "three";
import {
  MaterialCategory,
  MaterialId,
  PBRMaterial,
  MaterialTextures,
  MATERIAL_IDS,
} from "@/types/materials";

// Singleton texture loader
const textureLoader = new TextureLoader();

// Material cache
const materialCache = new Map<string, THREE.MeshStandardMaterial>();
const textureCache = new Map<string, THREE.Texture>();

// Default material settings
const DEFAULT_SETTINGS = {
  normalScale: 0.45,
  roughness: 0.2,
  metalness: 0.95,
  displacementScale: 0.01,
  textureScale: { x: 2, y: 2 },
};

// Helper to get texture path
function getTexturePath(
  category: MaterialCategory,
  materialId: MaterialId,
  textureType: keyof MaterialTextures,
): string {
  return `/materials/${category}/${materialId}/${String(textureType)}.jpg`;
}

// Load and cache a texture
async function loadTexture(path: string): Promise<THREE.Texture> {
  if (textureCache.has(path)) {
    return textureCache.get(path)!;
  }

  console.log("Attempting to load texture from:", path);

  return new Promise((resolve, reject) => {
    textureLoader.load(
      path,
      (texture) => {
        console.log("Successfully loaded texture from:", path);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        textureCache.set(path, texture);
        resolve(texture);
      },
      (progress) => {
        console.log(
          "Loading texture progress:",
          path,
          Math.round((progress.loaded / progress.total) * 100) + "%",
        );
      },
      (error) => {
        console.error("Failed to load texture:", path, error);
        reject(error);
      },
    );
  });
}

// Load all textures for a material
async function loadMaterialTextures(
  category: MaterialCategory,
  materialId: MaterialId,
): Promise<Record<keyof MaterialTextures, THREE.Texture>> {
  console.log("Loading textures for material:", { category, materialId });

  const textureTypes: (keyof MaterialTextures)[] = [
    "baseColorMap",
    "displacementMap",
    "normalMap",
    "roughnessMap",
    "metalnessMap",
  ];

  try {
    const textures = await Promise.all(
      textureTypes.map(async (type) => {
        const path = getTexturePath(category, materialId, type);
        return loadTexture(path);
      }),
    );

    console.log("Successfully loaded all textures for:", {
      category,
      materialId,
    });

    return Object.fromEntries(
      textureTypes.map((type, index) => [type, textures[index]]),
    ) as Record<keyof MaterialTextures, THREE.Texture>;
  } catch (error) {
    console.error("Failed to load textures for material:", {
      category,
      materialId,
      error,
    });
    throw error;
  }
}

// Create a PBR material
export async function createPBRMaterial(
  category: MaterialCategory,
  materialId: MaterialId,
  options: Partial<typeof DEFAULT_SETTINGS> = {},
): Promise<THREE.MeshStandardMaterial> {
  console.log("Creating PBR material with:", { category, materialId, options });

  // Validate inputs
  if (!category || !materialId) {
    console.warn("Missing category or materialId, using defaults:", {
      category,
      materialId,
    });
    category = category || "appliances";
    materialId = materialId || "stainlessSteel";
  }

  const cacheKey = `${category}-${materialId}-${JSON.stringify(options)}`;

  if (materialCache.has(cacheKey)) {
    console.log("Returning cached material for:", cacheKey);
    return materialCache.get(cacheKey)!;
  }

  const settings = { ...DEFAULT_SETTINGS, ...options };
  console.log("Using settings:", settings);

  // Create a basic material with appropriate settings for the material type
  const material = new THREE.MeshStandardMaterial({
    color: getMaterialColor(category, materialId),
    roughness: settings.roughness,
    metalness: settings.metalness,
  });

  // Apply texture scaling if provided
  if (settings.textureScale) {
    material.userData.textureScale = new THREE.Vector2(
      settings.textureScale.x,
      settings.textureScale.y,
    );
  }

  console.log(
    "Created material with color:",
    material.color,
    "and texture scale:",
    material.userData.textureScale,
  );
  materialCache.set(cacheKey, material);
  return material;
}

// Helper function to get appropriate colors for different materials
function getMaterialColor(
  category: MaterialCategory,
  materialId: MaterialId,
): THREE.Color {
  const materialColors = {
    appliances: {
      stainlessSteel: new THREE.Color(0xcccccc), // Light gray for stainless steel
      brushedSteel: new THREE.Color(0xb0b0b0), // Additional mapping for brushed steel
      liebherrMonolith: new THREE.Color(0xe8e8e8), // Slightly lighter gray for Liebherr
      subZeroStainless: new THREE.Color(0xd4d4d4), // Different shade of gray for Sub-Zero
      thermadorProfessional: new THREE.Color(0xc0c0c0), // Another gray variant for Thermador
      blackSteel: new THREE.Color(0x333333), // Added mapping for black steel (dark gray)
      glass: new THREE.Color(0xe0e0e0), // Added mapping for glass finish (light gray)
    },
    countertops: {
      granite: new THREE.Color(0x666666), // Dark gray for granite
      marble: new THREE.Color(0xf5f5f5), // Off-white for marble
      quartz: new THREE.Color(0xe0e0e0), // Light gray for quartz
    },
    flooring: {
      hardwood: new THREE.Color(0x8b4513), // Saddle brown for hardwood
      tile: new THREE.Color(0xd3d3d3), // Light gray for tile
      laminate: new THREE.Color(0xdeb887), // Burlywood for laminate
    },
  };

  const categoryColors = materialColors[category];
  if (!categoryColors) {
    console.warn(`Unknown category: ${category}, using default color`);
    return new THREE.Color(0xcccccc);
  }

  const color = categoryColors[materialId];
  if (!color) {
    console.warn(
      `Unknown materialId: ${materialId} for category: ${category}, using default color`,
    );
    return new THREE.Color(0xcccccc);
  }

  return color;
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
export function getAvailableMaterials(
  category: MaterialCategory,
): MaterialId[] {
  return MATERIAL_IDS.filter(
    (id) =>
      // You might want to add a mapping of which materials belong to which category
      true, // For now, return all materials
  );
}

// Preload commonly used materials
export async function preloadCommonMaterials() {
  const commonMaterials = [
    { category: "appliances" as const, id: "stainlessSteel" as MaterialId },
    { category: "countertops" as const, id: "granite" as MaterialId },
    { category: "flooring" as const, id: "hardwood" as MaterialId },
  ];

  await Promise.all(
    commonMaterials.map(({ category, id }) => createPBRMaterial(category, id)),
  );
}

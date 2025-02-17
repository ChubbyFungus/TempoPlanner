import { Cache, LOD, Group, Mesh, Material, BufferGeometry, BoxGeometry, MeshStandardMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Enable caching
Cache.enabled = true;

// Model quality levels
export const LOD_LEVELS = {
  HIGH: 0,    // Original quality
  MEDIUM: 1,  // 50% reduction
  LOW: 2,     // 75% reduction
} as const;

// Initialize Draco loader for compression
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

// Initialize GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Model manifest interface
interface ModelManifest {
  version: string;
  lastUpdated: string;
  models: {
    [brand: string]: {
      [quality: string]: {
        size: number;
        lastModified: string;
        path: string;
      };
    };
  };
}

let modelManifest: ModelManifest | null = null;

// Load model manifest
async function loadModelManifest(): Promise<ModelManifest> {
  if (modelManifest) {
    return modelManifest;
  }

  try {
    const response = await fetch('/models/manifest.json');
    if (!response.ok) {
      throw new Error(`Failed to load model manifest: ${response.statusText}`);
    }
    modelManifest = await response.json();
    return modelManifest;
  } catch (error) {
    console.error('Error loading model manifest:', error);
    throw error;
  }
}

// Get model path from manifest
export async function getModelPath(type: string, quality: keyof typeof LOD_LEVELS = 'HIGH'): Promise<string> {
  try {
    const manifest = await loadModelManifest();
    const normalizedType = type.toLowerCase();
    const brand = normalizedType.split('-')[0];
    
    // Check if brand exists in manifest
    if (manifest.models[brand] && manifest.models[brand][quality.toLowerCase()]) {
      return manifest.models[brand][quality.toLowerCase()].path;
    }
    
    console.warn(`Model not found for ${brand}/${quality}, using default`);
    return manifest.models.default[quality.toLowerCase()].path;
  } catch (error) {
    console.error('Error getting model path:', error);
    // Return a basic fallback path if manifest fails
    return `models/appliances/refrigerators/default/${quality.toLowerCase()}.glb`;
  }
}

// Create a placeholder model
function createPlaceholderModel(): Group {
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshStandardMaterial({ 
    color: 0xff0000,
    metalness: 0.5,
    roughness: 0.5
  });
  const mesh = new Mesh(geometry, material);
  const group = new Group();
  group.add(mesh);
  return group;
}

// Load model with progress tracking and error handling
export async function loadModelProgressively(
  type: string,
  onProgress?: (progress: number) => void
): Promise<Group> {
  try {
    const modelPath = await getModelPath(type, 'HIGH');
    console.log('Loading model from path:', modelPath);

    return new Promise((resolve, reject) => {
      gltfLoader.load(
        modelPath,
        (gltf) => {
          console.log('Model loaded successfully:', gltf);
          if (onProgress) onProgress(100);
          resolve(gltf.scene);
        },
        (progressEvent) => {
          if (progressEvent.lengthComputable && onProgress) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Failed to load model:', error);
    return createPlaceholderModel();
  }
}

// Preload common models
export async function preloadCommonModels() {
  try {
    const manifest = await loadModelManifest();
    const commonModels = ['default'];
    
    for (const model of commonModels) {
      if (manifest.models[model]) {
        const modelPath = manifest.models[model].low.path;
        Cache.add(modelPath, await loadModelProgressively(model));
        console.log(`Preloaded model: ${model}`);
      }
    }
  } catch (error) {
    console.error('Error preloading models:', error);
  }
} 
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Enable caching
THREE.Cache.enabled = true;

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
    // For refrigerator types, use the appropriate model based on brand
    if (type.includes('refrigerator') || type.includes('ice-maker') || type.includes('beverage-center') || type.includes('panel-ready')) {
      const brand = type.split('-')[0];
      const model = type.split('-')[1];
      
      // Handle Panel Ready models
      if (type.includes('panel-ready')) {
        const modelPath = `/models/appliances/3ds/${model.toUpperCase()}_3ds/high.glb`;
        try {
          const response = await fetch(modelPath, { method: 'HEAD' });
          if (response.ok) {
            return modelPath;
          }
        } catch (e) {
          console.warn(`Panel ready model not found for ${model}, using default`);
        }
      }
      
      // Handle Cove models
      if (brand === 'cove') {
        const modelPath = `/models/appliances/3ds/${model.toUpperCase()}_3ds/high.glb`;
        try {
          const response = await fetch(modelPath, { method: 'HEAD' });
          if (response.ok) {
            return modelPath;
          }
        } catch (e) {
          console.warn(`Cove model not found for ${model}, using default`);
        }
      }
      
      // Try brand-specific model
      const brandPath = `/models/appliances/refrigerators/${brand}/testglb.glb`;
      try {
        const response = await fetch(brandPath, { method: 'HEAD' });
        if (response.ok) {
          return brandPath;
        }
      } catch (e) {
        console.warn(`Brand specific model not found for ${brand}, using default`);
      }
      
      // Fallback to default model
      return "/models/appliances/refrigerators/default/high.glb";
    }
    
    // For other types, use the manifest
    const manifest = await loadModelManifest();
    const modelConfig = manifest[type];
    if (!modelConfig) {
      throw new Error(`No model configuration found for type: ${type}`);
    }
    
    return modelConfig[quality.toLowerCase()];
  } catch (error) {
    console.error('Error getting model path:', error);
    // Return default model as fallback
    return "/models/appliances/refrigerators/default/high.glb";
  }
}

// Create a placeholder model
function createPlaceholderModel(): THREE.Group {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xff0000,
    metalness: 0.5,
    roughness: 0.5
  });
  const mesh = new THREE.Mesh(geometry, material);
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

// Load model with progress tracking and error handling
export async function loadModelProgressively(
  type: string,
  onProgress?: (progress: number) => void
): Promise<THREE.Group> {
  try {
    const modelPath = await getModelPath(type, 'HIGH');
    console.log('Loading model from path:', modelPath);

    return new Promise((resolve, reject) => {
      gltfLoader.load(
        modelPath,
        (gltf) => {
          console.log('Model loaded successfully:', gltf);
          if (onProgress) onProgress(100);
          const group = new THREE.Group();
          group.add(gltf.scene);
          resolve(group);
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
        THREE.Cache.add(modelPath, await loadModelProgressively(model));
        console.log(`Preloaded model: ${model}`);
      }
    }
  } catch (error) {
    console.error('Error preloading models:', error);
  }
} 
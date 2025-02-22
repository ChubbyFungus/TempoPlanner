import { THREE } from './three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

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

// Initialize OBJ and MTL loaders
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

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
    console.log('[Model Path] Getting path for type:', type);
    const manifest = await loadModelManifest();
    console.log('[Model Path] Loaded manifest:', manifest);

    // Get model config from manifest
    const modelConfig = manifest.models[type];
    if (!modelConfig) {
      console.warn(`[Model Path] No model configuration found for type: ${type}`);
      return "/models/appliances/default/high.glb";
    }

    const qualityLevel = quality.toLowerCase() as Lowercase<keyof typeof LOD_LEVELS>;
    const modelData = modelConfig[qualityLevel];
    if (!modelData) {
      console.warn(`[Model Path] No ${qualityLevel} quality model found for type: ${type}`);
      return modelConfig.high.path; // Fallback to high quality
    }

    // Encode the path to handle spaces and special characters
    const encodedPath = modelData.path.split('/').map(segment => 
      encodeURIComponent(segment)
    ).join('/');
    
    console.log(`[Model Path] Found path for ${type}:`, encodedPath);
    return encodedPath;
  } catch (error) {
    console.error('[Model Path] Error getting model path:', error);
    return "/models/appliances/default/high.glb";
  }
}

// Path builder utility - DEPRECATED, use getModelPath instead
export const getApplianceModelPath = async (variant: string) => {
  console.log('[Model Path] Getting appliance path for variant:', variant);
  const type = `appliance-${variant}`;
  return getModelPath(type);
};

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
export const loadModelProgressively = async (
  type: string,
  onProgress?: (progress: number) => void
): Promise<THREE.Group> => {
  console.log('[Model Loading] Loading model:', type);

  // Get model path
  const modelPath = await getModelPath(type);
  console.log('[Model Loading] Using path:', modelPath);

  // Create a promise that resolves with the loaded model
  return new Promise((resolve, reject) => {
    if (!gltfLoader) {
      reject(new Error('GLTFLoader not initialized'));
      return;
    }

    // Ensure the path is properly encoded
    const encodedPath = encodeURI(modelPath);
    console.log('[Model Loading] Encoded path:', encodedPath);

    gltfLoader.load(
      encodedPath,
      (gltf) => {
        console.log('[Model Loading] GLTF loaded successfully:', gltf);
        resolve(gltf.scene);
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          onProgress?.(percent);
        }
      },
      (error) => {
        console.error('[Model Loading] Error:', error);
        reject(error);
      }
    );
  });
};

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
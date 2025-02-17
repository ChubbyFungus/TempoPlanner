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

// Create a placeholder model
function createPlaceholderModel() {
  const geometry = new BoxGeometry(1, 2, 1);
  const material = new MeshStandardMaterial({ color: 0xcccccc });
  const mesh = new Mesh(geometry, material);
  const group = new Group();
  group.add(mesh);
  return group;
}

// Model paths
export const MODEL_PATHS = {
  'sub-zero-refrigerator': {
    [LOD_LEVELS.HIGH]: 'models/appliances/refrigerators/sub-zero/high.glb',
    [LOD_LEVELS.MEDIUM]: 'models/appliances/refrigerators/sub-zero/medium.glb',
    [LOD_LEVELS.LOW]: 'models/appliances/refrigerators/sub-zero/low.glb',
  },
  'thermador-refrigerator': {
    [LOD_LEVELS.HIGH]: 'models/appliances/refrigerators/thermador/high.glb',
    [LOD_LEVELS.MEDIUM]: 'models/appliances/refrigerators/thermador/medium.glb',
    [LOD_LEVELS.LOW]: 'models/appliances/refrigerators/thermador/low.glb',
  },
  'liebherr-refrigerator': {
    [LOD_LEVELS.HIGH]: 'models/appliances/refrigerators/liebherr/high.glb',
    [LOD_LEVELS.MEDIUM]: 'models/appliances/refrigerators/liebherr/medium.glb',
    [LOD_LEVELS.LOW]: 'models/appliances/refrigerators/liebherr/low.glb',
  },
  'viking-refrigerator': {
    [LOD_LEVELS.HIGH]: 'models/appliances/refrigerators/viking/high.glb',
    [LOD_LEVELS.MEDIUM]: 'models/appliances/refrigerators/viking/medium.glb',
    [LOD_LEVELS.LOW]: 'models/appliances/refrigerators/viking/low.glb',
  },
  'miele-refrigerator': {
    [LOD_LEVELS.HIGH]: 'models/appliances/refrigerators/miele/high.glb',
    [LOD_LEVELS.MEDIUM]: 'models/appliances/refrigerators/miele/medium.glb',
    [LOD_LEVELS.LOW]: 'models/appliances/refrigerators/miele/low.glb',
  },
  // Default fallback model
  'default': {
    [LOD_LEVELS.HIGH]: 'models/appliances/default/high.glb',
    [LOD_LEVELS.MEDIUM]: 'models/appliances/default/medium.glb',
    [LOD_LEVELS.LOW]: 'models/appliances/default/low.glb',
  }
} as const;

// Initialize Draco loader for compression
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.preload();

// Initialize GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Model cache
const modelCache = new Map<string, Group>();

export function clearModelCache() {
  modelCache.forEach((model) => {
    model.traverse((child) => {
      if ((child as Mesh).geometry) {
        ((child as Mesh).geometry as BufferGeometry).dispose();
      }
      if ((child as Mesh).material) {
        ((child as Mesh).material as Material).dispose();
      }
    });
  });
  modelCache.clear();
}

// Get model path based on quality level
export function getModelPath(type: string, quality: keyof typeof LOD_LEVELS = 'HIGH'): string {
  // Extract brand from type (e.g., 'liebherr' from 'liebherr-refrigerator')
  const brand = type.split('-')[0];
  
  // Get the model paths for this brand, or use default if not found
  const modelPaths = MODEL_PATHS[`${brand}-refrigerator` as keyof typeof MODEL_PATHS] || MODEL_PATHS['default'];
  
  // Return the path for the requested quality level
  return modelPaths[LOD_LEVELS[quality]];
}

// Create LOD group for a model
export function createLODGroup(type: string): LOD {
  const lod = new LOD();
  const placeholderModel = createPlaceholderModel();
  lod.addLevel(placeholderModel, 0);
  return lod;
}

// Updated loadModelProgressively function
export async function loadModelProgressively(
  type: string, 
  onProgress?: (progress: number) => void
): Promise<Group> {
  const modelPath = getModelPath(type, 'HIGH');
  
  try {
    console.log('Starting GLB model load from:', modelPath);
    const gltf = await gltfLoader.loadAsync('/' + modelPath);
    console.log('GLB model loaded successfully:', gltf);
    if (onProgress) onProgress(100);
    return gltf.scene as Group;
  } catch (error) {
    console.error('Failed to load GLB model:', {
      modelPath,
      error: error instanceof Error ? error.message : String(error)
    });
    return createPlaceholderModel();
  }
}

// Preload common models
export function preloadCommonModels() {
  // No need to preload for now as we're using placeholder models
} 
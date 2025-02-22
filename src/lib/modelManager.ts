import { THREE, GLTFLoader, DRACOLoader, OBJLoader, MTLLoader } from './three';
import { createLogger } from './logger';

const logger = createLogger('ModelManager');

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
    logger.error('Error loading model manifest:', error);
    throw error;
  }
}

// Get model path from manifest
export async function getModelPath(type: string, quality: keyof typeof LOD_LEVELS = 'HIGH'): Promise<string> {
  logger.debug('Getting path for type:', type);
  
  try {
    const manifest = await loadModelManifest();
    logger.debug('Loaded manifest:', manifest);
    
    const modelConfig = manifest.models[type];
    if (!modelConfig) {
      logger.warn(`No model configuration found for type: ${type}`);
      return "/models/appliances/default/high.glb";
    }

    const qualityLevel = quality.toLowerCase() as Lowercase<keyof typeof LOD_LEVELS>;
    const modelData = modelConfig[qualityLevel];
    if (!modelData) {
      logger.warn(`No ${qualityLevel} quality model found for type: ${type}`);
      return modelConfig.high.path; // Fallback to high quality
    }

    const encodedPath = encodeURIComponent(modelData.path);
    logger.debug(`Found path for ${type}:`, encodedPath);
    
    return encodedPath;
  } catch (error) {
    logger.error('Failed to get model path:', {
      type,
      error: error instanceof Error ? error.message : String(error)
    });
    return "/models/appliances/default/high.glb";
  }
}

// Path builder utility - DEPRECATED, use getModelPath instead
export const getApplianceModelPath = async (variant: string) => {
  logger.debug('Getting appliance path for variant:', variant);
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
  logger.debug('Loading model:', type);

  // Get model path
  const modelPath = await getModelPath(type);
  logger.debug('Using path:', modelPath);

  // Create a promise that resolves with the loaded model
  return new Promise((resolve, reject) => {
    if (!gltfLoader) {
      reject(new Error('GLTFLoader not initialized'));
      return;
    }

    // Ensure the path is properly encoded
    const encodedPath = encodeURI(modelPath);
    logger.debug('Encoded path:', encodedPath);

    gltfLoader.load(
      encodedPath,
      (gltf) => {
        logger.info('GLTF loaded successfully:', {
          type,
          path: modelPath,
          scenes: gltf.scenes.length
        });
        resolve(gltf.scene);
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          onProgress?.(percent);
        }
      },
      (error) => {
        logger.error('Error:', error);
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
        logger.debug(`Preloaded model: ${model}`);
      }
    }
  } catch (error) {
    logger.error('Error preloading models:', error);
  }
}

export async function loadModel(type: string): Promise<THREE.Group> {
  logger.debug('Loading model:', type);
  
  try {
    const modelPath = await getModelPath(type);
    logger.debug('Using path:', modelPath);
    
    const loader = new GLTFLoader();
    const encodedPath = encodeURIComponent(modelPath);
    logger.debug('Encoded path:', encodedPath);
    
    const gltf = await loader.loadAsync(encodedPath);
    logger.info('GLTF loaded successfully:', {
      type,
      path: modelPath,
      scenes: gltf.scenes.length
    });
    
    return gltf.scene;
  } catch (error) {
    logger.error('Failed to load model:', {
      type,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

export async function preloadModels(models: string[]): Promise<void> {
  try {
    await Promise.all(
      models.map(async (model) => {
        await loadModel(model);
        logger.debug(`Preloaded model: ${model}`);
      })
    );
    logger.info('All models preloaded successfully', { count: models.length });
  } catch (error) {
    logger.error('Failed to preload models:', {
      models,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
} 
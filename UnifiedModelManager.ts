import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { createLogger } from './logger';

interface ModelData {
  size: number;
  lastModified: string;
  path: string;
}

interface ModelManifest {
  version: string;
  lastUpdated: string;
  models: Record<string, Record<string, ModelData>>;
}

export class UnifiedModelManager {
  private static instance: UnifiedModelManager;
  private logger = createLogger('UnifiedModelManager');
  private manifest: ModelManifest | null = null;
  private modelCache = new Map<string, THREE.Group>();

  // Loaders
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;

  private constructor() {
    // Initialize DRACO loader and preload the decoder files.
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    this.dracoLoader.preload();

    // Initialize GLTF loader and set the DRACO loader.
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  public static getInstance(): UnifiedModelManager {
    if (!UnifiedModelManager.instance) {
      UnifiedModelManager.instance = new UnifiedModelManager();
    }
    return UnifiedModelManager.instance;
  }

  async loadManifest(): Promise<ModelManifest> {
    if (this.manifest) return this.manifest!;
    try {
      const response = await fetch('/models/manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.statusText}`);
      }
      this.manifest = await response.json();
      return this.manifest!;
    } catch (error) {
      this.logger.error('Error loading manifest:', error);
      throw error;
    }
  }

  async getModelPath(type: string, quality: string = 'high'): Promise<string> {
    this.logger.debug('Getting model path for type:', type, quality);
    try {
      const manifest = await this.loadManifest();
      const modelConfig = manifest.models[type];
      if (!modelConfig) {
        this.logger.warn(`No configuration found for type "${type}". Using default model.`);
        return '/models/appliances/default/high.glb';
      }
      const qualityKey = quality.toLowerCase();
      const modelData = modelConfig[qualityKey];
      if (!modelData) {
        this.logger.warn(`No ${qualityKey} quality model for type "${type}". Falling back to high quality.`);
        return modelConfig['high'].path;
      }
      return encodeURIComponent(modelData.path);
    } catch (error) {
      this.logger.error('Failed to get model path:', error);
      return '/models/appliances/default/high.glb';
    }
  }

  async loadModel(
    type: string,
    quality: string = 'high',
    onProgress?: (progress: number) => void
  ): Promise<THREE.Group> {
    const cacheKey = `${type}-${quality}`;
    if (this.modelCache.has(cacheKey)) {
      this.logger.debug('Returning cached model for', cacheKey);
      return this.modelCache.get(cacheKey)!;
    }
    try {
      const modelPath = await this.getModelPath(type, quality);
      const progressCallback = onProgress ? (event: ProgressEvent<EventTarget>) => {
        if (event.total) {
          onProgress((event.loaded / event.total) * 100);
        }
      } : undefined;
      const result = await this.gltfLoader.loadAsync(modelPath, progressCallback);
      // GLTFLoader may return a GLTF object with a scene property; if present, cache that scene.
      const modelGroup = (result.scene || result) as THREE.Group;
      this.modelCache.set(cacheKey, modelGroup);
      return modelGroup;
    } catch (error) {
      this.logger.error(`Failed to load model for type "${type}" (quality: ${quality})`, error);
      throw error;
    }
  }
} 
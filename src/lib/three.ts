import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Configure DRACOLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

// Configure GLTFLoader with DRACO support
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Export configured instances
export const configuredLoaders = {
  dracoLoader,
  gltfLoader,
};

// Re-export Three.js and its types
export { THREE };
export { DRACOLoader, GLTFLoader, OrbitControls };

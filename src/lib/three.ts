import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Re-export everything from three
export * from 'three';

// Export the loaders
export { DRACOLoader, GLTFLoader };

// Configure DRACOLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Make sure these files are in your public directory

// Configure GLTFLoader with DRACO support
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

export { dracoLoader, gltfLoader };

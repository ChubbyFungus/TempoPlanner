// Central export point for Three.js to prevent multiple instances
import * as THREE from 'three';

// Export the namespace and commonly used types
export { THREE };
export type {
  Material,
  Mesh,
  Object3D,
  Scene,
  Group,
  MeshStandardMaterial,
  Vector2,
  Vector3,
  Color,
  WebGLRenderer,
  PerspectiveCamera,
  Box3,
  Texture
} from 'three';

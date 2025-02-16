import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import fs from 'fs';
import path from 'path';

// Create a basic refrigerator geometry
const geometry = new THREE.BoxGeometry(1, 2, 0.8);
const material = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  metalness: 0.9,
  roughness: 0.3
});

const mesh = new THREE.Mesh(geometry, material);
const scene = new THREE.Scene();
scene.add(mesh);

// Export the scene
const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (gltf) => {
    const output = JSON.stringify(gltf, null, 2);
    fs.writeFileSync(
      path.join(__dirname, '../../public/models/refrigerator_basic.gltf'),
      output
    );
  },
  {
    binary: false,
    embedImages: true,
    forcePowerOfTwoTextures: true,
    maxTextureSize: 1024
  }
); 
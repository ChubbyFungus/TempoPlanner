import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Creates and returns a configured instance of OrbitControls.
 * @param camera - The camera to attach to the controls.
 * @param domElement - The HTML element used for event listeners.
 * @returns A configured OrbitControls instance.
 */
export function createOrbitControls(camera: THREE.PerspectiveCamera, domElement: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.enablePan = false;
  controls.autoRotate = false;
  return controls;
}

/**
 * Updates the camera position and controls based on the provided 3D model.
 * Calculates the optimal camera distance and updates the orbit controls target.
 * @param model - The loaded 3D model.
 * @param camera - The perspective camera to update.
 * @param controls - The orbit controls to update.
 */
export function updateCameraForModel(model: THREE.Object3D, camera: THREE.PerspectiveCamera, controls: OrbitControls): void {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2) / 1.5);

  camera.position.set(
    center.x + cameraDistance * 0.5,
    center.y + cameraDistance * 0.3,
    center.z + cameraDistance
  );
  camera.lookAt(center);

  controls.target.copy(center);
  controls.minDistance = cameraDistance * 0.5;
  controls.maxDistance = cameraDistance * 2;
  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = Math.PI * 3 / 4;
  controls.update();
} 
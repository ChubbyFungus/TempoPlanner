import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createMaterial, applyOverlay } from '@/utils/materialUtils';
import { CanvasElement } from '@/types/shared';

interface ThreeCanvasProps {
  element: CanvasElement;
}

const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ element }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current || !element.materialPreset) return;

    // Apply material preset
    const material = createMaterial(
      element.materialPreset.category,
      element.materialPreset.materialId,
      element.materialPreset.settings
    );
    meshRef.current.material = material;

    // Apply overlay if available
    if (element.overlayPreset) {
      applyOverlay(meshRef.current, element.overlayPreset.type, element.overlayPreset);
    }
  }, [element]);

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[element.width, element.height, element.depth || 1]} />
    </mesh>
  );
};

export default ThreeCanvas; 
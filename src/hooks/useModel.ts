import { useMemo } from 'react';
import * as THREE from 'three';

// This is a simple stub for useModel hook. It returns a dummy THREE.Object3D based on the provided type.
export function useModel(type: string) {
  // Use useMemo instead of useState + useEffect to prevent unnecessary re-renders
  const model = useMemo(() => new THREE.Object3D(), [type]);
  return { model };
}

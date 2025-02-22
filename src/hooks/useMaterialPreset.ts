import { useMemo } from 'react';
import type { MaterialCategory, MaterialId } from '../types/materials';

// This is a simple stub for useMaterialPreset hook. Replace with actual logic as needed.
export function useMaterialPreset(type: string) {
  // Use useMemo instead of useState + useEffect to prevent unnecessary re-renders
  const materialPreset = useMemo(() => ({
    category: "appliances" as MaterialCategory,
    materialId: "stainlessSteel" as MaterialId,
    settings: {
      roughness: 0.5,
      metalness: 0.5,
      normalScale: 1
    }
  }), [type]); // Still depend on type in case we want to change presets based on type later

  return materialPreset;
}

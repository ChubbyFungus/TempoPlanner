import { useMemo } from 'react';

// This is a simple stub for useModel hook. It returns a dummy model object based on the provided type.
export function useModel(type: string) {
  // Use useMemo instead of useState + useEffect to prevent unnecessary re-renders
  const model = useMemo(() => ({ model: type + '.glb' }), [type]);
  return { model };
}

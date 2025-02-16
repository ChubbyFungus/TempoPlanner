import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { MaterialPreset, OverlayPreset } from '../types/shared';
import { loadModelProgressively } from '../lib/modelManager';
import { applyMaterialPreset, applyOverlayPreset } from '../lib/materialUtils';
import { Group } from 'three';

interface ThreeMaterialRendererProps {
  materialPreset?: MaterialPreset;
  overlayPreset?: OverlayPreset;
  modelType: string;
  width?: number;
  height?: number;
}

function Model({ modelType, materialPreset, overlayPreset }: ThreeMaterialRendererProps) {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    loadModelProgressively(modelType).then((model) => {
      // Clear existing children
      while (groupRef.current?.children.length! > 0) {
        groupRef.current?.remove(groupRef.current.children[0]);
      }
      
      // Add new model
      groupRef.current?.add(model);

      // Apply material and overlay presets
      if (materialPreset) {
        applyMaterialPreset(model, materialPreset);
      }
      if (overlayPreset) {
        applyOverlayPreset(model, overlayPreset);
      }
    });
  }, [modelType, materialPreset, overlayPreset]);

  return <group ref={groupRef} />;
}

export default function ThreeMaterialRenderer({ 
  materialPreset, 
  overlayPreset,
  modelType,
  width = 400,
  height = 400
}: ThreeMaterialRendererProps) {
  return (
    <div style={{ width, height }}>
      <Canvas>
        <Stage environment="city" intensity={0.5}>
          <Model 
            modelType={modelType}
            materialPreset={materialPreset}
            overlayPreset={overlayPreset}
          />
        </Stage>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
} 
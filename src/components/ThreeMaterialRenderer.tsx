import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { MaterialPreset, OverlayPreset } from '../types/shared';
import { loadModelProgressively } from '../lib/modelManager';
import { applyMaterialPreset, applyOverlayPreset } from '../lib/materialUtils';
import { Group, BoxGeometry, MeshBasicMaterial, Mesh, Box3 } from 'three';

interface ThreeMaterialRendererProps {
  materialPreset?: MaterialPreset;
  overlayPreset?: OverlayPreset;
  modelType: string | null;
  width?: number;
  height?: number;
  shouldLoadModel?: boolean;
}

function Model({ modelType, materialPreset, overlayPreset, shouldLoadModel }: ThreeMaterialRendererProps) {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    if (!shouldLoadModel) return;
    if (!modelType) {
      console.warn('No model selected, skipping model load');
      return;
    }

    const loadWithTimeout = Promise.race([
      loadModelProgressively(modelType || ''),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Model loading timed out")), 10000))
    ]);

    loadWithTimeout.then((model) => {
      const typedModel = model as Group;
      // Ensure model is centered and scaled appropriately
      typedModel.position.set(0, 0, 0);
      typedModel.scale.set(1, 1, 1);
      console.log('Model loaded successfully:', typedModel);
      console.log('Loaded model children count:', typedModel.children.length);
      
      // Compute bounding box dimensions
      const bbox = new Box3().setFromObject(typedModel);
      console.log('Model bounding box:', bbox.min, bbox.max);
      
      // If the model appears empty then trigger error to use placeholder
      if (typedModel.children.length === 0) {
        console.warn('Warning: Loaded model appears to be empty. Using placeholder instead.');
        throw new Error('Loaded model is empty');
      }
      
      // Clear existing children
      while (groupRef.current?.children.length > 0) {
        groupRef.current?.remove(groupRef.current.children[0]);
      }
      
      // Add new model
      groupRef.current?.add(typedModel);
      
      // Apply material and overlay presets
      if (materialPreset) {
        applyMaterialPreset(typedModel, materialPreset);
      }
      if (overlayPreset) {
        applyOverlayPreset(typedModel, overlayPreset);
      }
    }).catch((error) => {
      if (error instanceof Event) {
        console.error('Error event caught:', error);
        error = new Error(error.type);
      }
      console.error('Error loading model, using placeholder:', error);
      // Create a placeholder box model
      const placeholder = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshBasicMaterial({ color: 0xff0000 })
      );
      placeholder.position.set(0, 0, 0);
      console.log('Placeholder added:', placeholder);
      while (groupRef.current?.children.length > 0) {
        groupRef.current?.remove(groupRef.current.children[0]);
      }
      groupRef.current?.add(placeholder);
    });
  }, [modelType, materialPreset, overlayPreset, shouldLoadModel]);

  return <group ref={groupRef} />;
}

export default function ThreeMaterialRenderer({ 
  materialPreset, 
  overlayPreset,
  modelType,
  width = 400,
  height = 400,
  shouldLoadModel = true
}: ThreeMaterialRendererProps) {
  return (
    <div style={{ width, height }}>
      <Canvas>
        <Stage environment="city" intensity={0.5}>
          <Center>
            <Model 
              modelType={modelType}
              materialPreset={materialPreset}
              overlayPreset={overlayPreset}
              shouldLoadModel={shouldLoadModel}
            />
          </Center>
        </Stage>
        <OrbitControls makeDefault />
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
} 
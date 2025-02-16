import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { MaterialDefinition, MaterialOverlay } from '@/types/materials';

interface ThreeMaterialRendererProps {
  elementId: string;
  material: MaterialDefinition;
  overlay?: MaterialOverlay;
  width: number;
  height: number;
}

// Basic refrigerator geometry if no model is loaded
function RefrigeratorGeometry({ material, overlay }: { material: MaterialDefinition; overlay?: MaterialOverlay }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create material based on properties
  const threeMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(material.baseColor || '#FFFFFF'),
    metalness: material.metalness,
    roughness: material.roughness,
    clearcoat: material.reflectivity ? material.reflectivity * 0.5 : 0,
    clearcoatRoughness: material.roughness * 0.5,
    transparent: material.opacity !== undefined,
    opacity: material.opacity || 1,
  });

  // Rotate slowly for visualization
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} material={threeMaterial}>
      <boxGeometry args={[1, 2, 0.8]} />
    </mesh>
  );
}

export const ThreeMaterialRenderer: React.FC<ThreeMaterialRendererProps> = ({
  elementId,
  material,
  overlay,
  width,
  height,
}) => {
  return (
    <div style={{ width, height }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 3]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />
        <RefrigeratorGeometry material={material} overlay={overlay} />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
}; 
import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stage, PerspectiveCamera, useGLTF, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import { createPBRMaterial } from '@/lib/pbrMaterialManager';
import { getModelPath, createLODGroup, loadModelProgressively, preloadCommonModels } from '@/lib/modelManager';

// Preload common models on module load
preloadCommonModels();

// Loading Screen Component
function LoadingScreen() {
  const { progress, active } = useProgress();
  return active ? (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="text-lg font-bold">{progress.toFixed(0)}% loaded</div>
        <div className="text-sm text-gray-500">Loading {active ? 'high quality' : 'preview'} model...</div>
      </div>
    </Html>
  ) : null;
}

// Error Fallback Component
function ErrorFallback() {
  return (
    <Html center>
      <div className="text-red-500">
        Error loading model. Using fallback box.
      </div>
    </Html>
  );
}

// Fallback Box Component
function FallbackBox({ materialPreset }: { materialPreset: any }) {
  const material = React.useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#cccccc',
      roughness: materialPreset?.settings?.roughness || 0.5,
      metalness: materialPreset?.settings?.metalness || 0.5,
    });
  }, [materialPreset]);

  return (
    <mesh>
      <boxGeometry args={[1, 2, 1]} />
      <primitive object={material} />
    </mesh>
  );
}

// Model Component
function Model({ type, materialPreset }: { type: string; materialPreset: any }) {
  const modelPath = getModelPath(type);
  console.log('Attempting to load model from path:', modelPath);
  
  try {
    const { scene } = useGLTF(modelPath, true); // Added 'true' to enable error logging
    
    useEffect(() => {
      if (!scene || !materialPreset) return;
      
      console.log('Model loaded successfully:', scene);

      // Create and apply material
      createPBRMaterial(
        materialPreset.category,
        materialPreset.materialId,
        materialPreset.settings
      ).then(material => {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      });

      return () => {
        // Cleanup
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.dispose();
            child.geometry.dispose();
          }
        });
      };
    }, [scene, materialPreset]);

    return <primitive object={scene} scale={[0.01, 0.01, 0.01]} position={[0, -1, 0]} />;
  } catch (error) {
    console.error('Error loading model:', {
      error,
      modelPath,
    });
    return <FallbackBox materialPreset={materialPreset} />;
  }
}

interface ThreeMaterialRendererProps {
  elementId: string;
  materialPreset: any;
  width: number;
  height: number;
  type: string;
}

export const ThreeMaterialRenderer: React.FC<ThreeMaterialRendererProps> = ({
  elementId,
  materialPreset,
  width,
  height,
  type
}) => {
  return (
    <div style={{ width, height }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 3]} />
        <Stage 
          environment="apartment" 
          intensity={0.5}
          shadows={{ type: 'contact', opacity: 0.8, blur: 3 }}
          adjustCamera={false}
        >
          <React.Suspense fallback={<LoadingScreen />}>
            <ErrorBoundary fallback={<FallbackBox materialPreset={materialPreset} />}>
              <Model type={type} materialPreset={materialPreset} />
            </ErrorBoundary>
          </React.Suspense>
        </Stage>
      </Canvas>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Model loading error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
} 
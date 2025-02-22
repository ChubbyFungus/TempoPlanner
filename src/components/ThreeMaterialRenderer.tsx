import React, { useEffect, useRef, useState, memo, useMemo, useCallback } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { THREE } from '../lib/three';
import { getApplianceModelPath, loadModelProgressively } from '../lib/modelManager';
import { useModel } from '../hooks/useModel';
import { useMaterialPreset } from '../hooks/useMaterialPreset';
import { MaterialPreset } from '../types/shared';
import { MaterialCategory, MaterialId } from '../types/materials';
import { createPBRMaterial } from '../lib/pbrMaterialManager';

// Export commonly used Three.js types
export type Scene = THREE.Scene;
export type Group = THREE.Group;
export type Mesh = THREE.Mesh;
export type Material = THREE.Material;
export type MeshStandardMaterial = THREE.MeshStandardMaterial;
export type Vector2 = THREE.Vector2;
export type Vector3 = THREE.Vector3;
export type Color = THREE.Color;

interface ThreeMaterialRendererProps {
  width: number;
  height: number;
  type: string;
}

export const ThreeMaterialRenderer = memo(({ width, height, type }: ThreeMaterialRendererProps) => {
  // Generate unique instance ID
  const instanceId = useRef(Math.random().toString(36).substring(2, 10)).current;
  
  console.log(`[Props] Received dimensions: ${width}x${height}, type: ${type}`);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const loaderRef = useRef<GLTFLoader | null>(null);
  const dracoLoaderRef = useRef<DRACOLoader | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const { model } = useModel(type);
  const preset = useMaterialPreset(type);

  // Initialize loaders
  useEffect(() => {
    // Initialize DRACO loader first
    dracoLoaderRef.current = new DRACOLoader();
    dracoLoaderRef.current.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    dracoLoaderRef.current.preload();

    // Then initialize GLTF loader with DRACO
    loaderRef.current = new GLTFLoader();
    loaderRef.current.setDRACOLoader(dracoLoaderRef.current);
  }, []);

  // Initialize renderer
  useEffect(() => {
    console.log(`[Instance ${instanceId}] Initializing renderer`);

    if (!containerRef.current) {
      console.error(`[Instance ${instanceId}] No container ref`);
      return;
    }

    console.log(`[Instance ${instanceId}] Setting up Three.js scene`);

    const container = containerRef.current;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5); // Light gray background
    sceneRef.current = scene;

    // Create camera with proper aspect ratio
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Create and setup canvas
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvasRef.current = canvas;
    container.appendChild(canvas);

    // Create and setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height, false); // false to avoid setting canvas style
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Create and setup controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controls.autoRotate = false;
    controlsRef.current = controls;

    // Setup lighting
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // Back light
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, -5, -5);
    scene.add(backLight);

    console.log(`[Instance ${instanceId}] Three.js setup complete`, {
      scene,
      camera: camera.position,
      renderer: {
        size: { width: renderer.domElement.width, height: renderer.domElement.height },
        pixelRatio: renderer.getPixelRatio()
      }
    });

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    console.log(`[Instance ${instanceId}] Initial render complete`);

    // Cleanup
    return () => {
      console.log(`[Instance ${instanceId}] Starting cleanup`);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      if (controls) {
        controls.dispose();
      }

      if (renderer) {
        renderer.dispose();
        const gl = renderer.getContext();
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) loseContext.loseContext();
      }

      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }

      console.log(`[Instance ${instanceId}] Cleanup complete`);
    };
  }, [width, height, instanceId]);

  // Load model when type changes
  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      console.log(`[Instance ${instanceId}] Loading model for type:`, type);

      if (!sceneRef.current) {
        console.error(`[Instance ${instanceId}] Scene not initialized`);
        return;
      }

      if (!type.includes("appliance")) {
        console.log(`[Instance ${instanceId}] Not an appliance type, skipping`);
        setIsLoading(false);
        return;
      }

      if (!type.includes("315W-O")) {
        console.log(`[Instance ${instanceId}] Unsupported model type:`, type);
        setError('Unsupported model type');
        setIsLoading(false);
        return;
      }

      if (!loaderRef.current) {
        console.error(`[Instance ${instanceId}] GLTFLoader not initialized`);
        setError('Model loader not initialized');
        setIsLoading(false);
        return;
      }

      const modelType = type.includes("-LH") ? "315W-O-LH" : "315W-O-RH";
      console.log(`[Instance ${instanceId}] Determined model type:`, modelType);
      
      try {
        const modelPath = await getApplianceModelPath(modelType);
        if (!isMounted) return;
        console.log(`[Instance ${instanceId}] Loading model from path:`, modelPath);

        const result = await loadModelProgressively(
          `appliance-${modelType}`,
          (progress) => {
            if (!isMounted) return;
            console.log(`[Instance ${instanceId}] Loading progress: ${progress.toFixed(1)}%`);
            setLoadingProgress(progress);
          }
        );

        if (!isMounted) return;

        if (!result) {
          throw new Error('Model loading failed - no result returned');
        }

        console.log(`[Instance ${instanceId}] Model loaded:`, {
          uuid: result.uuid,
          type: result.type,
          children: result.children.length
        });

        // Clear existing scene except lights
        const lights = sceneRef.current.children.filter(
          child => child instanceof THREE.Light
        );
        sceneRef.current.clear();
        lights.forEach(light => sceneRef.current?.add(light));

        // Enable shadows on the model
        result.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Enhance materials if they exist
            if (child.material) {
              child.material.needsUpdate = true;
              child.material.side = THREE.DoubleSide;
              
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.roughness = 0.7;
                child.material.metalness = 0.3;
              }
            }
          }
        });

        // Add model to scene and set initial rotation
        result.rotation.set(0, Math.PI, 0); // Rotate 180 degrees around Y axis
        sceneRef.current.add(result);
        console.log(`[Instance ${instanceId}] Added model to scene`);

        // Adjust camera
        if (cameraRef.current && controlsRef.current) {
          const box = new THREE.Box3().setFromObject(result);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          console.log(`[Instance ${instanceId}] Model bounds:`, {
            center: center.toArray(),
            size: size.toArray()
          });

          // Calculate optimal camera position
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = cameraRef.current.fov * (Math.PI / 180);
          const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2) / 1.5);

          // Position camera at an angle
          cameraRef.current.position.set(
            center.x + cameraDistance * 0.5,  // Slightly to the right
            center.y + cameraDistance * 0.3,  // Slightly up
            center.z + cameraDistance         // In front
          );
          cameraRef.current.lookAt(center);

          // Update controls
          controlsRef.current.target.copy(center);
          controlsRef.current.minDistance = cameraDistance * 0.5;
          controlsRef.current.maxDistance = cameraDistance * 2;
          
          // Set initial control angles
          controlsRef.current.minPolarAngle = Math.PI / 4;    // Limit how high user can orbit
          controlsRef.current.maxPolarAngle = Math.PI * 3/4;  // Limit how low user can orbit
          controlsRef.current.update();

          console.log(`[Instance ${instanceId}] Camera adjusted:`, {
            position: cameraRef.current.position.toArray(),
            target: controlsRef.current.target.toArray(),
            distance: cameraDistance
          });
        }

        setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error(`[Instance ${instanceId}] Error loading model:`, error);
        setError(error instanceof Error ? error.message : String(error));
        setIsLoading(false);
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [type, instanceId, getApplianceModelPath, loadModelProgressively]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        overflow: 'hidden',
        background: '#f5f5f5'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '1rem',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Loading... ({loadingProgress.toFixed(1)}%)
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff0000',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '1rem',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Error: {error}
        </div>
      )}
    </div>
  );
});

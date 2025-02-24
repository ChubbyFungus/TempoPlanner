import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeMaterialRendererProps {
  width: number;
  height: number;
  type: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

// Check if we're in Storybook environment
const isStorybook = typeof window !== 'undefined' && (window as any)?.__STORYBOOK_PREVIEW__;

export const ThreeMaterialRenderer: React.FC<ThreeMaterialRendererProps> = ({ 
  width, 
  height, 
  type,
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 }
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;
    let frameId: number | null = null;

    try {
      // Create scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);

      // Create camera
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 2, 5);

      // Create renderer with basic settings
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      containerRef.current.appendChild(renderer.domElement);

      // Create controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // Add a simple cube for Storybook or when type is 'test-cube'
      if (isStorybook || type === 'test-cube') {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x44aa88,
          shininess: 60,
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Animate the cube
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          if (controls) controls.update();
          if (cube) {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
          }
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };
        animate();
      } else {
        // For non-Storybook environment, just render the scene
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          if (controls) controls.update();
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };
        animate();
      }

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Handle resize
      const handleResize = () => {
        if (!camera || !renderer || !containerRef.current) return;

        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
        if (controls) {
          controls.dispose();
        }
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize 3D renderer');
      console.error('ThreeMaterialRenderer Error:', err);
    }
  }, [width, height, type]);

  if (error) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5',
        color: 'red',
        padding: '1rem',
        textAlign: 'center',
      }}>
        Error: {error}
      </div>
    );
  }

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
    />
  );
};

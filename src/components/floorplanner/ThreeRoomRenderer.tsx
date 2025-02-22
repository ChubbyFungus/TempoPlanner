import React, { useEffect, useRef } from "react";
import { THREE } from '@/lib/three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Props {
  points: { x: number; y: number }[];
  wallHeight?: number;
  wallThickness?: number;
  viewMode?: "2d" | "3d";
  isPreview?: boolean;
}

const ThreeRoomRenderer: React.FC<Props> = ({
  points,
  wallHeight = 300,
  wallThickness = 20,
  viewMode = "2d",
  isPreview = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current || points.length < 3) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera based on view mode
    let camera;
    if (viewMode === "2d") {
      // Orthographic camera for 2D mode
      const frustumSize = 1000;
      const aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera = new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        1,
        10000,
      );
      camera.position.set(0, 1000, 0);
      camera.lookAt(0, 0, 0);
      camera.zoom = 0.5;
      camera.updateProjectionMatrix();
    } else {
      // Perspective camera for 3D mode
      camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        10000,
      );
      camera.position.set(wallHeight * 2, wallHeight * 2, wallHeight * 2);
      camera.lookAt(0, 0, 0);
    }
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setClearColor(0xffffff, isPreview ? 0.7 : 1);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add controls with mode-specific settings
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    if (viewMode === "2d") {
      controls.enableRotate = false;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      controls.maxPolarAngle = 0;
      controls.minPolarAngle = 0;
    } else {
      controls.enableRotate = !isPreview;
      controls.enablePan = !isPreview;
      controls.enableZoom = !isPreview;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      controls.minDistance = wallHeight;
      controls.maxDistance = wallHeight * 8;
      controls.maxPolarAngle = Math.PI / 2;
    }

    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(
      wallHeight * 2,
      wallHeight * 3,
      wallHeight * 2,
    );
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create floor
    const shape = new THREE.Shape();
    // Scale down the points to a reasonable size and center them
    const scale = 0.1;
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    shape.moveTo(
      (points[0].x - centerX) * scale,
      (points[0].y - centerY) * scale,
    );
    points.slice(1).forEach((point) => {
      shape.lineTo((point.x - centerX) * scale, (point.y - centerY) * scale);
    });
    shape.lineTo(
      (points[0].x - centerX) * scale,
      (points[0].y - centerY) * scale,
    );

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.2,
      opacity: isPreview ? 0.7 : 1,
      transparent: isPreview
    });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0.1,
      opacity: isPreview ? 0.7 : 1,
      transparent: isPreview
    });

    for (let i = 0; i < points.length; i++) {
      const start = points[i];
      const end = points[(i + 1) % points.length];

      const wallLength = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
      );
      const wallGeometry = new THREE.BoxGeometry(
        wallLength,
        wallHeight,
        wallThickness,
      );

      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.castShadow = true;
      wall.receiveShadow = true;

      // Position wall at midpoint between points
      wall.position.x = ((start.x + end.x) / 2 - centerX) * scale;
      wall.position.z = ((start.y + end.y) / 2 - centerY) * scale;
      wall.position.y = (wallHeight * scale) / 2;

      // Rotate wall to align with points
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      wall.rotation.y = angle;

      scene.add(wall);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (renderer) {
        const domElement = renderer.domElement;
        if (containerRef.current?.contains(domElement)) {
          containerRef.current.removeChild(domElement);
        }
        renderer.dispose();
      }
      if (scene) {
        scene.clear();
      }
    };
  }, [points, wallHeight, wallThickness, viewMode, isPreview]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default ThreeRoomRenderer;

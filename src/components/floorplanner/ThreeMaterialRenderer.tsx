import React, { useEffect, useRef, useState } from "react";
// Model viewer is loaded via script tag in index.html
import { MaterialPreset } from "@/types/shared";
import { createPBRMaterial } from "@/lib/pbrMaterialManager";
import { MaterialCategory, MaterialId } from "@/types/materials";
import { THREE } from "@/lib/three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          ar?: boolean;
          exposure?: string;
          "shadow-intensity"?: string;
          "environment-image"?: string;
          "camera-orbit"?: string;
          "field-of-view"?: string;
          style?: React.CSSProperties;
          onLoad?: React.ReactEventHandler<HTMLElement>;
          onError?: React.ReactEventHandler<HTMLElement>;
          "loading-strategy"?: "auto" | "lazy";
          poster?: string;
          "skybox-image"?: string;
          "interaction-prompt"?: string;
          "tone-mapping"?: string;
          "disable-zoom"?: boolean;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          intensity?: string;
          "rotation-per-second"?: string;
          "interaction-policy"?: "allow-when-focused" | "none";
        },
        HTMLElement
      >;
    }
  }
}

interface ThreeMaterialRendererProps {
  elementId: string;
  materialPreset?: MaterialPreset;
  width: number;
  height: number;
  type: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export const ThreeMaterialRenderer: React.FC<ThreeMaterialRendererProps> = ({
  elementId,
  materialPreset,
  width,
  height,
  type,
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 }
}) => {
  const modelViewerRef = useRef<HTMLElement>(null);
  const [modelPath, setModelPath] = useState<string>("");
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Match the room scale (see ThreeRoomRenderer.tsx line 124)
        const path = "/models/appliances/refrigerators/sub-zero/testglb.glb";
        setModelPath(path);
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };
    loadModel();
  }, [type]);

  useEffect(() => {
    const modelViewer = modelViewerRef.current as any;
    if (modelViewer && modelLoaded) {
      // Match the room scale (0.1 from ThreeRoomRenderer.tsx)
      const scale = 0.1;
      modelViewer.scale = `${scale} ${scale} ${scale}`;
      
      // Update position to match room coordinate system
      modelViewer.model.position.set(
        (position.x - 1000) * scale, // Adjust for the room offset
        0, // Keep at ground level
        (position.y - 1000) * scale  // Adjust for the room offset
      );
      
      // Update rotation
      modelViewer.model.rotation.set(0, rotation.y * (Math.PI / 180), 0);
    }
  }, [position, rotation, modelLoaded]);

  const applyMaterial = async (modelViewer: any, preset: MaterialPreset) => {
    try {
      const material = await createPBRMaterial(
        preset.category as MaterialCategory,
        preset.materialId as MaterialId,
        {
          normalScale: preset.settings?.normalScale || 0.45,
          roughness: preset.settings?.roughness || 0.2,
          metalness: preset.settings?.metalness || 0.95,
          displacementScale: preset.settings?.displacementScale || 0.01,
          textureScale: preset.settings?.textureScale || { x: 2, y: 2 },
        }
      );

      if (modelViewer.model) {
        modelViewer.model.traverse((child: any) => {
          if (child.isMesh) {
            child.material = material.clone();
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    } catch (error) {
      console.error("Error applying material:", error);
    }
  };

  return (
    <div style={{ width, height, position: "relative" }}>
      <model-viewer
        ref={modelViewerRef}
        src={modelPath}
        camera-controls={true}
        auto-rotate={false}
        shadow-intensity="1"
        exposure="1"
        environment-image="neutral"
        camera-orbit="45deg 55deg 2m"
        field-of-view="30deg"
        min-camera-orbit="auto auto 1.5m"
        max-camera-orbit="auto auto 10m"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
        onError={(e) => {
          console.error("Error loading model:", e);
          setModelPath("/models/appliances/refrigerators/default/high.glb");
        }}
        onLoad={(e) => {
          setModelLoaded(true);
          if (materialPreset) {
            applyMaterial(modelViewerRef.current, materialPreset);
          }
        }}
        loading-strategy="auto"
        interaction-prompt="none"
        disable-zoom={false}
      />
    </div>
  );
};

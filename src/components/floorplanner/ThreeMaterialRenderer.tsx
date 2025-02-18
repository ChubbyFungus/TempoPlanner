import React, { useEffect, useRef, useState } from "react";
// Model viewer is loaded via script tag in index.html
import { MaterialPreset } from "@/types/shared";
import { createPBRMaterial } from "@/lib/pbrMaterialManager";

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
}

export const ThreeMaterialRenderer: React.FC<ThreeMaterialRendererProps> = ({
  elementId,
  materialPreset,
  width,
  height,
  type,
}) => {
  const modelViewerRef = useRef<HTMLElement>(null);
  const [modelPath, setModelPath] = useState<string>(
    "/models/appliances/refrigerators/sub-zero/testglb.glb",
  );
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    console.log("ThreeMaterialRenderer mounted with props:", {
      elementId,
      width,
      height,
      type,
      materialPreset
    });
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading model for type:", type);
        // Use testglb.glb for all refrigerator models
        const path = "/models/appliances/refrigerators/sub-zero/testglb.glb";
        console.log("Setting model path to:", path);
        setModelPath(path);
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };

    loadModel();
  }, [type]);

  const handleError: React.ReactEventHandler<HTMLElement> = (event) => {
    console.error("Error loading model:", event);
    // If model loading fails, try to load the default model
    const defaultPath = "/models/appliances/refrigerators/default/high.glb";
    console.log("Falling back to default model:", defaultPath);
    setModelPath(defaultPath);
    setModelLoaded(false);
  };

  const handleLoad: React.ReactEventHandler<HTMLElement> = (event) => {
    console.log("Model loaded successfully for element:", elementId);
    const modelViewer = modelViewerRef.current as any;
    if (modelViewer && modelViewer.model) {
      console.log("Model viewer loaded with model:", {
        width: modelViewer.model.width,
        height: modelViewer.model.height
      });
      setModelLoaded(true);
      
      // Apply material immediately if we have a preset
      if (materialPreset) {
        applyMaterial(modelViewer, materialPreset).catch(console.error);
      }
    }
  };

  // Define applyMaterial function outside of useEffect
  const applyMaterial = async (modelViewer: any, preset: MaterialPreset) => {
    try {
      console.log("Applying material with preset:", preset);
      const material = await createPBRMaterial(
        preset.category || "appliances",
        preset.materialId || "stainlessSteel",
        {
          normalScale: preset.settings?.normalScale || 0.45,
          roughness: preset.settings?.roughness || 0.2,
          metalness: preset.settings?.metalness || 0.95,
          displacementScale: preset.settings?.displacementScale || 0.01,
          textureScale: preset.settings?.textureScale || {
            x: 2,
            y: 2,
          },
        },
      );

      if (modelViewer.model) {
        console.log("Applying material to model");
        const mesh = modelViewer.model;
        mesh.traverse((child: any) => {
          if (child.isMesh) {
            child.material = material.clone();
          }
        });
      }
    } catch (error) {
      console.error("Error applying material:", error);
    }
  };

  console.log("Rendering model-viewer with dimensions:", { width, height });

  return (
    <div style={{ width, height, position: "relative" }}>
      <model-viewer
        ref={modelViewerRef}
        src={modelPath}
        camera-controls={false}
        auto-rotate={false}
        rotation-per-second="0deg"
        interaction-policy="none"
        shadow-intensity="0"
        exposure="1"
        environment-image="neutral"
        camera-orbit="0deg 90deg 2.5m"
        field-of-view="30deg"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
        }}
        onError={handleError}
        onLoad={handleLoad}
        loading-strategy="auto"
        interaction-prompt="none"
        disable-zoom
        min-camera-orbit="0deg 90deg 2.5m"
        max-camera-orbit="0deg 90deg 2.5m"
      />
    </div>
  );
};

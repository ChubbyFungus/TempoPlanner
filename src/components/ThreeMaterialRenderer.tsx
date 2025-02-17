import React, { useEffect, useRef, useState } from "react";
// Model viewer is loaded via script tag in index.html
import { MaterialPreset } from "@/types/shared";
import { createPBRMaterial } from "@/lib/pbrMaterialManager";
// @ts-ignore
const ModelViewer = window["model-viewer"];

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
          reveal?: "auto" | "interaction" | "manual";
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

// Cache for model availability checks
const modelAvailabilityCache: Record<string, boolean> = {};

const ThreeMaterialRenderer: React.FC<ThreeMaterialRendererProps> = ({
  elementId,
  materialPreset,
  width,
  height,
  type,
}) => {
  const modelViewerRef = useRef<HTMLElement>(null);
  const [modelPath, setModelPath] = useState<string>(
    "/models/appliances/refrigerators/default/high.glb",
  );

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const loadModel = async () => {
      try {
        const brand = type.split("-")[0];
        let finalPath = "/models/appliances/refrigerators/default/high.glb";

        // Check cache first
        if (brand === "liebherr" && modelAvailabilityCache["liebherr"]) {
          finalPath = `/models/appliances/refrigerators/liebherr/leibherr.glb`;
        } else if (modelAvailabilityCache[brand]) {
          finalPath = `/models/appliances/refrigerators/${brand}/high.glb`;
        } else if (modelAvailabilityCache[brand] === undefined) {
          // Only check if we haven't cached a negative result
          try {
            const checkPath =
              brand === "liebherr"
                ? `/models/appliances/refrigerators/liebherr/leibherr.glb`
                : `/models/appliances/refrigerators/${brand}/high.glb`;

            const response = await fetch(checkPath, { method: "HEAD", signal });
            if (response.ok) {
              finalPath = checkPath;
              modelAvailabilityCache[brand] = true;
            } else {
              modelAvailabilityCache[brand] = false;
            }
          } catch (error) {
            if (!signal.aborted) {
              console.warn(`Error checking model for ${brand}:`, error);
              modelAvailabilityCache[brand] = false;
            }
          }
        }

        if (!signal.aborted) {
          setModelPath(finalPath);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Error in model loading:", error);
        }
      }
    };

    loadModel();

    return () => {
      controller.abort();
    };
  }, [type]);

  useEffect(() => {
    const applyMaterial = async () => {
      if (!modelViewerRef.current || !materialPreset) return;

      try {
        const material = await createPBRMaterial(
          materialPreset.category || "appliances",
          materialPreset.materialId || "stainlessSteel",
          {
            normalScale: materialPreset.settings?.normalScale || 0.45,
            roughness: materialPreset.settings?.roughness || 0.2,
            metalness: materialPreset.settings?.metalness || 0.95,
            displacementScale:
              materialPreset.settings?.displacementScale || 0.01,
            textureScale: materialPreset.settings?.textureScale || {
              x: 2,
              y: 2,
            },
          },
        );

        // Access the model-viewer's model and apply material
        const modelViewer = modelViewerRef.current as any;
        if (modelViewer.model) {
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

    applyMaterial();
  }, [materialPreset]);

  const handleError: React.ReactEventHandler<HTMLElement> = (event) => {
    console.error("Error loading model:", event);
    setModelPath("/models/appliances/refrigerators/default/high.glb");
  };

  const handleLoad: React.ReactEventHandler<HTMLElement> = () => {
    console.log("Model loaded successfully");
  };

  return (
    <div style={{ width, height }}>
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
        camera-orbit="0deg 0deg 2.5m"
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
        min-camera-orbit="0deg 0deg 2.5m"
        max-camera-orbit="0deg 0deg 2.5m"
      >
        <div
          slot="progress-bar"
          style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        >
          <div
            style={{
              width: "100%",
              height: "2px",
              background: "#ddd",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                background: "#4CAF50",
                transition: "width 0.3s",
                width: "0%",
              }}
            />
          </div>
        </div>
      </model-viewer>
    </div>
  );
};

export default ThreeMaterialRenderer;

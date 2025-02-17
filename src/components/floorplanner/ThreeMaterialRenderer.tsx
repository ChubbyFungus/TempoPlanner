import React, { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';
import { MaterialPreset } from '@/types/shared';
import { createPBRMaterial } from '@/lib/pbrMaterialManager';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          'camera-controls'?: boolean;
          'auto-rotate'?: boolean;
          ar?: boolean;
          exposure?: string;
          'shadow-intensity'?: string;
          'environment-image'?: string;
          'camera-orbit'?: string;
          'field-of-view'?: string;
          style?: React.CSSProperties;
          onLoad?: React.ReactEventHandler<HTMLElement>;
          onError?: React.ReactEventHandler<HTMLElement>;
          'loading-strategy'?: 'auto' | 'lazy';
          poster?: string;
          'skybox-image'?: string;
          'interaction-prompt'?: string;
          'tone-mapping'?: string;
          'disable-zoom'?: boolean;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          intensity?: string;
          'rotation-per-second'?: string;
          'interaction-policy'?: 'allow-when-focused' | 'none';
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
  type
}) => {
  const modelViewerRef = useRef<HTMLElement>(null);
  const [modelPath, setModelPath] = useState<string>('/models/appliances/refrigerators/default/high.glb');

  useEffect(() => {
    const loadModel = async () => {
      try {
        const brand = type.split('-')[0];
        // Special case for Liebherr
        if (brand === 'liebherr') {
          const liebherrPath = `/models/appliances/refrigerators/liebherr/leibherr.glb`;
          const liebherrResponse = await fetch(liebherrPath);
          
          if (liebherrResponse.ok) {
            setModelPath(liebherrPath);
            return;
          }
        }

        // For other brands or if Liebherr specific model fails
        const brandPath = `/models/appliances/refrigerators/${brand}/high.glb`;
        const brandResponse = await fetch(brandPath);
        
        if (brandResponse.ok) {
          setModelPath(brandPath);
        } else {
          // If brand model doesn't exist, fall back to default
          const defaultPath = '/models/appliances/refrigerators/default/high.glb';
          const defaultResponse = await fetch(defaultPath);
          
          if (defaultResponse.ok) {
            setModelPath(defaultPath);
          } else {
            console.error('Neither brand-specific nor default model could be found');
          }
        }
      } catch (error) {
        console.error('Error checking model availability:', error);
      }
    };

    loadModel();
  }, [type]);

  useEffect(() => {
    const applyMaterial = async () => {
      if (!modelViewerRef.current || !materialPreset) return;

      try {
        const material = await createPBRMaterial(
          materialPreset.category || 'appliances',
          materialPreset.materialId || 'stainlessSteel',
          {
            normalScale: materialPreset.settings?.normalScale || 0.45,
            roughness: materialPreset.settings?.roughness || 0.2,
            metalness: materialPreset.settings?.metalness || 0.95,
            displacementScale: materialPreset.settings?.displacementScale || 0.01,
            textureScale: materialPreset.settings?.textureScale || { x: 2, y: 2 }
          }
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
        console.error('Error applying material:', error);
      }
    };

    applyMaterial();
  }, [materialPreset]);

  const handleError: React.ReactEventHandler<HTMLElement> = (event) => {
    console.error('Error loading model:', event);
    // If model loading fails, try to load the default model
    setModelPath('/models/appliances/refrigerators/default/high.glb');
  };

  const handleLoad: React.ReactEventHandler<HTMLElement> = (event) => {
    console.log('Model loaded successfully');
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
          width: '100%', 
          height: '100%', 
          backgroundColor: 'transparent'
        }}
        onError={handleError}
        onLoad={handleLoad}
        loading-strategy="auto"
        interaction-prompt="none"
        disable-zoom
        min-camera-orbit="0deg 0deg 2.5m"
        max-camera-orbit="0deg 0deg 2.5m"
      >
        <div slot="progress-bar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ 
            width: '100%', 
            height: '2px', 
            background: '#ddd',
            position: 'relative' 
          }}>
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              background: '#4CAF50',
              transition: 'width 0.3s',
              width: '0%'
            }} />
          </div>
        </div>
      </model-viewer>
    </div>
  );
}; 
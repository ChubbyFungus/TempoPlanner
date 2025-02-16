import React from 'react';
import { MaterialDefinition, MaterialOverlay } from '@/types/materials';

interface MaterialRendererProps {
  elementId: string;
  material: MaterialDefinition;
  overlay?: MaterialOverlay;
  width: number;
  height: number;
  textureUrl?: string;
}

export const MaterialRenderer: React.FC<MaterialRendererProps> = ({
  elementId,
  material,
  overlay,
  width,
  height
}) => {
  const basePatternId = `pattern-${elementId}`;
  const overlayPatternId = `overlay-${elementId}`;
  const gradientId = `gradient-${elementId}`;
  const highlightId = `highlight-${elementId}`;

  return (
    <>
      <defs>
        {/* Base pattern */}
        <pattern
          id={basePatternId}
          patternUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <rect 
            width="1" 
            height="1" 
            fill={material.baseColor} 
          />
        </pattern>

        {/* Highlight gradient */}
        <linearGradient
          id={highlightId}
          gradientTransform="rotate(135)"
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
        </linearGradient>

        {/* Material overlay */}
        {overlay && (
          <>
            <linearGradient
              id={gradientId}
              gradientTransform={`rotate(${overlay.angle || 0})`}
            >
              {overlay.gradientColors.map((color, index) => (
                <stop
                  key={index}
                  offset={`${overlay.gradientStops[index] * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
            <pattern
              id={overlayPatternId}
              patternUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <rect width="1" height="1" fill={`url(#${gradientId})`} />
            </pattern>
          </>
        )}
      </defs>

      <g style={{ opacity: material.opacity || 1 }}>
        {/* Base material with highlight */}
        <rect
          width={width}
          height={height}
          fill={`url(#${basePatternId})`}
        />
        
        {/* Highlight layer */}
        <rect
          width={width}
          height={height}
          fill={`url(#${highlightId})`}
          style={{
            mixBlendMode: 'overlay',
            opacity: material.metalness * 0.8 + material.reflectivity * 0.2
          }}
        />

        {/* Material overlay */}
        {overlay && (
          <rect
            width={width}
            height={height}
            fill={`url(#${overlayPatternId})`}
            style={{
              mixBlendMode: overlay.blendMode,
              opacity: overlay.opacity
            }}
          />
        )}

        {/* Roughness adjustment */}
        <rect
          width={width}
          height={height}
          fill={material.baseColor}
          style={{
            mixBlendMode: 'color',
            opacity: material.roughness * 0.5
          }}
        />
      </g>
    </>
  );
}; 
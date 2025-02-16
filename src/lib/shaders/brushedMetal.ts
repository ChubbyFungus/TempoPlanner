import { ShaderMaterial, UniformsLib, UniformsUtils, Vector2 } from 'three';

// Vertex shader
const vertexShader = `
  #extension GL_OES_standard_derivatives : enable
  #include <common>
  #include <normal_pars_vertex>
  
  varying vec2 vUv;
  varying vec3 vViewPosition;
  varying vec3 vNormal;
  
  void main() {
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    #include <normal_vertex>
    #include <begin_vertex>
    #include <project_vertex>
    
    vUv = uv;
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
  }
`;

// Fragment shader
const fragmentShader = `
  #extension GL_OES_standard_derivatives : enable
  #include <common>
  
  uniform vec3 baseColor;
  uniform float roughness;
  uniform float metalness;
  uniform float brushAngle;
  uniform vec2 brushScale;
  uniform float brushStrength;
  
  varying vec2 vUv;
  varying vec3 vViewPosition;
  varying vec3 vNormal;
  
  // Brushed metal noise function
  float brushedNoise(vec2 uv) {
    float angle = radians(brushAngle);
    vec2 rotatedUV = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv * brushScale;
    return fract(sin(dot(rotatedUV, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    // Calculate view direction and reflection
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    vec3 reflection = reflect(-viewDir, normal);
    
    // Base metallic reflection
    float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 5.0);
    vec3 metalColor = mix(baseColor, vec3(1.0), fresnel * metalness);
    
    // Add brushed effect
    float brush = brushedNoise(vUv);
    float brushMask = smoothstep(0.4, 0.6, brush) * brushStrength;
    
    // Combine effects
    vec3 finalColor = mix(metalColor, metalColor * (0.8 + 0.2 * brush), brushMask);
    
    // Apply roughness
    finalColor = mix(finalColor, finalColor * (0.7 + 0.3 * brush), roughness);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class BrushedMetalMaterial extends ShaderMaterial {
  constructor(params: {
    baseColor?: number[];
    roughness?: number;
    metalness?: number;
    brushAngle?: number;
    brushScale?: number[];
    brushStrength?: number;
  } = {}) {
    const uniforms = {
      baseColor: { value: params.baseColor || [0.8, 0.8, 0.8] },
      roughness: { value: params.roughness || 0.5 },
      metalness: { value: params.metalness || 0.8 },
      brushAngle: { value: params.brushAngle || 45.0 },
      brushScale: { value: new Vector2(...(params.brushScale || [20.0, 20.0])) },
      brushStrength: { value: params.brushStrength || 0.5 }
    };

    super({
      uniforms,
      vertexShader,
      fragmentShader,
      lights: false,
      transparent: false
    });

    this.needsUpdate = true;
  }

  // Utility methods to update material properties
  setBaseColor(color: number[]) {
    this.uniforms.baseColor.value = color;
    this.needsUpdate = true;
  }

  setRoughness(value: number) {
    this.uniforms.roughness.value = value;
    this.needsUpdate = true;
  }

  setMetalness(value: number) {
    this.uniforms.metalness.value = value;
    this.needsUpdate = true;
  }

  setBrushAngle(value: number) {
    this.uniforms.brushAngle.value = value;
    this.needsUpdate = true;
  }

  setBrushScale(scale: number[]) {
    this.uniforms.brushScale.value.set(scale[0], scale[1]);
    this.needsUpdate = true;
  }

  setBrushStrength(value: number) {
    this.uniforms.brushStrength.value = value;
    this.needsUpdate = true;
  }
} 
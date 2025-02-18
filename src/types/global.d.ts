/// <reference types="vite/client" />
/// <reference types="three" />

// Model viewer types are not needed since we're using the script tag
declare module "three" {
  export * from 'three/src/Three';
}

declare module "three/examples/jsm/loaders/GLTFLoader" {
  import { Object3D, Scene } from 'three';
  
  export interface GLTF {
    scene: Scene;
    scenes: Scene[];
    animations: any[];
    cameras: any[];
    asset: any;
  }

  export class GLTFLoader {
    constructor();
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (error: ErrorEvent) => void
    ): void;
    setDRACOLoader(dracoLoader: any): this;
  }
}

declare module "three/examples/jsm/loaders/DRACOLoader" {
  export class DRACOLoader {
    constructor();
    setDecoderPath(path: string): this;
  }
}

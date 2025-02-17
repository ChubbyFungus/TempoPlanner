import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Document, NodeIO } from '@gltf-transform/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Refrigerator dimensions (in meters)
const DIMENSIONS = {
  'sub-zero': { width: 0.914, height: 2.134, depth: 0.610 },  // 36" x 84" x 24"
  'thermador': { width: 0.914, height: 2.032, depth: 0.610 }, // 36" x 80" x 24"
  'liebherr': { width: 0.914, height: 2.032, depth: 0.610 },  // 36" x 80" x 24"
  'viking': { width: 0.914, height: 2.134, depth: 0.610 },    // 36" x 84" x 24"
  'miele': { width: 0.914, height: 2.032, depth: 0.610 },     // 36" x 80" x 24"
  'default': { width: 0.914, height: 2.032, depth: 0.610 }    // 36" x 80" x 24"
};

// Create a basic refrigerator model
function createRefrigeratorModel(document, dimensions, quality = 'high') {
  const { width, height, depth } = dimensions;

  // Create vertices for a simple box
  const positions = new Float32Array([
    // Front face
    -width/2, -height/2,  depth/2,
     width/2, -height/2,  depth/2,
     width/2,  height/2,  depth/2,
    -width/2,  height/2,  depth/2,
    // Back face
    -width/2, -height/2, -depth/2,
    -width/2,  height/2, -depth/2,
     width/2,  height/2, -depth/2,
     width/2, -height/2, -depth/2,
    // Top face
    -width/2,  height/2, -depth/2,
    -width/2,  height/2,  depth/2,
     width/2,  height/2,  depth/2,
     width/2,  height/2, -depth/2,
    // Bottom face
    -width/2, -height/2, -depth/2,
     width/2, -height/2, -depth/2,
     width/2, -height/2,  depth/2,
    -width/2, -height/2,  depth/2,
    // Right face
     width/2, -height/2, -depth/2,
     width/2,  height/2, -depth/2,
     width/2,  height/2,  depth/2,
     width/2, -height/2,  depth/2,
    // Left face
    -width/2, -height/2, -depth/2,
    -width/2, -height/2,  depth/2,
    -width/2,  height/2,  depth/2,
    -width/2,  height/2, -depth/2,
  ]);

  const indices = new Uint16Array([
    0,  1,  2,    0,  2,  3,  // front
    4,  5,  6,    4,  6,  7,  // back
    8,  9,  10,   8,  10, 11, // top
    12, 13, 14,   12, 14, 15, // bottom
    16, 17, 18,   16, 18, 19, // right
    20, 21, 22,   20, 22, 23  // left
  ]);

  const normals = new Float32Array([
    // Front face
    0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
    // Back face
    0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
    // Top face
    0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
    // Bottom face
    0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
    // Right face
    1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
    // Left face
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
  ]);

  // Create buffer and accessors
  const buffer = document.createBuffer();

  const positionAccessor = document.createAccessor()
    .setArray(positions)
    .setType('VEC3')
    .setBuffer(buffer);

  const normalAccessor = document.createAccessor()
    .setArray(normals)
    .setType('VEC3')
    .setBuffer(buffer);

  const indicesAccessor = document.createAccessor()
    .setArray(indices)
    .setType('SCALAR')
    .setBuffer(buffer);

  // Create material
  const material = document.createMaterial()
    .setBaseColorFactor([0.8, 0.8, 0.8, 1.0])
    .setMetallicFactor(0.8)
    .setRoughnessFactor(0.2)
    .setName('Refrigerator');

  // Create primitive
  const primitive = document.createPrimitive()
    .setAttribute('POSITION', positionAccessor)
    .setAttribute('NORMAL', normalAccessor)
    .setIndices(indicesAccessor)
    .setMaterial(material);

  // Create mesh
  const mesh = document.createMesh()
    .addPrimitive(primitive)
    .setName('RefrigeratorMesh');

  // Create node
  const node = document.createNode()
    .setMesh(mesh)
    .setName('RefrigeratorNode');

  // Create scene and set as default
  const scene = document.createScene()
    .addChild(node)
    .setName('RefrigeratorScene');

  document.getRoot().setDefaultScene(scene);

  return document;
}

async function main() {
  try {
    const qualities = ['high', 'medium', 'low'];
    const io = new NodeIO();
    
    for (const [brand, dimensions] of Object.entries(DIMENSIONS)) {
      console.log(`Generating models for ${brand}...`);
      
      const dir = path.join(__dirname, '../public/models/appliances/refrigerators', brand);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      for (const quality of qualities) {
        const document = new Document();
        const model = createRefrigeratorModel(document, dimensions, quality);
        const filepath = path.join(dir, `${quality}.glb`);
        
        const glbBuffer = await io.writeBinary(model);
        fs.writeFileSync(filepath, glbBuffer);
        
        console.log(`Generated ${quality} quality model for ${brand}`);
      }
    }

    console.log('\nAll placeholder models generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the models in your application');
    console.log('2. Use the generated request templates to obtain official models');
    console.log('3. Replace placeholder models with official ones as they become available');

  } catch (error) {
    console.error('Error generating models:', error);
    process.exit(1);
  }
}

main(); 
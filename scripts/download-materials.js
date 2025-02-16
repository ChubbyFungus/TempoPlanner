const https = require('https');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

// Material definitions with their Ambient CG IDs
const MATERIALS = {
  appliances: {
    stainlessSteel: 'Metal032',
    blackSteel: 'Metal046',
    brushedSteel: 'Metal036',
    glass: 'Glass004',
  },
  countertops: {
    granite: 'Granite001',
    marble: 'Marble016',
    quartz: 'Stone024',
  },
  flooring: {
    hardwood: 'Wood085',
    tile: 'Tiles074',
    concrete: 'Concrete034',
  },
  walls: {
    paint: 'Plaster003',
    tile: 'Tiles037',
    wallpaper: 'Fabric042',
  },
};

// Texture types to download for each material
const TEXTURE_TYPES = [
  'Color',
  'Displacement',
  'Normal',
  'Roughness',
  'Metallic',
  'AmbientOcclusion',
];

const BASE_URL = 'https://ambientcg.com/get?file=';
const RESOLUTION = '2K';

async function downloadFile(url, outputPath) {
  try {
    await pipeline(
      https.get(url),
      fs.createWriteStream(outputPath)
    );
    console.log(`Downloaded: ${outputPath}`);
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
  }
}

async function downloadMaterials() {
  // Create base directories
  const baseDir = path.join(process.cwd(), 'public', 'materials');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // Download materials for each category
  for (const [category, materials] of Object.entries(MATERIALS)) {
    const categoryDir = path.join(baseDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    for (const [name, materialId] of Object.entries(materials)) {
      const materialDir = path.join(categoryDir, name);
      if (!fs.existsSync(materialDir)) {
        fs.mkdirSync(materialDir, { recursive: true });
      }

      // Download each texture type
      for (const textureType of TEXTURE_TYPES) {
        const fileName = `${materialId}_${textureType}_${RESOLUTION}.jpg`;
        const outputPath = path.join(materialDir, `${textureType.toLowerCase()}.jpg`);
        const url = `${BASE_URL}${fileName}`;

        await downloadFile(url, outputPath);
      }
    }
  }
}

// Generate TypeScript types and constants
function generateTypeScript() {
  const typesContent = `
// This file is auto-generated. Do not edit manually.
import { Vector2 } from 'three';

export interface MaterialTextures {
  color: string;
  displacement: string;
  normal: string;
  roughness: string;
  metallic: string;
  ambientOcclusion: string;
}

export interface PBRMaterial {
  id: string;
  name: string;
  category: string;
  textures: MaterialTextures;
  defaultScale: Vector2;
  defaultNormalScale: number;
  defaultRoughness: number;
  defaultMetalness: number;
  defaultDisplacementScale: number;
}

export const MATERIAL_CATEGORIES = ${JSON.stringify(Object.keys(MATERIALS), null, 2)} as const;

export const MATERIAL_IDS = {
${Object.entries(MATERIALS).map(([category, materials]) => `  ${category}: ${JSON.stringify(Object.keys(materials), null, 2)}`).join(',\n')}
} as const;

export type MaterialCategory = typeof MATERIAL_CATEGORIES[number];
export type MaterialId<T extends MaterialCategory> = typeof MATERIAL_IDS[T][number];
`;

  fs.writeFileSync(
    path.join(process.cwd(), 'src', 'types', 'materials.ts'),
    typesContent
  );
}

// Run the download
downloadMaterials()
  .then(() => {
    console.log('All materials downloaded successfully');
    generateTypeScript();
  })
  .catch((error) => {
    console.error('Failed to download materials:', error);
    process.exit(1);
  }); 
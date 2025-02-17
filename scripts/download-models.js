import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOD_LEVELS = ['high', 'medium', 'low'];
const BRANDS = ['sub-zero', 'thermador', 'liebherr', 'viking', 'miele'];

// Base URLs for different quality models (using self-contained GLB files)
const MODEL_URLS = {
  'default': {
    high: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb',
    medium: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb',
    low: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
  }
};

// Create URLs for each brand using the default model temporarily
BRANDS.forEach(brand => {
  MODEL_URLS[brand] = MODEL_URLS['default'];
});

const downloadFile = (url, brand, quality) => {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, '../public/models/appliances/refrigerators', brand);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Use .glb extension for binary GLTF files
    const filename = `${quality}.glb`;
    const filepath = path.join(dir, filename);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(filepath, buffer);
        console.log(`Downloaded ${brand}/${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

async function downloadModels() {
  try {
    // Create default model directory
    const defaultDir = path.join(__dirname, '../public/models/appliances/default');
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }

    // Download default models
    for (const quality of LOD_LEVELS) {
      await downloadFile(MODEL_URLS['default'][quality], 'default', quality);
    }

    // Download models for each brand
    for (const brand of BRANDS) {
      for (const quality of LOD_LEVELS) {
        await downloadFile(MODEL_URLS[brand][quality], brand, quality);
      }
    }

    console.log('All models downloaded successfully');
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

downloadModels(); 